import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import {
  WhatsAppAccountStatus,
  WhatsAppSessionStatus,
} from '../generated/prisma/enums';
import {
  WHATSAPP_PROVIDER,
  WhatsAppProvider,
} from './interfaces/whatsapp-provider.interface';
import {
  WHATSAPP_STATUS_EVENT,
  WhatsAppStatusEvent,
} from './events/whatsapp.events';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsAppProvider,
  ) {}

  // The account's `status` column reflects the last known state, but a
  // process restart drops every in-memory Baileys socket without touching
  // it — so on every restart, every previously-CONNECTED account is stale:
  // "CONNECTED" in the DB with no live socket behind it. Auto-reconnect
  // each one here using its still-valid session on disk, so a routine
  // restart doesn't silently strand every paired account until someone
  // notices sends are failing and manually clicks Connect again.
  //
  // Skipped entirely under NODE_ENV=test: every e2e spec file boots its own
  // fresh AppModule (and thus fires OnModuleInit again), which would
  // otherwise open a real Baileys connection to WhatsApp's servers once per
  // test file — a real external side effect a test run must never trigger.
  async onModuleInit() {
    if (this.config.get<string>('NODE_ENV') === 'test') return;

    const staleConnected = await this.prisma.whatsAppAccount.findMany({
      where: { status: WhatsAppAccountStatus.CONNECTED },
      select: { id: true, label: true },
    });
    for (const account of staleConnected) {
      this.provider.connect(account.id).catch((err: unknown) => {
        this.logger.warn(
          `Failed to auto-reconnect WhatsApp account ${account.label} (${account.id}): ${String(err)}`,
        );
      });
    }
  }

  list() {
    return this.prisma.whatsAppAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }
    return account;
  }

  async create(label: string, organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: { select: { maxWhatsAppAccounts: true, name: true } } },
    });
    // No plan assigned = no defined limit yet — unchanged (unlimited)
    // behavior for an org Super Admin hasn't put on a plan.
    if (organization?.plan) {
      const currentCount = await this.prisma.whatsAppAccount.count({
        where: { organizationId },
      });
      if (currentCount >= organization.plan.maxWhatsAppAccounts) {
        throw new BadRequestException(
          `Your "${organization.plan.name}" plan allows up to ${organization.plan.maxWhatsAppAccounts} WhatsApp account(s). Contact your platform administrator to raise this limit.`,
        );
      }
    }

    return this.prisma.whatsAppAccount.create({
      data: { label, organizationId },
    });
  }

  async connect(id: string) {
    await this.findOne(id);
    // Checked against the provider's actual live socket, not the DB's
    // `status` column — that column can say CONNECTED while genuinely
    // stale (e.g. right after a process restart, before onModuleInit's
    // reconnect above has finished), and trusting it there would block a
    // legitimate reconnect attempt with a false "already connected".
    if (this.provider.isConnected(id)) {
      throw new BadRequestException('Account is already connected');
    }

    await this.prisma.whatsAppSession.create({
      data: { accountId: id, status: WhatsAppSessionStatus.ACTIVE },
    });
    await this.provider.connect(id);
    return this.findOne(id);
  }

  async disconnect(id: string) {
    await this.findOne(id);
    await this.provider.disconnect(id);
    return this.findOne(id);
  }

  async remove(id: string) {
    const account = await this.findOne(id);
    if (account.status === WhatsAppAccountStatus.CONNECTED) {
      throw new BadRequestException(
        'Disconnect the account before deleting it',
      );
    }
    // Defensive cleanup: a previously-connected-then-disconnected account
    // can still have encrypted session files on disk even though there's
    // no live socket — discard them so nothing outlives the DB row.
    await this.provider.disconnect(id);
    try {
      await this.prisma.whatsAppAccount.delete({ where: { id } });
    } catch (err) {
      // Messages and campaigns reference this account without cascading —
      // deliberately, so a line's send history/campaigns don't vanish just
      // because the line itself is removed. Surface that as an actionable
      // 400 instead of letting the FK violation bubble up as a raw 500.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This account has messages or campaigns linked to it, so it can’t be deleted — that history needs to stay. Leave it disconnected instead if you no longer use it.',
        );
      }
      throw err;
    }
  }

  @OnEvent(WHATSAPP_STATUS_EVENT)
  async handleStatusEvent(event: WhatsAppStatusEvent) {
    const data: {
      status: WhatsAppAccountStatus;
      phoneNumber?: string;
      connectedAt?: Date;
      lastSeenAt?: Date;
    } = { status: event.status, lastSeenAt: new Date() };

    if (event.status === WhatsAppAccountStatus.CONNECTED) {
      data.connectedAt = new Date();
      if (event.phoneNumber) data.phoneNumber = event.phoneNumber;
    }

    await this.prisma.whatsAppAccount
      .update({ where: { id: event.accountId }, data })
      .catch((err: unknown) => {
        // Account may have been deleted mid-flight; not fatal.
        this.logger.warn(
          `Failed to persist status for ${event.accountId}: ${String(err)}`,
        );
      });

    if (event.status === WhatsAppAccountStatus.LOGGED_OUT) {
      await this.prisma.whatsAppSession.updateMany({
        where: {
          accountId: event.accountId,
          status: WhatsAppSessionStatus.ACTIVE,
        },
        data: { status: WhatsAppSessionStatus.REVOKED, revokedAt: new Date() },
      });
    }
  }
}

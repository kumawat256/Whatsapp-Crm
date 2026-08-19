import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination.dto';
import { QueryMessageUsageReportDto } from './dto/query-message-usage-report.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

export const CREDITS_PER_MESSAGE = 1;
const TREND_DAYS = 7;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function localDateLabel(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type MessageCreditSource =
  'MANUAL' | 'CAMPAIGN' | 'AUTOMATION' | 'UNKNOWN';

export interface MessageUsageReportRow {
  id: string;
  createdAt: Date;
  amount: number;
  balanceAfter: number;
  contactName: string | null;
  contactPhone: string | null;
  source: MessageCreditSource;
  campaignName: string | null;
  sentByUserName: string | null;
}

// Every method takes an explicit `organizationId` rather than reading it
// off the ambient tenant context — that keeps this working identically
// whether the caller is a tenant user acting on their own wallet, or Super
// Admin acting on a specific customer's wallet (whose own context has no
// organization at all). Callers source it from @CurrentUser() or, for
// background jobs, straight off the row (campaign/message) they're
// already holding.
@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(organizationId: string) {
    return this.getOrCreateWallet(organizationId);
  }

  async listTransactions(organizationId: string, query: QueryTransactionsDto) {
    const wallet = await this.getOrCreateWallet(organizationId);
    const where = {
      walletId: wallet.id,
      ...(query.type ? { type: query.type } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.creditTransaction.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.creditTransaction.count({ where }),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  /** This org's daily credits-consumed for the last TREND_DAYS days. */
  async getTrend(organizationId: string) {
    const wallet = await this.getOrCreateWallet(organizationId);
    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (TREND_DAYS - 1));
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    // One query for the whole window instead of one aggregate per day —
    // bucketed in memory since the row volume for a 7-day window is small.
    const transactions = await this.prisma.creditTransaction.findMany({
      where: {
        walletId: wallet.id,
        type: 'DEBIT',
        createdAt: { gte: rangeStart, lt: rangeEnd },
      },
      select: { createdAt: true, amount: true },
    });
    const creditsByDate = new Map<string, number>();
    for (const t of transactions) {
      const label = localDateLabel(t.createdAt);
      creditsByDate.set(label, (creditsByDate.get(label) ?? 0) + t.amount);
    }

    const results: { date: string; creditsConsumed: number }[] = [];
    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const label = localDateLabel(dayStart);
      results.push({ date: label, creditsConsumed: creditsByDate.get(label) ?? 0 });
    }

    return results;
  }

  /** Super Admin top-up: increases the wallet balance and records a CREDIT transaction. */
  async topup(
    organizationId: string,
    amount: number,
    reason: string | undefined,
    createdByUserId: string,
  ) {
    const wallet = await this.getOrCreateWallet(organizationId);
    const updated = await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });
    await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        organizationId,
        type: 'CREDIT',
        amount,
        reason: reason ?? 'Manual top-up',
        balanceAfter: updated.balance,
        createdByUserId,
      },
    });
    return updated;
  }

  /** Friendly pre-flight check — call before attempting a chargeable action. The real guarantee is the atomic conditional update inside `debit()`. */
  async assertSufficientBalance(
    organizationId: string,
    amount: number,
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(organizationId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient credits');
    }
  }

  /**
   * Deducts `amount` and records a DEBIT transaction. Call only after the
   * chargeable action succeeded.
   *
   * The balance check and the decrement happen in one atomic conditional
   * update (`WHERE id = ? AND balance >= ?`) rather than as a separate
   * check-then-act pair, so two concurrent debits against the same wallet
   * can never both pass a stale check and drive the balance negative — the
   * second one re-evaluates against the already-decremented row and fails
   * cleanly if it no longer qualifies.
   */
  async debit(
    organizationId: string,
    amount: number,
    reason: string,
    referenceType?: string,
    referenceId?: string,
    createdByUserId?: string,
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(organizationId);

    let updated;
    try {
      updated = await this.prisma.creditWallet.update({
        where: { id: wallet.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new BadRequestException('Insufficient credits');
      }
      throw err;
    }

    await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        organizationId,
        type: 'DEBIT',
        amount,
        reason,
        referenceType,
        referenceId,
        balanceAfter: updated.balance,
        createdByUserId,
      },
    });
  }

  /**
   * Atomically reserves `amount` off the balance — same race-safe
   * conditional-update guarantee as `debit()` — but deliberately writes NO
   * ledger entry yet. Used to close the check-then-send race for an action
   * (like a WhatsApp send) whose outcome isn't known until after it's
   * dispatched: reserve the credit first so a second concurrent request
   * can't also pass a stale balance check, then call `recordDebit()` if it
   * succeeds or `release()` if it doesn't. Never call this directly for an
   * action that's already known to have succeeded — use `debit()` instead,
   * which reserves and records in one step.
   */
  async reserve(organizationId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(organizationId);
    try {
      await this.prisma.creditWallet.update({
        where: { id: wallet.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new BadRequestException('Insufficient credits');
      }
      throw err;
    }
  }

  /**
   * Undoes a `reserve()` that never got recorded — the reserved action
   * failed, so give the credit back. Deliberately writes no ledger entry
   * either: nothing chargeable ever actually happened, so this pair must
   * leave zero trace in the transaction history (a failed send must not
   * show up in the message-usage report as if it were a real charge).
   */
  async release(organizationId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(organizationId);
    await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });
  }

  /**
   * Records the permanent ledger entry for an amount already taken off the
   * balance by a prior `reserve()` — does NOT touch the balance itself.
   * Call once the reserved action has actually succeeded.
   */
  async recordDebit(
    organizationId: string,
    amount: number,
    reason: string,
    referenceType?: string,
    referenceId?: string,
    createdByUserId?: string,
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(organizationId);
    await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        organizationId,
        type: 'DEBIT',
        amount,
        reason,
        referenceType,
        referenceId,
        balanceAfter: wallet.balance,
        createdByUserId,
      },
    });
  }

  /**
   * Per-message credit usage — one row per DEBIT transaction, enriched with
   * who the message went to and where the send was triggered from. "Source"
   * is derived, not stored: a message with a CampaignRecipient came from a
   * campaign; otherwise sentByUserId set means a human sent it from the
   * Inbox; neither means an automation fired it (the only other caller of
   * the shared send path). Every credit-charging send already goes through
   * that one path (ConversationsService.sendMessage), so this report is
   * automatically complete — there's no separate bookkeeping to fall out of
   * sync with.
   */
  async messageUsageReport(
    organizationId: string,
    query: QueryMessageUsageReportDto,
  ) {
    const wallet = await this.getOrCreateWallet(organizationId);
    const where = {
      walletId: wallet.id,
      type: 'DEBIT' as const,
      referenceType: 'Message',
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.creditTransaction.count({ where }),
    ]);

    const messageIds = transactions
      .map((t) => t.referenceId)
      .filter((id): id is string => !!id);
    const messages = await this.prisma.message.findMany({
      where: { id: { in: messageIds } },
      include: {
        conversation: { include: { contact: true } },
        sentBy: { select: { firstName: true, lastName: true } },
        campaignRecipient: {
          include: { campaign: { select: { name: true } } },
        },
      },
    });
    const messageById = new Map(messages.map((m) => [m.id, m]));

    const data: MessageUsageReportRow[] = transactions.map((tx) => {
      const message = tx.referenceId
        ? messageById.get(tx.referenceId)
        : undefined;
      let source: MessageCreditSource = 'UNKNOWN';
      if (message) {
        if (message.campaignRecipient) source = 'CAMPAIGN';
        else if (message.sentByUserId) source = 'MANUAL';
        else source = 'AUTOMATION';
      }
      return {
        id: tx.id,
        createdAt: tx.createdAt,
        amount: tx.amount,
        balanceAfter: tx.balanceAfter,
        contactName: message
          ? `${message.conversation.contact.firstName} ${message.conversation.contact.lastName ?? ''}`.trim()
          : null,
        contactPhone: message?.conversation.contact.phoneNumber ?? null,
        source,
        campaignName: message?.campaignRecipient?.campaign.name ?? null,
        sentByUserName: message?.sentBy
          ? `${message.sentBy.firstName} ${message.sentBy.lastName ?? ''}`.trim()
          : null,
      };
    });

    return paginate(data, total, query.page, query.pageSize);
  }

  private async getOrCreateWallet(organizationId: string) {
    // Guards against a Super Admin (organizationId null on their own
    // session) accidentally hitting a tenant-facing credits endpoint and
    // silently creating an orphaned wallet with no owner.
    if (!organizationId) {
      throw new BadRequestException(
        'An organization context is required for credit operations',
      );
    }
    // Two concurrent first-ever requests for the same organization's wallet
    // (e.g. the admin UI fetching wallet + transactions in parallel) can
    // both find nothing and race to create one. upsert() narrows the
    // window but isn't a guarantee under this driver adapter, so on a
    // unique-constraint conflict we just re-fetch the row the other
    // request created instead of failing the request.
    try {
      return await this.prisma.creditWallet.upsert({
        where: { organizationId },
        create: { organizationId, balance: 0 },
        update: {},
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return this.prisma.creditWallet.findUniqueOrThrow({
          where: { organizationId },
        });
      }
      throw err;
    }
  }
}

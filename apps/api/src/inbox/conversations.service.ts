import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { paginate } from '../common/pagination.dto';
import {
  CREDITS_PER_MESSAGE,
  CreditsService,
} from '../credits/credits.service';
import { MediaService } from '../media/media.service';
import {
  MessageStatus,
  WhatsAppAccountStatus,
} from '../generated/prisma/enums';
import {
  WHATSAPP_PROVIDER,
  WhatsAppProvider,
} from '../whatsapp/interfaces/whatsapp-provider.interface';
import {
  WHATSAPP_INCOMING_MESSAGE_EVENT,
  WHATSAPP_MESSAGE_STATUS_EVENT,
  WhatsAppIncomingMessageEvent,
  WhatsAppMessageStatusEvent,
} from '../whatsapp/events/whatsapp.events';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  INBOX_CONVERSATION_EVENT,
  INBOX_MESSAGE_EVENT,
  InboxConversationEvent,
  InboxMessageEvent,
} from './events/inbox.events';

const conversationInclude = {
  contact: true,
  whatsAppAccount: {
    select: { id: true, label: true, phoneNumber: true, status: true },
  },
  assignedTo: { select: { id: true, firstName: true, lastName: true } },
} as const;

const messageInclude = { media: true } as const;

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly mediaService: MediaService,
    private readonly creditsService: CreditsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsAppProvider,
  ) {}

  async findAll(query: QueryConversationsDto) {
    const where = {
      ...(query.assignedToUserId
        ? { assignedToUserId: query.assignedToUserId }
        : {}),
      ...(query.whatsAppAccountId
        ? { whatsAppAccountId: query.whatsAppAccountId }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        include: conversationInclude,
        orderBy: { lastMessageAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: conversationInclude,
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async messages(conversationId: string, query: QueryConversationsDto) {
    await this.findOne(conversationId);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { conversationId },
        include: messageInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async createConversation(
    contactId: string,
    whatsAppAccountId: string,
    organizationId: string,
  ) {
    // Both lookups are tenant-scoped by the Prisma extension, so a
    // caller-supplied id from another organization 404s here instead of
    // ever reaching create() — without this check, a cross-tenant id pair
    // could either collide with another org's existing conversation (unique
    // constraint on whatsAppAccountId+contactId) or, worse, create a new
    // conversation row that points at another org's contact/account while
    // being tagged with the caller's own organizationId.
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { id: whatsAppAccountId },
    });
    if (!account) throw new NotFoundException('WhatsApp account not found');

    const existing = await this.prisma.conversation.findUnique({
      where: { whatsAppAccountId_contactId: { whatsAppAccountId, contactId } },
      include: conversationInclude,
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { contactId, whatsAppAccountId, organizationId },
      include: conversationInclude,
    });
  }

  async markRead(id: string) {
    await this.findOne(id);
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 },
      include: conversationInclude,
    });
    this.eventEmitter.emit(
      INBOX_CONVERSATION_EVENT,
      new InboxConversationEvent(conversation),
    );
    return conversation;
  }

  async assign(id: string, dto: AssignConversationDto) {
    await this.findOne(id);
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { assignedToUserId: dto.assignedToUserId ?? null },
      include: conversationInclude,
    });
    this.eventEmitter.emit(
      INBOX_CONVERSATION_EVENT,
      new InboxConversationEvent(conversation),
    );
    return conversation;
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
    sentByUserId: string,
  ) {
    const conversation = await this.findOne(conversationId);

    if (conversation.contact.isOptedOut) {
      throw new BadRequestException('This contact has opted out of messages');
    }
    if (
      conversation.whatsAppAccount.status !== WhatsAppAccountStatus.CONNECTED
    ) {
      throw new BadRequestException('WhatsApp account is not connected');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { id: conversation.organizationId! },
      select: { planExpiresAt: true },
    });
    if (organization?.planExpiresAt && organization.planExpiresAt < new Date()) {
      throw new BadRequestException(
        'Your plan has expired. Contact your platform administrator to renew.',
      );
    }
    // Fast, friendly pre-check so an obviously-empty wallet doesn't even
    // create a message row — the real, race-safe guarantee is the atomic
    // reserve below.
    await this.creditsService.assertSufficientBalance(
      conversation.organizationId!,
      CREDITS_PER_MESSAGE,
    );

    let mediaRecord = null;
    if (dto.mediaId) {
      mediaRecord = await this.mediaService.findOne(dto.mediaId);
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        whatsAppAccountId: conversation.whatsAppAccountId,
        organizationId: conversation.organizationId!,
        direction: 'OUTBOUND',
        type: dto.type,
        content: dto.type === 'TEXT' ? dto.content : (dto.caption ?? null),
        status: MessageStatus.PENDING,
        mediaId: dto.mediaId,
        sentByUserId,
      },
      include: messageInclude,
    });

    // Reserve the credit atomically BEFORE dispatching to the provider —
    // this is what actually closes the race: two concurrent sends can both
    // pass the pre-check above with only one credit left, but only one of
    // them can win this atomic decrement. The loser fails here, before ever
    // reaching WhatsApp. Deliberately not `debit()` — no ledger entry yet,
    // since the send hasn't happened. Finalized below: recordDebit() on
    // success, release() (also no ledger entry) if the send fails, so a
    // failed send leaves zero trace in the credit history.
    try {
      await this.creditsService.reserve(
        conversation.organizationId!,
        CREDITS_PER_MESSAGE,
      );
    } catch (err) {
      const failed = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        include: messageInclude,
      });
      this.eventEmitter.emit(INBOX_MESSAGE_EVENT, new InboxMessageEvent(failed));
      return failed;
    }

    try {
      const result =
        dto.type === 'TEXT'
          ? await this.provider.sendTextMessage(
              conversation.whatsAppAccountId,
              conversation.contact.phoneNumber,
              dto.content!,
            )
          : await this.provider.sendMediaMessage(
              conversation.whatsAppAccountId,
              conversation.contact.phoneNumber,
              {
                type: mediaRecord!.type,
                filePath: this.mediaService.absolutePath(mediaRecord!.filePath),
                mimeType: mediaRecord!.mimeType,
                fileName: mediaRecord!.fileName,
                caption: dto.caption,
              },
            );

      await this.creditsService.recordDebit(
        conversation.organizationId!,
        CREDITS_PER_MESSAGE,
        'WhatsApp message sent',
        'Message',
        message.id,
        sentByUserId,
      );
      const sent = await this.prisma.message.update({
        where: { id: message.id },
        data: { status: MessageStatus.SENT, waMessageId: result.waMessageId },
        include: messageInclude,
      });
      await this.touchConversation(conversationId);
      this.eventEmitter.emit(INBOX_MESSAGE_EVENT, new InboxMessageEvent(sent));
      return sent;
    } catch (err) {
      // The credit was already reserved above — the actual send failed, so
      // give it back. A failed send must never cost the org anything, and
      // must leave zero trace in the credit ledger.
      await this.creditsService.release(
        conversation.organizationId!,
        CREDITS_PER_MESSAGE,
      );
      const failed = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        include: messageInclude,
      });
      this.eventEmitter.emit(
        INBOX_MESSAGE_EVENT,
        new InboxMessageEvent(failed),
      );
      return failed;
    }
  }

  @OnEvent(WHATSAPP_INCOMING_MESSAGE_EVENT)
  async handleIncomingMessage(event: WhatsAppIncomingMessageEvent) {
    // Triggered by the WhatsApp provider's own websocket listener, not an
    // HTTP request — there's no tenant context yet. This lookup runs
    // unscoped (safe: internal, event.accountId is our own trusted DB id),
    // purely to learn which organization owns the account before scoping
    // every contact/conversation/message/media row this handler creates.
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { id: event.accountId },
      select: { organizationId: true },
    });
    if (!account) return;

    await this.tenantContext.run(
      { organizationId: account.organizationId, isSuperAdmin: false },
      () => this.processIncomingMessage(event, account.organizationId),
    );
  }

  private async processIncomingMessage(
    event: WhatsAppIncomingMessageEvent,
    organizationId: string,
  ) {
    // Idempotency guard: WhatsApp/Baileys can redeliver the same inbound
    // message (e.g. around a reconnect) with an identical waMessageId —
    // without this, a redelivery would increment unreadCount and touch
    // lastMessageAt a second time for a message the user already has.
    const alreadyProcessed = await this.prisma.message.findFirst({
      where: {
        waMessageId: event.waMessageId,
        whatsAppAccountId: event.accountId,
      },
      select: { id: true },
    });
    if (alreadyProcessed) return;

    let contact = await this.prisma.contact.findFirst({
      where: { phoneNumber: event.fromPhoneNumber },
    });
    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          firstName: event.pushName || event.fromPhoneNumber,
          phoneNumber: event.fromPhoneNumber,
          source: 'whatsapp',
          organizationId,
        },
      });
    }

    const conversation = await this.prisma.conversation.upsert({
      where: {
        whatsAppAccountId_contactId: {
          whatsAppAccountId: event.accountId,
          contactId: contact.id,
        },
      },
      update: { lastMessageAt: event.timestamp, unreadCount: { increment: 1 } },
      create: {
        whatsAppAccountId: event.accountId,
        contactId: contact.id,
        lastMessageAt: event.timestamp,
        unreadCount: 1,
        organizationId,
      },
      include: conversationInclude,
    });

    let mediaId: string | undefined;
    if (event.media) {
      const media = await this.mediaService.saveIncoming(
        event.media.buffer,
        event.media.mimetype,
        event.media.fileName,
        organizationId,
      );
      mediaId = media.id;
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        whatsAppAccountId: event.accountId,
        organizationId,
        direction: 'INBOUND',
        type: event.type,
        content: event.text,
        status: MessageStatus.DELIVERED,
        waMessageId: event.waMessageId,
        mediaId,
      },
      include: messageInclude,
    });

    this.eventEmitter.emit(INBOX_MESSAGE_EVENT, new InboxMessageEvent(message));
    this.eventEmitter.emit(
      INBOX_CONVERSATION_EVENT,
      new InboxConversationEvent(conversation),
    );
  }

  @OnEvent(WHATSAPP_MESSAGE_STATUS_EVENT)
  async handleMessageStatusUpdate(event: WhatsAppMessageStatusEvent) {
    const existing = await this.prisma.message.findFirst({
      where: { waMessageId: event.waMessageId },
    });
    if (!existing) return;

    const message = await this.prisma.message.update({
      where: { id: existing.id },
      data: { status: event.status },
      include: messageInclude,
    });
    this.eventEmitter.emit(INBOX_MESSAGE_EVENT, new InboxMessageEvent(message));
  }

  private async touchConversation(conversationId: string) {
    await this.prisma.conversation
      .update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      })
      .catch((err: unknown) =>
        this.logger.warn(
          `Failed to touch conversation ${conversationId}: ${String(err)}`,
        ),
      );
  }
}

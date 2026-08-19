import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../inbox/conversations.service';
import {
  INBOX_MESSAGE_EVENT,
  InboxMessageEvent,
} from '../inbox/events/inbox.events';
import { TemplatesService } from '../templates/templates.service';
import { Automation } from '../generated/prisma/client';

interface InboundMessagePayload {
  id: string;
  direction: string;
  conversationId: string;
  content: string | null;
}

// Listens on INBOX_MESSAGE_EVENT rather than the lower-level
// WHATSAPP_INCOMING_MESSAGE_EVENT — by the time that fires,
// ConversationsService.handleIncomingMessage has already created the
// contact/conversation/message rows, so a first-time sender is guaranteed
// to exist here.
@Injectable()
export class AutomationsListenerService {
  private readonly logger = new Logger(AutomationsListenerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
    private readonly templatesService: TemplatesService,
  ) {}

  @OnEvent(INBOX_MESSAGE_EVENT)
  async handleMessage(event: InboxMessageEvent): Promise<void> {
    const message = event.message as InboundMessagePayload;
    if (message.direction !== 'INBOUND') return;

    // Triggered from the WhatsApp provider's own websocket listener, not an
    // HTTP request — there's no tenant context yet. This lookup itself runs
    // unscoped (safe: internal, ID already trusted from our own earlier
    // processing), purely to learn which organization owns the
    // conversation before scoping everything downstream to it. Without
    // that, automation.findMany below would match every organization's
    // automations against every inbound message on the platform.
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: message.conversationId },
      include: { contact: true },
    });
    if (!conversation) return;

    await this.tenantContext.run(
      { organizationId: conversation.organizationId, isSuperAdmin: false },
      async () => {
        const automations = await this.prisma.automation.findMany({
          where: { isActive: true, triggerType: 'message_received' },
        });
        if (automations.length === 0) return;

        for (const automation of automations) {
          const config = (automation.triggerConfig ?? {}) as { keyword?: string };
          if (
            config.keyword &&
            !(message.content ?? '')
              .toLowerCase()
              .includes(config.keyword.toLowerCase())
          ) {
            continue;
          }
          await this.runAction(automation, conversation.id, conversation.contactId);
        }
      },
    );
  }

  private async runAction(
    automation: Automation,
    conversationId: string,
    contactId: string,
  ): Promise<void> {
    try {
      if (automation.actionType === 'send_template') {
        const { templateId } = automation.actionConfig as {
          templateId: string;
        };
        const contact = await this.contactsService.findOne(contactId);
        const [rendered, template] = await Promise.all([
          this.templatesService.renderForContact(templateId, contact),
          this.templatesService.findOne(templateId),
        ]);
        const media = template.media;
        await this.conversationsService.sendMessage(
          conversationId,
          media
            ? { type: media.type, mediaId: media.id, caption: rendered.text }
            : { type: 'TEXT', content: rendered.text },
          undefined,
        );
      }
    } catch (err) {
      // One misconfigured automation (e.g. its template got deleted after
      // creation) must not break inbound message processing.
      this.logger.warn(
        `Automation ${automation.id} (${automation.actionType}) failed: ${String(err)}`,
      );
    }
  }
}

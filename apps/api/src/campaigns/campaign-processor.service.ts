import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../inbox/conversations.service';
import { TemplatesService } from '../templates/templates.service';
import { WhatsAppAccountStatus } from '../generated/prisma/enums';
import {
  CAMPAIGN_RECIPIENT_PROCESSED_EVENT,
  CampaignRecipientProcessedEvent,
} from './events/campaign.events';

@Injectable()
export class CampaignProcessor {
  private readonly logger = new Logger(CampaignProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
    private readonly templatesService: TemplatesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processRecipient(
    campaignId: string,
    recipientId: string,
  ): Promise<void> {
    try {
      await this.doProcess(campaignId, recipientId);
    } finally {
      this.eventEmitter.emit(
        CAMPAIGN_RECIPIENT_PROCESSED_EVENT,
        new CampaignRecipientProcessedEvent(campaignId),
      );
    }
  }

  private async doProcess(
    campaignId: string,
    recipientId: string,
  ): Promise<void> {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
      include: { contact: true },
    });
    if (
      !recipient ||
      recipient.status === 'CANCELLED' ||
      recipient.status === 'SKIPPED_OPTOUT'
    ) {
      return;
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        template: { include: { media: true } },
        whatsAppAccount: true,
      },
    });
    if (!campaign || campaign.status !== 'RUNNING') {
      return; // paused/cancelled — the queue itself should already be paused/drained
    }

    if (recipient.contact.isOptedOut) {
      await this.prisma.campaignRecipient.update({
        where: { id: recipientId },
        data: { status: 'SKIPPED_OPTOUT' },
      });
      return;
    }

    if (campaign.whatsAppAccount.status !== WhatsAppAccountStatus.CONNECTED) {
      await this.markFailed(
        campaign.id,
        recipient,
        'WhatsApp account is not connected',
      );
      return;
    }

    try {
      const conversation = await this.conversationsService.createConversation(
        recipient.contactId,
        campaign.whatsAppAccountId,
        campaign.organizationId,
      );
      const rendered = await this.templatesService.renderForContact(
        campaign.templateId,
        recipient.contact,
      );

      const media = campaign.template.media;
      const message = await this.conversationsService.sendMessage(
        conversation.id,
        media
          ? { type: media.type, mediaId: media.id, caption: rendered.text }
          : { type: 'TEXT', content: rendered.text },
        undefined,
      );

      if (message.status === 'FAILED') {
        await this.markFailed(
          campaign.id,
          recipient,
          message.errorMessage ?? 'Send failed',
          message.id,
        );
      } else {
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: 'SENT', sentAt: new Date(), messageId: message.id },
        });
      }
    } catch (err) {
      await this.markFailed(
        campaign.id,
        recipient,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  // Single attempt only, by design — a failed send is marked FAILED
  // immediately with no retry/backoff. Campaigns send once per recipient
  // and are done; resending means launching a fresh campaign.
  private async markFailed(
    campaignId: string,
    recipient: { id: string; attempts: number },
    errorMessage: string,
    messageId?: string,
  ) {
    await this.prisma.campaignRecipient.update({
      where: { id: recipient.id },
      data: {
        status: 'FAILED',
        attempts: recipient.attempts + 1,
        errorMessage,
        messageId,
      },
    });
    this.logger.warn(
      `Recipient ${recipient.id} on campaign ${campaignId} failed: ${errorMessage}`,
    );
  }
}

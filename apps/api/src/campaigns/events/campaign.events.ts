export const CAMPAIGN_RECIPIENT_PROCESSED_EVENT =
  'campaign.recipient.processed';

export class CampaignRecipientProcessedEvent {
  constructor(public readonly campaignId: string) {}
}

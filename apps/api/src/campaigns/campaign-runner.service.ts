import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { randomDelaySeconds } from './campaign-delay.util';
import { CampaignProcessor } from './campaign-processor.service';

const TICK_MS = 1000;

// Database-backed replacement for a Redis/BullMQ queue: a periodic tick
// scans RUNNING campaigns and claims due recipients directly against MySQL.
// Pause/resume/cancel need no queue-side bookkeeping — they just flip
// `campaign.status`, and the tick only ever looks at RUNNING campaigns.
@Injectable()
export class CampaignRunnerService {
  private readonly logger = new Logger(CampaignRunnerService.name);
  private ticking = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    @Inject(forwardRef(() => CampaignProcessor))
    private readonly processor: CampaignProcessor,
  ) {}

  /**
   * Stamps recipients in batches of `batchSize`, all sharing the same
   * `scheduledFor` within a batch (so the tick picks up and sends the whole
   * batch together), with a random interval in
   * [minIntervalSeconds, maxIntervalSeconds] before the next batch's
   * `scheduledFor` — the pause between batches that keeps sends from
   * looking automated to WhatsApp.
   */
  async enqueueMany(
    recipientIds: string[],
    batchSize: number,
    minIntervalSeconds: number,
    maxIntervalSeconds: number,
  ): Promise<void> {
    const now = Date.now();
    let cumulativeMs = 0;
    for (let i = 0; i < recipientIds.length; i += batchSize) {
      const batch = recipientIds.slice(i, i + batchSize);
      const scheduledFor = new Date(now + cumulativeMs);
      await this.prisma.campaignRecipient.updateMany({
        where: { id: { in: batch } },
        data: { status: 'QUEUED', scheduledFor },
      });
      cumulativeMs +=
        randomDelaySeconds(minIntervalSeconds, maxIntervalSeconds) * 1000;
    }
  }

  @Interval(TICK_MS)
  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      // Unscoped by design: this tick must see every organization's
      // running campaigns. Each campaign's own processing is then wrapped
      // in that campaign's tenant context below, so the Prisma calls made
      // while handling it (recipient claims, message/conversation writes,
      // credit debits) stay scoped to the right organization — there's no
      // HTTP request here to derive that context from otherwise.
      const campaigns = await this.prisma.campaign.findMany({
        where: { status: 'RUNNING' },
        select: {
          id: true,
          organizationId: true,
          organization: { select: { campaignBatchSize: true } },
        },
      });
      for (const campaign of campaigns) {
        try {
          await this.tenantContext.run(
            { organizationId: campaign.organizationId, isSuperAdmin: false },
            () =>
              this.processDueRecipients(
                campaign.id,
                campaign.organization.campaignBatchSize,
              ),
          );
        } catch (err) {
          // One campaign's failure must not skip every campaign after it in
          // this tick — log and move on, the next tick still picks this
          // campaign back up.
          this.logger.error(
            `Tick failed for campaign ${campaign.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        `Tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      this.ticking = false;
    }
  }

  private async processDueRecipients(
    campaignId: string,
    batchSize: number,
  ): Promise<void> {
    // Caps in-flight sends at the org's batch size too — belt and braces
    // alongside the scheduledFor staggering, so a slow tick catching up
    // can never blow past "N at once" regardless of timing.
    const inFlight = await this.prisma.campaignRecipient.count({
      where: { campaignId, status: 'SENDING' },
    });
    const available = Math.max(0, batchSize - inFlight);
    if (available === 0) return;

    const due = await this.prisma.campaignRecipient.findMany({
      where: {
        campaignId,
        status: { in: ['PENDING', 'QUEUED'] },
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: available,
      select: { id: true },
    });

    for (const recipient of due) {
      const claimed = await this.prisma.campaignRecipient.updateMany({
        where: { id: recipient.id, status: { in: ['PENDING', 'QUEUED'] } },
        data: { status: 'SENDING' },
      });
      if (claimed.count === 0) continue; // claimed by a concurrent tick already

      void this.processor
        .processRecipient(campaignId, recipient.id)
        .catch((err: unknown) => {
          this.logger.error(
            `Recipient ${recipient.id} on campaign ${campaignId} threw: ${String(err)}`,
          );
        });
    }
  }
}

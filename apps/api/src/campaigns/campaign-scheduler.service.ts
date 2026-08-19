import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from './campaigns.service';

@Injectable()
export class CampaignSchedulerService {
  private readonly logger = new Logger(CampaignSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignsService: CampaignsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async launchDueCampaigns() {
    const due = await this.prisma.campaign.findMany({
      where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
      select: { id: true },
    });

    for (const campaign of due) {
      try {
        await this.campaignsService.startRunning(campaign.id);
        this.logger.log(`Launched scheduled campaign ${campaign.id}`);
      } catch (err) {
        this.logger.error(
          `Failed to launch scheduled campaign ${campaign.id}: ${String(err)}`,
        );
      }
    }
  }
}

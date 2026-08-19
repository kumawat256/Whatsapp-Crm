import { Module } from '@nestjs/common';
import { InboxModule } from '../inbox/inbox.module';
import { TemplatesModule } from '../templates/templates.module';
import { CampaignProcessor } from './campaign-processor.service';
import { CampaignRunnerService } from './campaign-runner.service';
import { CampaignSchedulerService } from './campaign-scheduler.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [InboxModule, TemplatesModule],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignRunnerService,
    CampaignProcessor,
    CampaignSchedulerService,
  ],
})
export class CampaignsModule {}

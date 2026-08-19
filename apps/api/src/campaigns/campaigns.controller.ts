import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { PERMISSIONS } from '../common/permissions';
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { CampaignsService } from './campaigns.service';
import { AddRecipientsDto } from './dto/add-recipients.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { RelaunchCampaignDto } from './dto/relaunch-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
@RequirePermissions(PERMISSIONS.CAMPAIGNS_MANAGE)
@RequireModule('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(@Query() query: QueryCampaignsDto) {
    return this.campaignsService.findAll(query);
  }

  @Post('emergency-stop')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.emergency_stop')
  emergencyStop() {
    return this.campaignsService.emergencyStopAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/recipients')
  recipients(@Param('id') id: string, @Query() query: QueryCampaignsDto) {
    return this.campaignsService.recipients(id, query);
  }

  @Get(':id/insights')
  insights(@Param('id') id: string) {
    return this.campaignsService.insights(id);
  }

  @Get(':id/export')
  async export(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.campaignsService.exportReport(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="campaign-${id}-report.csv"`,
    );
    res.send(csv);
  }

  @Post()
  create(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.campaignsService.create(dto, organizationId, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  // Overrides the class-level campaigns.manage requirement with BOTH
  // permissions required — deleting is gated separately from everyday
  // campaign management (launch/pause/cancel/relaunch).
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PERMISSIONS.CAMPAIGNS_MANAGE, PERMISSIONS.CAMPAIGNS_DELETE)
  @Audit('campaign.delete', 'Campaign')
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  @Post(':id/preview')
  @HttpCode(HttpStatus.OK)
  preview(@Param('id') id: string, @Body() dto: AddRecipientsDto) {
    return this.campaignsService.preview(id, dto);
  }

  @Post(':id/recipients')
  addRecipients(@Param('id') id: string, @Body() dto: AddRecipientsDto) {
    return this.campaignsService.addRecipients(id, dto);
  }

  @Post(':id/launch')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.launch', 'Campaign')
  launch(@Param('id') id: string) {
    return this.campaignsService.launch(id);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.pause', 'Campaign')
  pause(@Param('id') id: string) {
    return this.campaignsService.pause(id);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.resume', 'Campaign')
  resume(@Param('id') id: string) {
    return this.campaignsService.resume(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.cancel', 'Campaign')
  cancel(@Param('id') id: string) {
    return this.campaignsService.cancel(id);
  }

  @Post(':id/relaunch')
  @HttpCode(HttpStatus.OK)
  @Audit('campaign.relaunch', 'Campaign')
  relaunch(
    @Param('id') id: string,
    @Body() dto: RelaunchCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.campaignsService.relaunch(id, dto, organizationId, user.id);
  }
}

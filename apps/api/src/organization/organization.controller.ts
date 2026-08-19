import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCampaignSettingsDto } from './dto/update-campaign-settings.dto';
import { OrganizationService } from './organization.service';

// No @RequirePermissions here on purpose — every authenticated tenant user
// (Admin or Agent) should be able to see their own org's plan/limits, not
// just users.manage holders. @CurrentOrganizationId() already gives Super
// Admin a clean 403 (they have no "own" organization).
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('me')
  getSelf(@CurrentOrganizationId() organizationId: string) {
    return this.organizationService.getSelf(organizationId);
  }

  @Get('team')
  getTeamActivity(@CurrentOrganizationId() organizationId: string) {
    return this.organizationService.getTeamActivity(organizationId);
  }

  // Admin-only (not Agent) — this is an org-wide sending-behavior decision,
  // not something every team member should be able to change. Also
  // reachable by Super Admin while impersonating, since impersonation
  // hands them the target Admin's own token/role.
  @Patch('campaign-settings')
  @Roles('Admin')
  updateCampaignSettings(
    @CurrentOrganizationId() organizationId: string,
    @Body() dto: UpdateCampaignSettingsDto,
  ) {
    return this.organizationService.updateCampaignSettings(organizationId, dto);
  }
}

import { Controller, Get } from '@nestjs/common';
import { PERMISSIONS } from '../common/permissions';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@RequirePermissions(PERMISSIONS.ANALYTICS_VIEW)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // @CurrentOrganizationId() is only read for its side effect: every query
  // in getOverview() relies on the tenant-scoping Prisma extension to
  // auto-inject organizationId, which it can't do for Super Admin's
  // unscoped context — without this, Super Admin would silently get
  // platform-wide totals back mislabeled as "their" workspace instead of
  // the clean 403 every other tenant-only endpoint gives.
  @Get('overview')
  getOverview(@CurrentOrganizationId() _organizationId: string) {
    return this.analyticsService.getOverview();
  }
}

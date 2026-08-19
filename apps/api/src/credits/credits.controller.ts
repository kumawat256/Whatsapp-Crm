import { Controller, Get, Query } from '@nestjs/common';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/permissions';
import { CreditsService } from './credits.service';
import { QueryMessageUsageReportDto } from './dto/query-message-usage-report.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

// Read-only for tenants on purpose: only Super Admin can add or deduct
// credits (see admin/credits/admin-credits.controller.ts) — a Tenant Admin
// can see their own balance, ledger, and usage report, but has no mutating
// endpoint here at all.
@Controller('credits')
@RequirePermissions(PERMISSIONS.CREDITS_MANAGE)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('wallet')
  getWallet(@CurrentOrganizationId() organizationId: string) {
    return this.creditsService.getWallet(organizationId);
  }

  @Get('transactions')
  listTransactions(
    @Query() query: QueryTransactionsDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.creditsService.listTransactions(organizationId, query);
  }

  @Get('message-usage-report')
  messageUsageReport(
    @Query() query: QueryMessageUsageReportDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.creditsService.messageUsageReport(organizationId, query);
  }

  @Get('trend')
  trend(@CurrentOrganizationId() organizationId: string) {
    return this.creditsService.getTrend(organizationId);
  }
}

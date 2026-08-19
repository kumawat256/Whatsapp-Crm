import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/types/jwt-payload.type';
import { Audit } from '../../audit-logs/decorators/audit.decorator';
import { CreditsService } from '../../credits/credits.service';
import { QueryTransactionsDto } from '../../credits/dto/query-transactions.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { AdjustCreditsDto } from './dto/adjust-credits.dto';

@Controller('admin/organizations/:organizationId/credits')
@Roles('Super Admin')
export class AdminCreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get('wallet')
  async getWallet(@Param('organizationId') organizationId: string) {
    await this.organizationsService.findOne(organizationId);
    return this.creditsService.getWallet(organizationId);
  }

  @Get('transactions')
  async listTransactions(
    @Param('organizationId') organizationId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    await this.organizationsService.findOne(organizationId);
    return this.creditsService.listTransactions(organizationId, query);
  }

  @Post('adjust')
  @Audit('organization.credits_adjust', 'CreditWallet')
  async adjust(
    @Param('organizationId') organizationId: string,
    @Body() dto: AdjustCreditsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.organizationsService.findOne(organizationId);
    if (dto.type === 'CREDIT') {
      return this.creditsService.topup(
        organizationId,
        dto.amount,
        dto.reason,
        user.id,
      );
    }
    await this.creditsService.debit(
      organizationId,
      dto.amount,
      dto.reason,
      'ManualAdjustment',
      undefined,
      user.id,
    );
    return this.creditsService.getWallet(organizationId);
  }
}

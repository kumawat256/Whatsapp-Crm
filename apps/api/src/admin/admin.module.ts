import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreditsModule } from '../credits/credits.module';
import { UsersModule } from '../users/users.module';
import { AdminCreditsController } from './credits/admin-credits.controller';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { OrganizationsController } from './organizations/organizations.controller';
import { OrganizationsService } from './organizations/organizations.service';
import { PlansController } from './plans/plans.controller';
import { PlansService } from './plans/plans.service';

@Module({
  imports: [UsersModule, AuthModule, CreditsModule],
  controllers: [
    OrganizationsController,
    PlansController,
    AdminCreditsController,
    AdminDashboardController,
  ],
  providers: [OrganizationsService, PlansService, AdminDashboardService],
})
export class AdminModule {}

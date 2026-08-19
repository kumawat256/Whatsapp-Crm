import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { TenantContextModule } from './common/tenant-context.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RbacGuard } from './auth/guards/rbac.guard';
import { TenantStatusGuard } from './auth/guards/tenant-status.guard';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ContactsModule } from './contacts/contacts.module';
import { ListsModule } from './lists/lists.module';
import { MediaModule } from './media/media.module';
import { InboxModule } from './inbox/inbox.module';
import { TemplatesModule } from './templates/templates.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CreditsModule } from './credits/credits.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AutomationsModule } from './automations/automations.module';
import { AuditLogModule } from './audit-logs/audit-log.module';
import { AuditLogInterceptor } from './audit-logs/audit-log.interceptor';
import { AdminModule } from './admin/admin.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Generous global default (real page loads fire several concurrent GETs);
    // sensitive unauthenticated routes (login/refresh) override this with a
    // much tighter limit — see auth.controller.ts.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    TenantContextModule,
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WhatsAppModule,
    ContactsModule,
    ListsModule,
    MediaModule,
    InboxModule,
    TemplatesModule,
    CampaignsModule,
    CreditsModule,
    RolesModule,
    SettingsModule,
    AnalyticsModule,
    AutomationsModule,
    AuditLogModule,
    AdminModule,
    OrganizationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_GUARD, useClass: TenantStatusGuard },
    // Must run before AuditLogInterceptor: audit writes for AuditLog (a
    // tenant-scoped model) rely on the context this establishes to get
    // organizationId auto-injected by the Prisma tenant-scoping extension.
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}

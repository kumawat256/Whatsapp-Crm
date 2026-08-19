import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';
import { TenantContextService } from '../common/tenant-context.service';
import { scopeArgsToOrganization, TENANT_SCOPED_MODELS } from '../common/tenant-scope.util';

// PrismaService IS a real PrismaClient (via `super()`), giving every
// existing `this.prisma.<model>.<op>(...)` call site full typing for free.
// On top of that real client we layer a `$extends` query hook that
// transparently injects `organizationId` into every query/write for a
// tenant-owned model, based on the current request's TenantContextService
// value — no existing service code needs to change to become tenant-safe.
//
// `$extends()` returns a *new* client-shaped object rather than mutating
// `this`, so the constructor returns a Proxy around `this` that forwards
// everything (model delegates, $transaction, $queryRaw, ...) to that
// extended object, while methods declared directly on this class
// (onModuleInit/onModuleDestroy) still resolve on the real instance. This
// is the standard way to combine a Prisma Client extension with a NestJS
// injectable singleton — see tenant-scope.util.ts for the actual rewrite
// logic.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    config: ConfigService,
    private readonly tenantContext: TenantContextService,
  ) {
    super({
      adapter: new PrismaMariaDb(config.get<string>('DATABASE_URL')!),
    });

    const scoped = this.$extends({
      name: 'tenant-scoping',
      query: {
        $allModels: {
          $allOperations: ({ model, operation, args, query }) => {
            if (!model || !TENANT_SCOPED_MODELS.has(model)) {
              return query(args);
            }
            const ctx = tenantContext.get();
            // No context at all (a background job that forgot to wrap
            // itself in tenantContext.run) or a genuine Super Admin
            // operating platform-wide: pass through unscoped. Super Admin
            // endpoints that target one specific customer filter by
            // organizationId explicitly in their own `where`, same as any
            // normal Prisma call.
            if (!ctx || ctx.isSuperAdmin) {
              return query(args);
            }
            // A non-Super-Admin session with no organization should never
            // happen post-migration — every tenant user has one. Fail
            // closed instead of silently falling through to the unscoped
            // branch above, which would hand an ordinary user full
            // cross-tenant access.
            if (ctx.organizationId === null) {
              throw new Error(
                `Tenant-scoped query on ${model} attempted with no organization in context`,
              );
            }
            return query(
              scopeArgsToOrganization(
                operation,
                args as Record<string, unknown>,
                ctx.organizationId,
              ),
            );
          },
        },
      },
    });

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (
          prop === 'onModuleInit' ||
          prop === 'onModuleDestroy' ||
          prop === 'logger' ||
          prop === 'tenantContext'
        ) {
          return Reflect.get(target, prop, receiver);
        }
        return Reflect.get(scoped as object, prop);
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

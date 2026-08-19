import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  organizationId: string | null;
  isSuperAdmin: boolean;
}

// Request-scoped tenant identity, readable from anywhere in the async call
// chain (services, the Prisma tenant-scoping extension) without threading
// organizationId through every method signature. Populated by
// TenantContextInterceptor for HTTP requests; background jobs that need
// scoping (campaign runner, automation listener) call `run()` themselves —
// see those services for the two call sites.
@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): TenantContext | undefined {
    return this.storage.getStore();
  }
}

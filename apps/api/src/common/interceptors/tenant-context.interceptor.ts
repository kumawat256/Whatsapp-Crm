import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../auth/types/jwt-payload.type';
import { TenantContextService } from '../tenant-context.service';

// Establishes the AsyncLocalStorage tenant context for the lifetime of a
// request, right after JwtAuthGuard has resolved `request.user`. Must be an
// interceptor, not a guard/middleware: guards run before the handler but
// don't wrap its execution, so a context set in a guard wouldn't be visible
// inside the controller/service call chain — an interceptor's
// `next.handle()` is exactly that wrapped execution.
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    // @Public() routes (login, refresh, health) have no user — nothing to scope.
    if (!user) return next.handle();

    return new Observable((subscriber) => {
      this.tenantContext.run(
        { organizationId: user.organizationId, isSuperAdmin: user.role === 'Super Admin' },
        () => {
          next.handle().subscribe(subscriber);
        },
      );
    });
  }
}

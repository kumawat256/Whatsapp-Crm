import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { AUDIT_KEY, AuditMeta } from './decorators/audit.decorator';
import { AuditLogService } from './audit-log.service';

interface AuditableRequest {
  user?: AuthenticatedUser;
  params?: Record<string, string>;
  ip?: string;
}

// Global interceptor: routes opt in with @Audit(...) (see decorator). Routes
// without the decorator pay only the cost of one Reflector lookup.
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta>(AUDIT_KEY, context.getHandler());
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<AuditableRequest>();

    return next.handle().pipe(
      tap((result: unknown) => {
        const body = result as { id?: string; key?: string } | undefined;
        const entityId =
          body?.id ?? body?.key ?? request.params?.id ?? request.params?.key;
        void this.auditLogService.log({
          action: meta.action,
          entityType: meta.entityType,
          entityId,
          userId: request.user?.id,
          ipAddress: request.ip,
        });
      }),
    );
  }
}

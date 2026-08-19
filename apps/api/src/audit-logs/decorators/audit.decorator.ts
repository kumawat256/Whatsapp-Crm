import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMeta {
  action: string;
  entityType?: string;
}

/** Marks a route handler for automatic audit logging on success — see AuditLogInterceptor. */
export const Audit = (action: string, entityType?: string) =>
  SetMetadata(AUDIT_KEY, { action, entityType } as AuditMeta);

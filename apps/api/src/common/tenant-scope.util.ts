// Models that carry an organizationId column (see schema.prisma) and must
// never be readable/writable across tenant boundaries. Deliberately
// excludes Organization/Plan/Role/Permission/RefreshToken/WhatsAppSession/
// Notification/SystemSetting — see the multi-tenant plan for why each of
// those is safe to leave unscoped.
export const TENANT_SCOPED_MODELS = new Set([
  'User',
  'WhatsAppAccount',
  'Contact',
  'List',
  'ListMember',
  'Template',
  'Campaign',
  'CampaignRecipient',
  'Automation',
  'Conversation',
  'Message',
  'Media',
  'CreditWallet',
  'CreditTransaction',
  'AuditLog',
]);

const WHERE_SCOPED_OPERATIONS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

/**
 * Rewrites Prisma Client args so a query/write for a tenant-scoped model can
 * only touch rows belonging to `organizationId`. Used by the PrismaService
 * `$extends` query hook (see prisma.service.ts) — this is the single place
 * that enforces tenant isolation at the query level, so every existing
 * service's `this.prisma.<model>.<op>(...)` call gets scoped automatically
 * without being edited.
 */
export function scopeArgsToOrganization(
  operation: string,
  args: Record<string, unknown>,
  organizationId: string,
): Record<string, unknown> {
  const next = { ...args };

  if (WHERE_SCOPED_OPERATIONS.has(operation)) {
    next.where = { ...((next.where as object) ?? {}), organizationId };
    return next;
  }

  if (operation === 'create') {
    next.data = { ...((next.data as object) ?? {}), organizationId };
    return next;
  }

  if (operation === 'createMany' || operation === 'createManyAndReturn') {
    const data = next.data;
    next.data = Array.isArray(data)
      ? data.map((row: object) => ({ ...row, organizationId }))
      : data;
    return next;
  }

  if (operation === 'upsert') {
    next.where = { ...((next.where as object) ?? {}), organizationId };
    next.create = { ...((next.create as object) ?? {}), organizationId };
    return next;
  }

  return next;
}

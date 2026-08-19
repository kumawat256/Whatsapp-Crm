export const PERMISSIONS = {
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  WHATSAPP_MANAGE: 'whatsapp.manage',
  CONTACTS_MANAGE: 'contacts.manage',
  LISTS_MANAGE: 'lists.manage',
  MESSAGES_MANAGE: 'messages.manage',
  TEMPLATES_MANAGE: 'templates.manage',
  CAMPAIGNS_MANAGE: 'campaigns.manage',
  // Separate from campaigns.manage on purpose — deleting a campaign is
  // destructive and irreversible, so it's worth being able to grant
  // everyday campaign management without also granting delete rights.
  CAMPAIGNS_DELETE: 'campaigns.delete',
  CREDITS_MANAGE: 'credits.manage',
  SETTINGS_MANAGE: 'settings.manage',
  ANALYTICS_VIEW: 'analytics.view',
  AUTOMATIONS_MANAGE: 'automations.manage',
  AUDIT_LOGS_VIEW: 'audit-logs.view',
  // Super Admin only — managing customers/organizations themselves, not any
  // one customer's own data.
  ORGANIZATIONS_MANAGE: 'organizations.manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

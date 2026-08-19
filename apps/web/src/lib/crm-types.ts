export interface Contact {
  id: string
  firstName: string
  lastName: string | null
  phoneNumber: string
  notes: string | null
  source: string | null
  isOptedOut: boolean
  optedOutAt: string | null
  createdAt: string
}

export interface List {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: { members: number }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "TEMPLATE"
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED"
export type MessageDirection = "INBOUND" | "OUTBOUND"

export interface Media {
  id: string
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
  fileName: string
  mimeType: string
  sizeBytes: number
}

export interface Message {
  id: string
  conversationId: string
  direction: MessageDirection
  type: MessageType
  content: string | null
  status: MessageStatus
  errorMessage: string | null
  media: Media | null
  createdAt: string
}

export interface WhatsAppAccountSummary {
  id: string
  label: string
  phoneNumber: string | null
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "LOGGED_OUT"
}

export interface Conversation {
  id: string
  unreadCount: number
  lastMessageAt: string | null
  contact: Contact
  whatsAppAccount: WhatsAppAccountSummary
  assignedTo: { id: string; firstName: string; lastName: string } | null
}

export interface Template {
  id: string
  name: string
  category: string | null
  body: string
  variables: string[]
  isActive: boolean
  media: Media | null
  createdAt: string
}

export type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"

export type CampaignRecipientStatus =
  | "PENDING"
  | "QUEUED"
  | "SENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "SKIPPED_OPTOUT"
  | "CANCELLED"

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  minDelaySeconds: number
  maxDelaySeconds: number
  dailyLimit: number | null
  concurrency: number
  retryLimit: number
  template: { id: string; name: string }
  whatsAppAccount: WhatsAppAccountSummary
  createdAt: string
  recipientCounts: Record<CampaignRecipientStatus, number>
  totalRecipients: number
}

export interface CampaignRecipient {
  id: string
  status: CampaignRecipientStatus
  attempts: number
  errorMessage: string | null
  sentAt: string | null
  contact: Contact
}

export type CreditTransactionType = "CREDIT" | "DEBIT"

export interface CreditWallet {
  id: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface CreditTransaction {
  id: string
  type: CreditTransactionType
  amount: number
  reason: string
  referenceType: string | null
  referenceId: string | null
  balanceAfter: number
  createdAt: string
  createdBy: { id: string; firstName: string; lastName: string | null } | null
}

export interface CampaignInsights {
  campaignId: string
  name: string
  status: CampaignStatus
  totalRecipients: number
  sent: number
  delivered: number
  failed: number
  pending: number
  skippedOptOut: number
  cancelled: number
  deliveryRate: number
  failureRate: number
  creditsUsed: number
  startedAt: string | null
  completedAt: string | null
  durationSeconds: number | null
}

export interface CampaignPreview {
  totalContacts: number
  excludedOptedOut: number
  alreadyAdded: number
  estimatedRecipients: number
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  role: { id: string; name: string }
}

export interface Permission {
  id: string
  key: string
  description: string | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: Permission[]
  _count: { users: number }
}

export interface SystemSetting {
  key: string
  value: unknown
  updatedAt: string
  updatedBy: { id: string; firstName: string; lastName: string | null } | null
}

export interface AnalyticsOverview {
  contacts: { total: number; optedOut: number }
  conversations: { total: number; unread: number }
  messages: { sent: number; failed: number; last7Days: { date: string; sent: number }[] }
  campaigns: {
    total: number
    running: number
    completed: number
    recipientsSent: number
    recipientsFailed: number
  }
  credits: { balance: number; spentLast30Days: number }
  whatsapp: { totalAccounts: number; connectedAccounts: number }
  users: { total: number; active: number }
}

export type AutomationTriggerType = "message_received"
export type AutomationActionType = "send_template"

export interface Automation {
  id: string
  name: string
  triggerType: AutomationTriggerType
  triggerConfig: { keyword?: string } | Record<string, unknown>
  actionType: AutomationActionType
  actionConfig: { templateId?: string } | Record<string, unknown>
  isActive: boolean
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  metadata: unknown
  ipAddress: string | null
  createdAt: string
  user: { id: string; firstName: string; lastName: string | null; email: string } | null
}

export type MessageCreditSource = "MANUAL" | "CAMPAIGN" | "AUTOMATION" | "UNKNOWN"

export interface MessageUsageReportRow {
  id: string
  createdAt: string
  amount: number
  balanceAfter: number
  contactName: string | null
  contactPhone: string | null
  source: MessageCreditSource
  campaignName: string | null
  sentByUserName: string | null
}

// ---------------------------------------------------------------------------
// Super Admin (platform) types — /api/admin/*
// ---------------------------------------------------------------------------

export type OrganizationStatus = "ACTIVE" | "SUSPENDED"

export interface Plan {
  id: string
  name: string
  credits: number
  maxWhatsAppAccounts: number
  /** Days until an assigned org's plan expires and WhatsApp sending is blocked. Null = never expires. */
  durationDays: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationSummary {
  id: string
  name: string
  status: OrganizationStatus
  serviceEnabled: boolean
  enabledModules: Record<string, boolean> | null
  planExpiresAt: string | null
  createdAt: string
  updatedAt: string
  plan: Pick<Plan, "id" | "name" | "credits" | "maxWhatsAppAccounts"> | null
}

export interface OrganizationUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
}

export interface OrganizationDetail extends OrganizationSummary {
  creditWallet: { balance: number } | null
  _count: { users: number; whatsAppAccounts: number; contacts: number }
  users: OrganizationUser[]
}

export interface CreateOrganizationResult extends OrganizationSummary {
  admin: { id: string; email: string; firstName: string; lastName: string }
  generatedPassword?: string
}

export interface AdminDashboardOverview {
  customers: { total: number; active: number; suspended: number }
  messages: { sent: number; failed: number }
  credits: { consumed: number }
  whatsapp: { totalAccounts: number; connectedAccounts: number }
  contacts: { total: number }
  users: { totalAdmins: number; totalAgents: number }
}

export interface AdminUsageRow {
  id: string
  name: string
  status: OrganizationStatus
  plan: string | null
  messagesSent: number
  creditsConsumed: number
  contacts: number
  campaigns: number
  whatsAppAccounts: number
  agents: number
  creditBalance: number
}

export interface DashboardTrendPoint {
  date: string
  messagesSent: number
  creditsConsumed: number
}

export interface CreditTrendPoint {
  date: string
  creditsConsumed: number
}

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  role: string
  messagesSent: number
}

export type DashboardRange = "today" | "yesterday" | "7d" | "30d" | "custom"

export interface OrganizationSelf {
  id: string
  name: string
  status: OrganizationStatus
  serviceEnabled: boolean
  plan: Pick<Plan, "name" | "credits" | "maxWhatsAppAccounts"> | null
  planExpiresAt: string | null
  counts: { admins: number; agents: number; whatsAppAccounts: number }
  campaignSettings: {
    batchSize: number
    intervalMinSeconds: number
    intervalMaxSeconds: number
  }
}

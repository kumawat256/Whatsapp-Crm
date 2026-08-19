export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  // null only for Super Admin users — not scoped to any single customer.
  organizationId: string | null;
  // Present only on a short-lived impersonation token: the Super Admin
  // user id who started "Login as Customer". Absent on a normal session.
  impersonatedBy?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  organizationId: string | null;
  impersonatedBy?: string;
}

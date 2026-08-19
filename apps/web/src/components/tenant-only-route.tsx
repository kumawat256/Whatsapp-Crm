import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"

/**
 * Keeps Super Admin out of the tenant-facing app shell. Super Admin has no
 * organization of their own, so every page here either 403s or — worse,
 * for endpoints that don't explicitly guard on organizationId — silently
 * falls back to the tenant-scoping Prisma extension's unscoped pass-through
 * and renders platform-wide totals mislabeled as "your workspace".
 * RoleProtectedRoute already keeps everyone else OUT of /admin/*; this is
 * the inverse, keeping Super Admin out of everywhere else.
 */
export function TenantOnlyRoute() {
  const { user } = useAuth()

  if (user?.role === "Super Admin") {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

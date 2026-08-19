import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"

/** Gates a route tree to a single exact role — used for /admin/* (Super Admin only). */
export function RoleProtectedRoute({ role }: { role: string }) {
  const { user } = useAuth()

  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

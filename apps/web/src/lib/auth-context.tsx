import * as React from "react"
import { apiClient, setAccessToken, getAccessToken } from "./api-client"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  role: string
  organizationId: string | null
  permissions: string[]
}

interface StashedSession {
  accessToken: string | null
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  /** Set while a Super Admin is impersonating a Customer Admin. */
  isImpersonating: boolean
  /**
   * Swaps in a freshly issued impersonation access token (from
   * POST /admin/organizations/:id/impersonate), stashing the Super Admin's
   * own token+user so exitImpersonation can restore them. The impersonation
   * endpoint deliberately issues no refresh token (see AuthService.impersonate),
   * so this state is client-side only and does not survive a page reload —
   * a reload falls back to POST /auth/refresh on the Super Admin's own
   * refresh cookie, which is the intended fail-safe (never silently stay
   * impersonating across a refresh).
   */
  startImpersonation: (impersonationAccessToken: string) => Promise<void>
  exitImpersonation: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [stashedSession, setStashedSession] = React.useState<StashedSession | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const refreshRes = await apiClient.post<{ accessToken: string }>("/auth/refresh")
        setAccessToken(refreshRes.data.accessToken)
        const meRes = await apiClient.get<AuthUser>("/auth/me")
        if (!cancelled) setUser(meRes.data)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ accessToken: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await apiClient.post("/auth/logout")
    } finally {
      setAccessToken(null)
      setUser(null)
      setStashedSession(null)
    }
  }, [])

  const hasPermission = React.useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  )

  const startImpersonation = React.useCallback(
    async (impersonationAccessToken: string) => {
      const previousToken = getAccessToken()
      const previousUser = user
      setAccessToken(impersonationAccessToken)
      try {
        const meRes = await apiClient.get<AuthUser>("/auth/me")
        if (previousUser) {
          setStashedSession({ accessToken: previousToken, user: previousUser })
        }
        setUser(meRes.data)
      } catch (err) {
        // Roll back rather than leave the Super Admin logged in as no one.
        setAccessToken(previousToken)
        throw err
      }
    },
    [user],
  )

  const exitImpersonation = React.useCallback(() => {
    if (!stashedSession) return
    setAccessToken(stashedSession.accessToken)
    setUser(stashedSession.user)
    setStashedSession(null)
  }, [stashedSession])

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      hasPermission,
      isImpersonating: stashedSession !== null,
      startImpersonation,
      exitImpersonation,
    }),
    [user, loading, login, logout, hasPermission, stashedSession, startImpersonation, exitImpersonation],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

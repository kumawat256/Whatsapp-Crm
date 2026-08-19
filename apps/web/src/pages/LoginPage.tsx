import * as React from "react"
import { isAxiosError } from "axios"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useBranding } from "@/lib/branding-context"

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const { appName } = useBranding()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  if (!loading && user) {
    const from = (location.state as { from?: Location })?.from?.pathname
    const redirectTo = from ?? (user.role === "Super Admin" ? "/admin" : "/")
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const from = (location.state as { from?: Location })?.from?.pathname
      const loggedInUser = await login(email, password)
      navigate(from ?? (loggedInUser.role === "Super Admin" ? "/admin" : "/"), {
        replace: true,
      })
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { message?: string })?.message ?? "Login failed")
        : "Login failed"
      setError(Array.isArray(message) ? message.join(", ") : message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{appName}</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

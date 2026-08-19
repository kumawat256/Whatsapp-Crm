import * as React from "react"
import {
  AlertTriangle,
  Contact as ContactIcon,
  MessageSquare,
  Send,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MiniBarChart } from "@/components/mini-bar-chart"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type {
  AnalyticsOverview,
  CreditTrendPoint,
  OrganizationSelf,
  TeamMember,
} from "@/lib/crm-types"

const STAT_TONES = {
  indigo: "from-indigo-500/15 to-indigo-600/5 text-indigo-600 dark:text-indigo-400",
  violet: "from-violet-500/15 to-violet-600/5 text-violet-600 dark:text-violet-400",
  emerald: "from-emerald-500/15 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
  amber: "from-amber-500/15 to-amber-600/5 text-amber-600 dark:text-amber-400",
} as const

// Below this, a low-balance warning shows — same threshold as the Super
// Admin's usage table so the two sides of the same signal stay consistent.
const LOW_BALANCE_THRESHOLD = 20

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: React.ReactNode
  sub?: string
  tone: keyof typeof STAT_TONES
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            STAT_TONES[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth()
  const [overview, setOverview] = React.useState<AnalyticsOverview | null>(null)
  const [org, setOrg] = React.useState<OrganizationSelf | null>(null)
  const [creditTrend, setCreditTrend] = React.useState<CreditTrendPoint[]>([])
  const [team, setTeam] = React.useState<TeamMember[]>([])

  React.useEffect(() => {
    if (!hasPermission("analytics.view")) return
    void (async () => {
      try {
        const res = await apiClient.get<AnalyticsOverview>("/analytics/overview")
        setOverview(res.data)
      } catch {
        // non-critical widget — dashboard still works without it
      }
    })()
  }, [hasPermission])

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<OrganizationSelf>("/organization/me")
        setOrg(res.data)
      } catch {
        // non-critical widget — Super Admin's own session has no org, that's expected
      }
    })()
  }, [])

  React.useEffect(() => {
    if (!hasPermission("credits.manage")) return
    void (async () => {
      try {
        const res = await apiClient.get<CreditTrendPoint[]>("/credits/trend")
        setCreditTrend(res.data)
      } catch {
        // non-critical widget
      }
    })()
  }, [hasPermission])

  React.useEffect(() => {
    if (!hasPermission("users.manage")) return
    void (async () => {
      try {
        const res = await apiClient.get<TeamMember[]>("/organization/team")
        setTeam(res.data)
      } catch {
        // non-critical widget
      }
    })()
  }, [hasPermission])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {user?.firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's going on across your workspace.
          </p>
        </div>

        {overview && overview.credits.balance < LOW_BALANCE_THRESHOLD && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Credit balance is low ({overview.credits.balance} left). Contact your platform
              administrator for a top-up before messages start getting blocked.
            </span>
          </div>
        )}

        {overview && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={ContactIcon}
              title="Contacts"
              value={overview.contacts.total}
              sub={`${overview.contacts.optedOut} opted out`}
              tone="indigo"
            />
            <StatCard
              icon={Send}
              title="Messages sent"
              value={overview.messages.sent}
              sub={`${overview.messages.failed} failed`}
              tone="violet"
            />
            <StatCard
              icon={Wallet}
              title="Credit balance"
              value={overview.credits.balance}
              sub={`${overview.credits.spentLast30Days} spent (30d)`}
              tone="amber"
            />
            <StatCard
              icon={Smartphone}
              title="WhatsApp"
              value={`${overview.whatsapp.connectedAccounts}/${overview.whatsapp.totalAccounts}`}
              sub="accounts connected"
              tone="emerald"
            />
          </div>
        )}

        {org && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-muted-foreground">Plan &amp; team</CardTitle>
              <div className="flex items-center gap-2">
                {org.plan && <Badge variant="outline">{org.plan.name}</Badge>}
                {org.planExpiresAt && (
                  <Badge variant={new Date(org.planExpiresAt) < new Date() ? "destructive" : "secondary"}>
                    {new Date(org.planExpiresAt) < new Date() ? "Expired" : "Expires"}{" "}
                    {new Date(org.planExpiresAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Smartphone className="size-3.5" /> WhatsApp accounts
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {org.counts.whatsAppAccounts}
                    {org.plan && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / {org.plan.maxWhatsAppAccounts}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" /> Agents
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{org.counts.agents}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" /> Admins
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{org.counts.admins}</p>
                </div>
                {hasPermission("users.manage") && (
                  <div className="flex items-end">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/users">Manage team</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {creditTrend.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Credit usage, last 7 days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                data={creditTrend.map((t) => ({ label: t.date, value: t.creditsConsumed }))}
                barClassName="bg-amber-500"
                height={72}
              />
            </CardContent>
          </Card>
        )}

        {team.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Team activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-6 py-1.5 font-medium">Name</th>
                      <th className="px-6 py-1.5 font-medium">Role</th>
                      <th className="px-6 py-1.5 text-right font-medium">Messages sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {team.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-2 text-foreground">
                          {member.firstName} {member.lastName}
                          {!member.isActive && (
                            <Badge variant="destructive" className="ml-1.5">
                              inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-2">
                          <Badge variant="outline">{member.role}</Badge>
                        </td>
                        <td className="px-6 py-2 text-right text-foreground">
                          {member.messagesSent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Your access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge>{user?.role}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Permissions:</span>
              {user?.permissions.length ? (
                user.permissions.map((p) => (
                  <Badge key={p} variant="outline">
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">none</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

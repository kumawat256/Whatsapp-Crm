import * as React from "react"
import { isAxiosError } from "axios"
import {
  Building2,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MiniBarChart } from "@/components/mini-bar-chart"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import type {
  AdminDashboardOverview,
  AdminUsageRow,
  AuditLogEntry,
  DashboardRange,
  DashboardTrendPoint,
  PaginatedResult,
} from "@/lib/crm-types"

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
]

// Below this, a customer's balance is called out in the usage table — an
// arbitrary but reasonable "you'll want to know about this soon" line.
const LOW_BALANCE_THRESHOLD = 20

const STAT_TONES = {
  indigo: "from-indigo-500/15 to-indigo-600/5 text-indigo-600 dark:text-indigo-400",
  violet: "from-violet-500/15 to-violet-600/5 text-violet-600 dark:text-violet-400",
  emerald: "from-emerald-500/15 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
  rose: "from-rose-500/15 to-rose-600/5 text-rose-600 dark:text-rose-400",
  amber: "from-amber-500/15 to-amber-600/5 text-amber-600 dark:text-amber-400",
} as const

export function AdminDashboardPage() {
  const [range, setRange] = React.useState<DashboardRange | "">("")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")

  const [overview, setOverview] = React.useState<AdminDashboardOverview | null>(null)
  const [usage, setUsage] = React.useState<PaginatedResult<AdminUsageRow> | null>(null)
  const [trend, setTrend] = React.useState<DashboardTrendPoint[]>([])
  const [activity, setActivity] = React.useState<AuditLogEntry[]>([])
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const params = React.useMemo(() => {
    if (!range) return {}
    if (range === "custom") {
      return {
        range,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
      }
    }
    return { range }
  }, [range, from, to])

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [overviewRes, usageRes, trendRes, activityRes] = await Promise.all([
        apiClient.get<AdminDashboardOverview>("/admin/dashboard/overview", { params }),
        apiClient.get<PaginatedResult<AdminUsageRow>>("/admin/dashboard/usage", {
          params: { ...params, page, pageSize: 20 },
        }),
        apiClient.get<DashboardTrendPoint[]>("/admin/dashboard/trend"),
        apiClient.get<PaginatedResult<AuditLogEntry>>("/audit-logs", {
          params: { pageSize: 8 },
        }),
      ])
      setOverview(overviewRes.data)
      setUsage(usageRes.data)
      setTrend(trendRes.data)
      setActivity(activityRes.data.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [params, page])

  React.useEffect(() => {
    void load()
  }, [load])

  const totalPages = usage ? Math.max(1, Math.ceil(usage.total / usage.pageSize)) : 1

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Platform dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything happening across every customer, at a glance.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="rangeSelect" className="text-xs">
                Range
              </Label>
              <select
                id="rangeSelect"
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
                value={range}
                onChange={(e) => {
                  setRange(e.target.value as DashboardRange | "")
                  setPage(1)
                }}
              >
                <option value="">All time</option>
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {range === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="dashFrom" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="dashFrom"
                    type="date"
                    className="h-8"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="dashTo" className="text-xs">
                    To
                  </Label>
                  <Input
                    id="dashTo"
                    type="date"
                    className="h-8"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <StatCard
            icon={Building2}
            label="Customers"
            value={overview?.customers.total ?? 0}
            tone="indigo"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={overview?.customers.active ?? 0}
            tone="emerald"
          />
          <StatCard
            icon={XCircle}
            label="Suspended"
            value={overview?.customers.suspended ?? 0}
            tone="rose"
          />
          <StatCard
            icon={ShieldCheck}
            label="Admins"
            value={overview?.users.totalAdmins ?? 0}
            tone="violet"
          />
          <StatCard
            icon={Users}
            label="Agents"
            value={overview?.users.totalAgents ?? 0}
            tone="violet"
          />
          <StatCard
            icon={MessageSquare}
            label="Messages sent"
            value={overview?.messages.sent ?? 0}
            tone="indigo"
          />
          <StatCard
            icon={Wallet}
            label="Credits consumed"
            value={overview?.credits.consumed ?? 0}
            tone="amber"
          />
          <StatCard
            icon={Users}
            label="Contacts"
            value={overview?.contacts.total ?? 0}
            tone="indigo"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Last 7 days, platform-wide
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Messages sent</p>
                <MiniBarChart
                  data={trend.map((t) => ({ label: t.date, value: t.messagesSent }))}
                  barClassName="bg-indigo-500"
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Credits consumed</p>
                <MiniBarChart
                  data={trend.map((t) => ({ label: t.date, value: t.creditsConsumed }))}
                  barClassName="bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-48 flex-col gap-2.5 overflow-y-auto">
                {activity.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nothing yet.</p>
                )}
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <Badge variant="outline" className="mb-1">
                        {entry.action}
                      </Badge>
                      <p className="truncate text-muted-foreground">
                        {entry.user
                          ? `${entry.user.firstName} ${entry.user.lastName ?? ""}`.trim()
                          : "System"}
                        {entry.entityType && ` · ${entry.entityType}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Usage by customer
        </h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Plan</th>
                <th className="px-3 py-2.5 text-right">Balance</th>
                <th className="px-3 py-2.5 text-right">Messages</th>
                <th className="px-3 py-2.5 text-right">Credits used</th>
                <th className="px-3 py-2.5 text-right">Contacts</th>
                <th className="px-3 py-2.5 text-right">Campaigns</th>
                <th className="px-3 py-2.5 text-right">WhatsApp</th>
                <th className="px-3 py-2.5 text-right">Agents</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && usage?.data.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              )}
              {usage?.data.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium text-foreground">{row.name}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.plan ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={cn(
                        "font-medium",
                        row.creditBalance < LOW_BALANCE_THRESHOLD
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-foreground",
                      )}
                    >
                      {row.creditBalance}
                    </span>
                    {row.creditBalance < LOW_BALANCE_THRESHOLD && (
                      <Badge variant="destructive" className="ml-1.5">
                        low
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.messagesSent}</td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.creditsConsumed}</td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.contacts}</td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.campaigns}</td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.whatsAppAccounts}</td>
                  <td className="px-3 py-2.5 text-right text-foreground">{row.agents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  tone: keyof typeof STAT_TONES
}) {
  return (
    <div className="rounded-xl border p-3 transition-shadow hover:shadow-md">
      <div
        className={cn(
          "mb-2 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br",
          STAT_TONES[tone],
        )}
      >
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function StatusPill({ status }: { status: "ACTIVE" | "SUSPENDED" }) {
  const isActive = status === "ACTIVE"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      <span className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-rose-500")} />
      {status}
    </span>
  )
}

function extractMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { message?: string | string[] })?.message
    if (Array.isArray(message)) return message.join(", ")
    if (message) return message
  }
  return "Something went wrong"
}

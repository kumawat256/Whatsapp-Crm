import * as React from "react"
import { isAxiosError } from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import type { AnalyticsOverview } from "@/lib/crm-types"

function StatCard({ title, value, sub }: { title: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const res = await apiClient.get<AnalyticsOverview>("/analytics/overview")
        setData(res.data)
        setError(null)
      } catch (err) {
        setError(extractMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const maxTrend = Math.max(1, ...(data?.messages.last7Days.map((d) => d.sent) ?? [1]))

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Analytics</h1>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {data && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard title="Contacts" value={data.contacts.total} sub={`${data.contacts.optedOut} opted out`} />
              <StatCard
                title="Conversations"
                value={data.conversations.total}
                sub={`${data.conversations.unread} unread`}
              />
              <StatCard title="Messages sent" value={data.messages.sent} sub={`${data.messages.failed} failed`} />
              <StatCard
                title="Credit balance"
                value={data.credits.balance}
                sub={`${data.credits.spentLast30Days} spent (30d)`}
              />
              <StatCard
                title="Campaigns"
                value={data.campaigns.total}
                sub={`${data.campaigns.running} running · ${data.campaigns.completed} completed`}
              />
              <StatCard
                title="Campaign sends"
                value={data.campaigns.recipientsSent}
                sub={`${data.campaigns.recipientsFailed} failed`}
              />
              <StatCard
                title="WhatsApp accounts"
                value={data.whatsapp.totalAccounts}
                sub={`${data.whatsapp.connectedAccounts} connected`}
              />
              <StatCard title="Users" value={data.users.total} sub={`${data.users.active} active`} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Messages sent — last 7 days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 gap-3">
                  {data.messages.last7Days.map((d) => (
                    <div
                      key={d.date}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                    >
                      <div
                        className="w-full rounded-t-sm bg-primary"
                        style={{ height: `${Math.max(4, (d.sent / maxTrend) * 100)}%` }}
                        title={`${d.sent} sent`}
                      />
                      <span className="text-[10px] text-muted-foreground">{d.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
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

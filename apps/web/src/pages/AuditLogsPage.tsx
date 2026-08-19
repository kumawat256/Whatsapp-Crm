import * as React from "react"
import { isAxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type { AuditLogEntry, PaginatedResult } from "@/lib/crm-types"

export function AuditLogsPage() {
  const [entries, setEntries] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionFilter, setActionFilter] = React.useState("")

  const load = React.useCallback(async (action: string) => {
    setLoading(true)
    try {
      const res = await apiClient.get<PaginatedResult<AuditLogEntry>>("/audit-logs", {
        params: { pageSize: 50, action: action || undefined },
      })
      setEntries(res.data.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timeout = setTimeout(() => void load(actionFilter), 300)
    return () => clearTimeout(timeout)
  }, [actionFilter, load])

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Audit log</h1>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor="actionFilter">Filter by action</Label>
          <Input
            id="actionFilter"
            placeholder="e.g. campaign.launch, user.update"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No matching audit log entries.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{entry.action}</Badge>
                  </td>
                  <td className="max-w-64 truncate px-3 py-2 text-foreground">
                    {entry.entityType ?? "—"}
                    {entry.entityId && (
                      <span className="text-muted-foreground"> · {entry.entityId}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {entry.user ? `${entry.user.firstName} ${entry.user.lastName ?? ""}`.trim() : "system"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{entry.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

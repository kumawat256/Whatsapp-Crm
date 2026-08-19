import * as React from "react"
import { isAxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type {
  CreditTransaction,
  CreditWallet,
  MessageUsageReportRow,
  PaginatedResult,
} from "@/lib/crm-types"

const SOURCE_LABEL: Record<MessageUsageReportRow["source"], string> = {
  MANUAL: "Manual",
  CAMPAIGN: "Campaign",
  AUTOMATION: "Automation",
  UNKNOWN: "Unknown",
}

export function CreditsPage() {
  const [wallet, setWallet] = React.useState<CreditWallet | null>(null)
  const [transactions, setTransactions] = React.useState<CreditTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [reportFrom, setReportFrom] = React.useState("")
  const [reportTo, setReportTo] = React.useState("")
  const [reportRows, setReportRows] = React.useState<MessageUsageReportRow[]>([])
  const [reportLoading, setReportLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [walletRes, txRes] = await Promise.all([
        apiClient.get<CreditWallet>("/credits/wallet"),
        apiClient.get<PaginatedResult<CreditTransaction>>("/credits/transactions", {
          params: { pageSize: 50 },
        }),
      ])
      setWallet(walletRes.data)
      setTransactions(txRes.data.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReport = React.useCallback(async () => {
    setReportLoading(true)
    try {
      const res = await apiClient.get<PaginatedResult<MessageUsageReportRow>>(
        "/credits/message-usage-report",
        {
          params: {
            pageSize: 100,
            from: reportFrom ? new Date(reportFrom).toISOString() : undefined,
            // include the whole "to" day, not just its midnight
            to: reportTo ? new Date(`${reportTo}T23:59:59.999`).toISOString() : undefined,
          },
        },
      )
      setReportRows(res.data.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setReportLoading(false)
    }
  }, [reportFrom, reportTo])

  React.useEffect(() => {
    void load()
  }, [load])

  React.useEffect(() => {
    void loadReport()
  }, [loadReport])

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Credits</h1>
          <p className="text-sm text-muted-foreground">
            Only your platform administrator can add credits — reach out to them for a top-up.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Wallet balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">
              {loading ? "…" : (wallet?.balance ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              1 credit is deducted per outbound WhatsApp message sent. Sends are
              refused once the balance runs out.
            </p>
          </CardContent>
        </Card>

        <h2 className="mb-3 text-sm font-medium text-foreground">Transaction history</h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">By</th>
                <th className="px-3 py-2 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={tx.type === "CREDIT" ? "default" : "outline"}>
                      {tx.type === "CREDIT" ? `+${tx.amount}` : `-${tx.amount}`}
                    </Badge>
                  </td>
                  <td className="max-w-64 truncate px-3 py-2 text-foreground" title={tx.reason}>
                    {tx.reason}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {tx.createdBy ? `${tx.createdBy.firstName} ${tx.createdBy.lastName ?? ""}`.trim() : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground">{tx.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">Message credit usage report</h2>
            <p className="text-xs text-muted-foreground">
              Every message that used a credit — who it went to, and whether it was sent
              manually, by a campaign, or by an automation.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="reportFrom" className="text-xs">
                From
              </Label>
              <Input
                id="reportFrom"
                type="date"
                className="h-8"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="reportTo" className="text-xs">
                To
              </Label>
              <Input
                id="reportTo"
                type="date"
                className="h-8"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
              />
            </div>
            {(reportFrom || reportTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReportFrom("")
                  setReportTo("")
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Contact</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Sent via</th>
                <th className="px-3 py-2 font-medium">Sent by</th>
                <th className="px-3 py-2 text-right font-medium">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!reportLoading && reportRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No credit usage in this range.
                  </td>
                </tr>
              )}
              {reportRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-foreground">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">{row.contactName ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.contactPhone ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">
                      {SOURCE_LABEL[row.source]}
                      {row.source === "CAMPAIGN" && row.campaignName ? ` · ${row.campaignName}` : ""}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.sentByUserName ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-foreground">{row.amount}</td>
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

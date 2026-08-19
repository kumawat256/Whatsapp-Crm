import * as React from "react"
import { isAxiosError } from "axios"
import type { Socket } from "socket.io-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { connectWhatsAppSocket } from "@/lib/whatsapp-socket"

type AccountStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "LOGGED_OUT"

interface WhatsAppAccount {
  id: string
  label: string
  phoneNumber: string | null
  status: AccountStatus
  connectedAt: string | null
  lastSeenAt: string | null
}

const STATUS_VARIANT: Record<AccountStatus, "default" | "secondary" | "outline" | "destructive"> = {
  CONNECTED: "default",
  CONNECTING: "secondary",
  DISCONNECTED: "outline",
  LOGGED_OUT: "destructive",
}

export function WhatsAppPage() {
  const [accounts, setAccounts] = React.useState<WhatsAppAccount[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [addOpen, setAddOpen] = React.useState(false)
  const [label, setLabel] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const [qrAccountId, setQrAccountId] = React.useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null)
  const [qrStatus, setQrStatus] = React.useState<AccountStatus>("CONNECTING")
  const socketRef = React.useRef<Socket | null>(null)

  const loadAccounts = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<WhatsAppAccount[]>("/whatsapp/accounts")
      setAccounts(res.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadAccounts()
  }, [loadAccounts])

  React.useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await apiClient.post<WhatsAppAccount>("/whatsapp/accounts", { label })
      setAddOpen(false)
      setLabel("")
      await loadAccounts()
      openQrFlow(res.data.id)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setCreating(false)
    }
  }

  function openQrFlow(accountId: string) {
    setQrAccountId(accountId)
    setQrDataUrl(null)
    setQrStatus("CONNECTING")

    const socket = connectWhatsAppSocket()
    socketRef.current = socket

    socket.on("connect", () => socket.emit("subscribe", accountId))
    socket.on("qr", (payload: { qrDataUrl: string }) => setQrDataUrl(payload.qrDataUrl))
    socket.on("status", (payload: { status: AccountStatus }) => {
      setQrStatus(payload.status)
      if (payload.status === "CONNECTED") {
        void loadAccounts()
      }
    })

    apiClient.post(`/whatsapp/accounts/${accountId}/connect`).catch((err: unknown) => {
      setError(extractMessage(err))
    })
  }

  function closeQrFlow() {
    socketRef.current?.disconnect()
    socketRef.current = null
    setQrAccountId(null)
    setQrDataUrl(null)
  }

  async function handleDisconnect(accountId: string) {
    try {
      await apiClient.post(`/whatsapp/accounts/${accountId}/disconnect`)
      await loadAccounts()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleDelete(accountId: string) {
    try {
      await apiClient.delete(`/whatsapp/accounts/${accountId}`)
      await loadAccounts()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">WhatsApp Accounts</h1>
            <p className="text-sm text-muted-foreground">
              QR-based personal WhatsApp Web sessions. This is not an official WhatsApp
              Business API integration, and QR automation is not ban-proof or policy-safe.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>Add account</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && accounts.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No WhatsApp accounts yet. Add one to start pairing.
              </CardContent>
            </Card>
          )}
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{account.label}</CardTitle>
                  <CardDescription>{account.phoneNumber ?? "Not paired yet"}</CardDescription>
                </div>
                <Badge variant={STATUS_VARIANT[account.status]}>{account.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {account.status === "DISCONNECTED" || account.status === "LOGGED_OUT" ? (
                  <Button size="sm" onClick={() => openQrFlow(account.id)}>
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => void handleDisconnect(account.id)}>
                    Disconnect
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={account.status === "CONNECTED" || account.status === "CONNECTING"}
                  onClick={() => void handleDelete(account.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add WhatsApp account</DialogTitle>
              <DialogDescription>
                Give this connection a label (e.g. "Support Line"). You'll scan a QR code next.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create & connect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrAccountId} onOpenChange={(open) => !open && closeQrFlow()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan with WhatsApp</DialogTitle>
            <DialogDescription>
              Open WhatsApp on your phone → Linked devices → Link a device, then scan this
              code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrStatus === "CONNECTED" ? (
              <p className="text-sm font-medium text-foreground">Connected! You can close this dialog.</p>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="WhatsApp pairing QR code" className="size-64 rounded-md border" />
            ) : (
              <p className="text-sm text-muted-foreground">Generating QR code…</p>
            )}
            <Badge variant={STATUS_VARIANT[qrStatus]}>{qrStatus}</Badge>
          </div>
        </DialogContent>
      </Dialog>
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

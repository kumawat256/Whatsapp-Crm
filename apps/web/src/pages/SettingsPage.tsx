import * as React from "react"
import { isAxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import type { SystemSetting } from "@/lib/crm-types"

const DEFAULT_APP_NAME = "WhatsApp CRM"

export function SettingsPage() {
  const [settings, setSettings] = React.useState<SystemSetting[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [key, setKey] = React.useState("")
  const [editingExistingKey, setEditingExistingKey] = React.useState(false)
  const [valueText, setValueText] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const [appNameInput, setAppNameInput] = React.useState("")
  const [supportContactInput, setSupportContactInput] = React.useState("")
  const [brandingSaving, setBrandingSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<SystemSetting[]>("/settings")
      setSettings(res.data)
      const appNameSetting = res.data.find((s) => s.key === "branding.appName")
      const supportContactSetting = res.data.find((s) => s.key === "branding.supportContact")
      setAppNameInput(
        typeof appNameSetting?.value === "string" ? appNameSetting.value : DEFAULT_APP_NAME,
      )
      setSupportContactInput(
        typeof supportContactSetting?.value === "string" ? supportContactSetting.value : "",
      )
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault()
    setBrandingSaving(true)
    try {
      await Promise.all([
        apiClient.put("/settings/branding.appName", { value: appNameInput || DEFAULT_APP_NAME }),
        apiClient.put("/settings/branding.supportContact", { value: supportContactInput || "" }),
      ])
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBrandingSaving(false)
    }
  }

  function openCreate() {
    setKey("")
    setEditingExistingKey(false)
    setValueText("")
    setFormOpen(true)
  }

  function openEdit(setting: SystemSetting) {
    setKey(setting.key)
    setEditingExistingKey(true)
    setValueText(JSON.stringify(setting.value, null, 2))
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let value: unknown
      try {
        value = JSON.parse(valueText)
      } catch {
        setError("Value must be valid JSON (e.g. true, 42, \"text\", or {\"a\":1})")
        setSaving(false)
        return
      }
      await apiClient.put(`/settings/${encodeURIComponent(key)}`, { value })
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <Button onClick={openCreate}>Add setting</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void saveBranding(e)} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="appName">App name</Label>
                <Input
                  id="appName"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder={DEFAULT_APP_NAME}
                />
                <p className="text-xs text-muted-foreground">
                  Shown on the login page and in every sidebar, platform-wide.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="supportContact">Support contact</Label>
                <Input
                  id="supportContact"
                  value={supportContactInput}
                  onChange={(e) => setSupportContactInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or support@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Shown to every customer's Admin/Agent so they know how to reach you. Leave
                  blank to hide it.
                </p>
              </div>
              <div>
                <Button type="submit" disabled={brandingSaving}>
                  {brandingSaving ? "Saving…" : "Save branding"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && settings.length === 0 && (
            <p className="text-sm text-muted-foreground">No settings configured yet.</p>
          )}
          {settings
            .filter((s) => s.key !== "branding.appName" && s.key !== "branding.supportContact")
            .map((s) => (
            <Card key={s.key}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle className="font-mono text-sm">{s.key}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs text-foreground">
                  {JSON.stringify(s.value, null, 2)}
                </pre>
                {s.updatedBy && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Last updated by {s.updatedBy.firstName} {s.updatedBy.lastName ?? ""} ·{" "}
                    {new Date(s.updatedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingExistingKey ? `Edit ${key}` : "Add setting"}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="settingKey">Key</Label>
                <Input
                  id="settingKey"
                  required
                  disabled={editingExistingKey}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. campaigns.defaultDailyLimit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="settingValue">Value (JSON)</Label>
                <Textarea
                  id="settingValue"
                  required
                  rows={6}
                  className="font-mono text-xs"
                  value={valueText}
                  onChange={(e) => setValueText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save setting"}
              </Button>
            </DialogFooter>
          </form>
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

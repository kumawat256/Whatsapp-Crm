import * as React from "react"
import { isAxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
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
import { apiClient } from "@/lib/api-client"
import type {
  Automation,
  AutomationActionType,
  PaginatedResult,
  Template,
} from "@/lib/crm-types"

interface FormState {
  name: string
  keyword: string
  actionType: AutomationActionType
  templateId: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: "",
  keyword: "",
  actionType: "send_template",
  templateId: "",
  isActive: true,
}

function describeTrigger(automation: Automation): string {
  const config = automation.triggerConfig as { keyword?: string }
  return config.keyword
    ? `Inbound message contains "${config.keyword}"`
    : "Any inbound message"
}

function describeAction(automation: Automation, templates: Template[]): string {
  const config = automation.actionConfig as { templateId?: string }
  const name = templates.find((t) => t.id === config.templateId)?.name ?? config.templateId
  return `Send template "${name}"`
}

export function AutomationsPage() {
  const [automations, setAutomations] = React.useState<Automation[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [automationsRes, templatesRes] = await Promise.all([
        apiClient.get<PaginatedResult<Automation>>("/automations", { params: { pageSize: 100 } }),
        apiClient.get<PaginatedResult<Template>>("/templates", { params: { pageSize: 100 } }),
      ])
      setAutomations(automationsRes.data.data)
      setTemplates(templatesRes.data.data)
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

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(automation: Automation) {
    const triggerConfig = automation.triggerConfig as { keyword?: string }
    const actionConfig = automation.actionConfig as { templateId?: string }
    setEditingId(automation.id)
    setForm({
      name: automation.name,
      keyword: triggerConfig.keyword ?? "",
      actionType: automation.actionType,
      templateId: actionConfig.templateId ?? "",
      isActive: automation.isActive,
    })
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        triggerType: "message_received" as const,
        triggerConfig: form.keyword ? { keyword: form.keyword } : {},
        actionType: form.actionType,
        actionConfig: { templateId: form.templateId },
        isActive: form.isActive,
      }
      if (editingId) {
        await apiClient.patch(`/automations/${editingId}`, payload)
      } else {
        await apiClient.post("/automations", payload)
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(automation: Automation) {
    try {
      await apiClient.patch(`/automations/${automation.id}`, { isActive: !automation.isActive })
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this automation?")) return
    try {
      await apiClient.delete(`/automations/${id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Automations</h1>
          <Button onClick={openCreate}>Create automation</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && automations.length === 0 && (
            <p className="text-sm text-muted-foreground">No automations yet.</p>
          )}
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  {automation.name}
                  {!automation.isActive && <Badge variant="outline">disabled</Badge>}
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(automation)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void toggleActive(automation)}>
                    {automation.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(automation.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                When: {describeTrigger(automation)}
                <br />
                Then: {describeAction(automation, templates)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit automation" : "Create automation"}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="automationName">Name</Label>
                <Input
                  id="automationName"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="automationKeyword">
                  Trigger — inbound message keyword (optional)
                </Label>
                <Input
                  id="automationKeyword"
                  placeholder="leave blank to match every inbound message"
                  value={form.keyword}
                  onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Action</Label>
                <p className="text-sm text-muted-foreground">Send a template reply</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Template</Label>
                <select
                  required
                  className="rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={form.templateId}
                  onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create automation"}
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

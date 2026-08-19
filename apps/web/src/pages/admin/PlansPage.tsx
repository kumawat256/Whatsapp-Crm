import * as React from "react"
import { isAxiosError } from "axios"
import { Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Plan } from "@/lib/crm-types"

interface FormState {
  name: string
  credits: string
  maxWhatsAppAccounts: string
  durationDays: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: "",
  credits: "",
  maxWhatsAppAccounts: "1",
  durationDays: "",
  isActive: true,
}

export function PlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<Plan[]>("/admin/plans")
      setPlans(res.data)
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

  function openEdit(plan: Plan) {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      credits: String(plan.credits),
      maxWhatsAppAccounts: String(plan.maxWhatsAppAccounts),
      durationDays: plan.durationDays ? String(plan.durationDays) : "",
      isActive: plan.isActive,
    })
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        credits: Number(form.credits),
        maxWhatsAppAccounts: Number(form.maxWhatsAppAccounts),
        durationDays: form.durationDays ? Number(form.durationDays) : null,
        ...(editingId ? { isActive: form.isActive } : {}),
      }
      if (editingId) {
        await apiClient.patch(`/admin/plans/${editingId}`, payload)
      } else {
        await apiClient.post("/admin/plans", payload)
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(plan: Plan) {
    if (!window.confirm(`Delete the "${plan.name}" plan? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/admin/plans/${plan.id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Plans</h1>
            <p className="mt-1 text-sm text-muted-foreground">Credit and account limits customers are assigned to.</p>
          </div>
          <Button
            onClick={openCreate}
            className="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-600"
          >
            Create plan
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && plans.length === 0 && (
            <p className="text-sm text-muted-foreground">No plans yet.</p>
          )}
          {plans.map((plan) => (
            <Card key={plan.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-600/5 text-indigo-600 dark:text-indigo-400">
                    <Wallet className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      {plan.name}
                      {!plan.isActive && <Badge variant="destructive">inactive</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {plan.credits} credits · up to {plan.maxWhatsAppAccounts} WhatsApp account
                      {plan.maxWhatsAppAccounts === 1 ? "" : "s"} ·{" "}
                      {plan.durationDays ? `expires after ${plan.durationDays}d` : "never expires"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(plan)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit plan" : "Create plan"}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="planName">Name</Label>
                <Input
                  id="planName"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="planCredits">Credits</Label>
                <Input
                  id="planCredits"
                  type="number"
                  min={0}
                  required
                  value={form.credits}
                  onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="planMaxAccounts">Max WhatsApp accounts</Label>
                <Input
                  id="planMaxAccounts"
                  type="number"
                  min={1}
                  required
                  value={form.maxWhatsAppAccounts}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxWhatsAppAccounts: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="planDuration">Duration (days)</Label>
                <Input
                  id="planDuration"
                  type="number"
                  min={1}
                  placeholder="Leave blank for no expiry"
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  When an org is assigned this plan, WhatsApp sending stops automatically this
                  many days later unless renewed.
                </p>
              </div>
              {editingId && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create plan"}
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

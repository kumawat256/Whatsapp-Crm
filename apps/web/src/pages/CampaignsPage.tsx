import * as React from "react"
import { isAxiosError } from "axios"
import {
  BarChart3,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
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
  LargeDialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WhatsAppPreview } from "@/components/whatsapp-preview"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { downloadFromApi } from "@/lib/download"
import { cn } from "@/lib/utils"
import type {
  Campaign,
  CampaignInsights,
  CampaignPreview,
  CampaignRecipient,
  CampaignStatus,
  List,
  OrganizationSelf,
  PaginatedResult,
  Template,
  WhatsAppAccountSummary,
} from "@/lib/crm-types"

const STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  SCHEDULED: "secondary",
  RUNNING: "default",
  PAUSED: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
  FAILED: "destructive",
}

interface CreateFormState {
  name: string
  templateId: string
  whatsAppAccountId: string
}

const EMPTY_FORM: CreateFormState = {
  name: "",
  templateId: "",
  whatsAppAccountId: "",
}

export function CampaignsPage() {
  const { user, hasPermission } = useAuth()
  const isAdmin = user?.role === "Admin"
  const canDelete = hasPermission("campaigns.delete")

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [templates, setTemplates] = React.useState<Template[]>([])
  const [accounts, setAccounts] = React.useState<WhatsAppAccountSummary[]>([])
  const [lists, setLists] = React.useState<List[]>([])

  const [formOpen, setFormOpen] = React.useState(false)
  const [form, setForm] = React.useState<CreateFormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  const [sendingSettings, setSendingSettings] = React.useState<OrganizationSelf["campaignSettings"] | null>(null)
  const [settingsForm, setSettingsForm] = React.useState({ batchSize: "5", intervalMinSeconds: "5", intervalMaxSeconds: "10" })
  const [settingsSaving, setSettingsSaving] = React.useState(false)

  const loadSendingSettings = React.useCallback(async () => {
    try {
      const res = await apiClient.get<OrganizationSelf>("/organization/me")
      setSendingSettings(res.data.campaignSettings)
      setSettingsForm({
        batchSize: String(res.data.campaignSettings.batchSize),
        intervalMinSeconds: String(res.data.campaignSettings.intervalMinSeconds),
        intervalMaxSeconds: String(res.data.campaignSettings.intervalMaxSeconds),
      })
    } catch (err) {
      setError(extractMessage(err))
    }
  }, [])

  React.useEffect(() => {
    void loadSendingSettings()
  }, [loadSendingSettings])

  async function saveSendingSettings(e: React.FormEvent) {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      const res = await apiClient.patch<OrganizationSelf["campaignSettings"]>("/organization/campaign-settings", {
        batchSize: Number(settingsForm.batchSize),
        intervalMinSeconds: Number(settingsForm.intervalMinSeconds),
        intervalMaxSeconds: Number(settingsForm.intervalMaxSeconds),
      })
      setSendingSettings(res.data)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSettingsSaving(false)
    }
  }

  const [detailCampaign, setDetailCampaign] = React.useState<Campaign | null>(null)
  const [recipients, setRecipients] = React.useState<CampaignRecipient[]>([])
  const [selectedListId, setSelectedListId] = React.useState("")
  const [preview, setPreview] = React.useState<CampaignPreview | null>(null)

  const [insightsOpen, setInsightsOpen] = React.useState(false)
  const [insights, setInsights] = React.useState<CampaignInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = React.useState(false)

  const [relaunchTarget, setRelaunchTarget] = React.useState<Campaign | null>(null)
  const [relaunchName, setRelaunchName] = React.useState("")
  const [relaunching, setRelaunching] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<PaginatedResult<Campaign>>("/campaigns", {
        params: { pageSize: 50 },
      })
      setCampaigns(res.data.data)
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

  async function openCreate() {
    setForm(EMPTY_FORM)
    setFormOpen(true)
    try {
      const [templatesRes, accountsRes] = await Promise.all([
        apiClient.get<PaginatedResult<Template>>("/templates", { params: { pageSize: 100 } }),
        apiClient.get<WhatsAppAccountSummary[]>("/whatsapp/accounts"),
      ])
      setTemplates(templatesRes.data.data)
      setAccounts(accountsRes.data)
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post("/campaigns", {
        name: form.name,
        templateId: form.templateId,
        whatsAppAccountId: form.whatsAppAccountId,
      })
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function openDetail(campaign: Campaign) {
    setDetailCampaign(campaign)
    setPreview(null)
    setSelectedListId("")
    const [listsRes, recipientsRes] = await Promise.all([
      apiClient.get<List[]>("/lists"),
      apiClient.get<PaginatedResult<CampaignRecipient>>(`/campaigns/${campaign.id}/recipients`, {
        params: { pageSize: 50 },
      }),
    ])
    setLists(listsRes.data)
    setRecipients(recipientsRes.data.data)
  }

  async function refreshDetail(campaignId: string) {
    const [campaignRes, recipientsRes] = await Promise.all([
      apiClient.get<Campaign>(`/campaigns/${campaignId}`),
      apiClient.get<PaginatedResult<CampaignRecipient>>(`/campaigns/${campaignId}/recipients`, {
        params: { pageSize: 50 },
      }),
    ])
    setDetailCampaign(campaignRes.data)
    setRecipients(recipientsRes.data.data)
    await load()
  }

  async function runPreview() {
    if (!detailCampaign || !selectedListId) return
    const res = await apiClient.post<CampaignPreview>(`/campaigns/${detailCampaign.id}/preview`, {
      listIds: [selectedListId],
    })
    setPreview(res.data)
  }

  async function addFromList() {
    if (!detailCampaign || !selectedListId) return
    try {
      await apiClient.post(`/campaigns/${detailCampaign.id}/recipients`, { listIds: [selectedListId] })
      await refreshDetail(detailCampaign.id)
      setPreview(null)
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function openInsights(campaign: Campaign) {
    setInsightsOpen(true)
    setInsightsLoading(true)
    setInsights(null)
    try {
      const res = await apiClient.get<CampaignInsights>(`/campaigns/${campaign.id}/insights`)
      setInsights(res.data)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setInsightsLoading(false)
    }
  }

  async function doAction(campaignId: string, action: string) {
    try {
      await apiClient.post(`/campaigns/${campaignId}/${action}`)
      await refreshDetail(campaignId)
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function deleteCampaign(campaign: Campaign) {
    if (!window.confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/campaigns/${campaign.id}`)
      setDetailCampaign(null)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  function openRelaunch(campaign: Campaign) {
    setRelaunchTarget(campaign)
    setRelaunchName(`${campaign.name} (Relaunch)`)
  }

  async function submitRelaunch(e: React.FormEvent) {
    e.preventDefault()
    if (!relaunchTarget) return
    setRelaunching(true)
    try {
      const res = await apiClient.post<Campaign>(`/campaigns/${relaunchTarget.id}/relaunch`, {
        name: relaunchName,
      })
      setRelaunchTarget(null)
      setDetailCampaign(null)
      await load()
      await openDetail(res.data)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setRelaunching(false)
    }
  }

  const totalRecipients = detailCampaign?.totalRecipients ?? 0
  const selectedTemplate = templates.find((t) => t.id === form.templateId) ?? null

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm("Stop ALL running campaigns immediately?")) return
                await apiClient.post("/campaigns/emergency-stop")
                await load()
              }}
            >
              Emergency stop
            </Button>
            <Button onClick={() => void openCreate()}>Create campaign</Button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Sending settings</CardTitle>
            <CardDescription>
              Campaigns send in batches, with a random pause between batches, to keep your WhatsApp
              account safe. {isAdmin ? "Tune this to your account's risk tolerance." : "Only an Admin can change this."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <form
                onSubmit={(e) => void saveSendingSettings(e)}
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="batchSize">Batch size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min={1}
                    max={50}
                    className="w-28"
                    value={settingsForm.batchSize}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, batchSize: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="intervalMin">Min interval (s)</Label>
                  <Input
                    id="intervalMin"
                    type="number"
                    min={1}
                    max={3600}
                    className="w-28"
                    value={settingsForm.intervalMinSeconds}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, intervalMinSeconds: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="intervalMax">Max interval (s)</Label>
                  <Input
                    id="intervalMax"
                    type="number"
                    min={1}
                    max={3600}
                    className="w-28"
                    value={settingsForm.intervalMaxSeconds}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, intervalMaxSeconds: e.target.value }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={settingsSaving}>
                  {settingsSaving ? "Saving…" : "Save"}
                </Button>
              </form>
            ) : (
              sendingSettings && (
                <p className="text-sm text-muted-foreground">
                  Batch size {sendingSettings.batchSize} · {sendingSettings.intervalMinSeconds}-
                  {sendingSettings.intervalMaxSeconds}s between batches
                </p>
              )
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          )}
          {campaigns.map((c) => (
            <Card key={c.id} className="cursor-pointer" onClick={() => void openDetail(c)}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription>
                    {c.template.name} · via {c.whatsAppAccount.label}
                  </CardDescription>
                </div>
                <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  <span>{c.totalRecipients} recipients</span>
                  <span>· sent {c.recipientCounts.SENT}</span>
                  <span>· failed {c.recipientCounts.FAILED}</span>
                  <span>· pending {c.recipientCounts.PENDING + c.recipientCounts.QUEUED}</span>
                </div>
                {c.status === "COMPLETED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      void openInsights(c)
                    }}
                  >
                    <BarChart3 className="size-3.5" />
                    Insights
                  </Button>
                )}
                {c.status === "COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openRelaunch(c)
                    }}
                  >
                    <RefreshCw className="size-3.5" />
                    Relaunch
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <LargeDialogContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>Create campaign</DialogTitle>
              <DialogDescription>
                Sends once to every recipient, then completes automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="campaignName">Name</Label>
                    <Input
                      id="campaignName"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
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
                  <div className="flex flex-col gap-2">
                    <Label>WhatsApp account</Label>
                    <select
                      required
                      className="rounded-md border bg-transparent px-3 py-2 text-sm"
                      value={form.whatsAppAccountId}
                      onChange={(e) => setForm((f) => ({ ...f, whatsAppAccountId: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  {sendingSettings && (
                    <div className="sm:col-span-2 rounded-md border bg-muted p-3 text-xs text-muted-foreground">
                      Will send in batches of {sendingSettings.batchSize}, with a random{" "}
                      {sendingSettings.intervalMinSeconds}-{sendingSettings.intervalMaxSeconds}s pause between
                      batches. Change this under Sending settings below.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Live preview</Label>
                  <div className="sticky top-0">
                    <WhatsAppPreview
                      body={selectedTemplate?.body ?? ""}
                      media={selectedTemplate?.media}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create campaign"}
              </Button>
            </DialogFooter>
          </form>
        </LargeDialogContent>
      </Dialog>

      <Dialog open={!!detailCampaign} onOpenChange={(open) => !open && setDetailCampaign(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailCampaign?.name}
              {detailCampaign && <Badge variant={STATUS_VARIANT[detailCampaign.status]}>{detailCampaign.status}</Badge>}
            </DialogTitle>
            <DialogDescription>
              {detailCampaign?.template.name} · via {detailCampaign?.whatsAppAccount.label}
            </DialogDescription>
          </DialogHeader>

          {detailCampaign && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {(Object.keys(detailCampaign.recipientCounts) as (keyof Campaign["recipientCounts"])[]).map(
                  (status) =>
                    detailCampaign.recipientCounts[status] > 0 && (
                      <Badge key={status} variant="outline">
                        {status}: {detailCampaign.recipientCounts[status]}
                      </Badge>
                    ),
                )}
                {totalRecipients === 0 && (
                  <span className="text-muted-foreground">No recipients added yet.</span>
                )}
              </div>

              {(detailCampaign.status === "DRAFT" || detailCampaign.status === "SCHEDULED") && (
                <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label>Add recipients from list</Label>
                    <select
                      className="rounded-md border bg-transparent px-3 py-2 text-sm"
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                    >
                      <option value="">Select a list…</option>
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l._count.members})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => void runPreview()}
                      disabled={!selectedListId}
                    >
                      Preview
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 sm:flex-none"
                      onClick={() => void addFromList()}
                      disabled={!selectedListId}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {preview && (
                <div className="rounded-md border bg-muted p-3 text-sm">
                  <p>Total contacts in selection: {preview.totalContacts}</p>
                  <p>Excluded (opted out): {preview.excludedOptedOut}</p>
                  <p>Already added: {preview.alreadyAdded}</p>
                  <p className="font-medium text-foreground">
                    Estimated new recipients: {preview.estimatedRecipients}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(detailCampaign.status === "DRAFT" || detailCampaign.status === "SCHEDULED") && (
                  <Button size="sm" onClick={() => void doAction(detailCampaign.id, "launch")}>
                    Launch
                  </Button>
                )}
                {detailCampaign.status === "RUNNING" && (
                  <Button size="sm" variant="outline" onClick={() => void doAction(detailCampaign.id, "pause")}>
                    Pause
                  </Button>
                )}
                {detailCampaign.status === "PAUSED" && (
                  <Button size="sm" onClick={() => void doAction(detailCampaign.id, "resume")}>
                    Resume
                  </Button>
                )}
                {["DRAFT", "SCHEDULED", "RUNNING", "PAUSED"].includes(detailCampaign.status) && (
                  <Button size="sm" variant="destructive" onClick={() => void doAction(detailCampaign.id, "cancel")}>
                    Cancel
                  </Button>
                )}
                {detailCampaign.status === "COMPLETED" && (
                  <Button size="sm" onClick={() => openRelaunch(detailCampaign)}>
                    <RefreshCw className="size-3.5" />
                    Relaunch
                  </Button>
                )}
                {canDelete && ["DRAFT", "COMPLETED", "CANCELLED", "FAILED"].includes(detailCampaign.status) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void deleteCampaign(detailCampaign)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto rounded-md border">
                {recipients.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">No recipients yet.</p>
                )}
                {recipients.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b p-2 text-sm last:border-b-0">
                    <span>
                      {r.contact.firstName} {r.contact.lastName} · {r.contact.phoneNumber}
                    </span>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 pr-8">
              <span className="truncate">{insights?.name ?? "Campaign insights"}</span>
              {insights && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() =>
                    void downloadFromApi(
                      `/campaigns/${insights.campaignId}/export`,
                      `campaign-${insights.campaignId}-report.csv`,
                    )
                  }
                >
                  Download report
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              How this campaign performed — delivery, failures, and credits spent.
            </DialogDescription>
          </DialogHeader>

          {insightsLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          )}

          {insights && !insightsLoading && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={Users}
                  label="Recipients"
                  value={insights.totalRecipients}
                  tone="neutral"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Delivered"
                  value={insights.sent}
                  tone="success"
                />
                <StatCard
                  icon={XCircle}
                  label="Failed"
                  value={insights.failed}
                  tone="danger"
                />
                <StatCard
                  icon={Wallet}
                  label="Credits used"
                  value={insights.creditsUsed}
                  tone="warning"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery rate</span>
                  <span className="font-medium text-foreground">
                    {Math.round(insights.deliveryRate * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.round(insights.deliveryRate * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border p-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="font-medium text-foreground">{insights.pending}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Skipped (opted out)</p>
                  <p className="font-medium text-foreground">{insights.skippedOptOut}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cancelled</p>
                  <p className="font-medium text-foreground">{insights.cancelled}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium text-foreground">
                    {insights.startedAt ? new Date(insights.startedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium text-foreground">
                    {insights.completedAt ? new Date(insights.completedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {formatDuration(insights.durationSeconds)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!relaunchTarget} onOpenChange={(open) => !open && setRelaunchTarget(null)}>
        <DialogContent>
          <form onSubmit={(e) => void submitRelaunch(e)}>
            <DialogHeader>
              <DialogTitle>Relaunch campaign</DialogTitle>
              <DialogDescription>
                Sends a fresh, single-attempt copy to the same recipients using the same
                template and WhatsApp account — just give it a new name.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <Label htmlFor="relaunchName">Name</Label>
              <Input
                id="relaunchName"
                required
                autoFocus
                value={relaunchName}
                onChange={(e) => setRelaunchName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={relaunching}>
                {relaunching ? "Relaunching…" : "Relaunch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
  tone: "neutral" | "success" | "danger" | "warning"
}) {
  const toneClass = {
    neutral: "bg-muted text-foreground",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[tone]

  return (
    <div className="rounded-lg border p-3">
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-md", toneClass)}>
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—"
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function extractMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { message?: string | string[] })?.message
    if (Array.isArray(message)) return message.join(", ")
    if (message) return message
  }
  return "Something went wrong"
}

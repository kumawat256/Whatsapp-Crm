import * as React from "react"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type {
  CreateOrganizationResult,
  CreditTransaction,
  CreditWallet,
  OrganizationDetail,
  OrganizationStatus,
  OrganizationSummary,
  OrganizationUser,
  PaginatedResult,
  Plan,
} from "@/lib/crm-types"

const KNOWN_MODULES: { key: string; label: string }[] = [
  { key: "whatsapp", label: "WhatsApp messaging (incl. inbox & media)" },
  { key: "campaigns", label: "Bulk campaigns" },
  { key: "automations", label: "Automations" },
  { key: "contacts", label: "Contacts" },
  { key: "lists", label: "Lists" },
  { key: "templates", label: "Templates" },
]

interface CreateFormState {
  name: string
  adminEmail: string
  adminFirstName: string
  adminLastName: string
  adminPassword: string
  planId: string
}

const EMPTY_CREATE: CreateFormState = {
  name: "",
  adminEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminPassword: "",
  planId: "",
}

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { startImpersonation } = useAuth()

  const [result, setResult] = React.useState<PaginatedResult<OrganizationSummary> | null>(null)
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<OrganizationStatus | "">("")
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState<CreateFormState>(EMPTY_CREATE)
  const [createResult, setCreateResult] = React.useState<CreateOrganizationResult | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [detailId, setDetailId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [orgsRes, plansRes] = await Promise.all([
        apiClient.get<PaginatedResult<OrganizationSummary>>("/admin/organizations", {
          params: { search: search || undefined, status: statusFilter || undefined, page, pageSize },
        }),
        apiClient.get<Plan[]>("/admin/plans"),
      ])
      setResult(orgsRes.data)
      setPlans(plansRes.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  React.useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setCreateForm(EMPTY_CREATE)
    setCreateOpen(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: createForm.name,
        adminEmail: createForm.adminEmail,
        adminFirstName: createForm.adminFirstName,
        adminLastName: createForm.adminLastName,
        adminPassword: createForm.adminPassword || undefined,
        planId: createForm.planId || undefined,
      }
      const res = await apiClient.post<CreateOrganizationResult>("/admin/organizations", payload)
      setCreateOpen(false)
      setCreateResult(res.data)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleImpersonate(organizationId: string, userId?: string) {
    try {
      const res = await apiClient.post<{ accessToken: string }>(
        `/admin/organizations/${organizationId}/impersonate`,
        userId ? { userId } : {},
      )
      await startImpersonation(res.data.accessToken)
      navigate("/")
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
            <p className="mt-1 text-sm text-muted-foreground">{result?.total ?? 0} total</p>
          </div>
          <Button
            onClick={openCreate}
            className="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-600"
          >
            Create customer
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-sm"
          />
          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrganizationStatus | "")
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5">Plan</th>
                <th className="px-4 py-2.5">Created</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && result?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              )}
              {result?.data.map((org) => (
                <tr key={org.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{org.name}</td>
                  <td className="px-4 py-2.5">
                    <StatusPill active={org.status === "ACTIVE"} onLabel="ACTIVE" offLabel="SUSPENDED" />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill active={org.serviceEnabled} onLabel="Enabled" offLabel="Disabled" />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{org.plan?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDetailId(org.id)}>
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleImpersonate(org.id)}
                      >
                        Login as
                      </Button>
                    </div>
                  </td>
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
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create customer</DialogTitle>
              <DialogDescription>
                Creates the organization and its first Customer Admin login.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input
                  id="orgName"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminFirstName">Admin first name</Label>
                <Input
                  id="adminFirstName"
                  required
                  value={createForm.adminFirstName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminFirstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminLastName">Admin last name</Label>
                <Input
                  id="adminLastName"
                  required
                  value={createForm.adminLastName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminLastName: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label htmlFor="adminEmail">Admin email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  value={createForm.adminEmail}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminEmail: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminPassword">Admin password (optional)</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  minLength={8}
                  placeholder="Leave blank to generate one"
                  value={createForm.adminPassword}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminPassword: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Plan (optional)</Label>
                <select
                  className="rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={createForm.planId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, planId: e.target.value }))}
                >
                  <option value="">No plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createResult} onOpenChange={(open) => !open && setCreateResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer created</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex flex-col gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Login email:</span>{" "}
              {createResult?.admin.email}
            </p>
            {createResult?.generatedPassword && (
              <>
                <p className="text-muted-foreground">
                  A password was generated — copy it now, it won't be shown again:
                </p>
                <code className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                  {createResult.generatedPassword}
                </code>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <OrganizationDetailDialog
        organizationId={detailId}
        onClose={() => setDetailId(null)}
        plans={plans}
        onChanged={() => void load()}
        onImpersonate={handleImpersonate}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------

function OrganizationDetailDialog({
  organizationId,
  onClose,
  plans,
  onChanged,
  onImpersonate,
}: {
  organizationId: string | null
  onClose: () => void
  plans: Plan[]
  onChanged: () => void
  onImpersonate: (organizationId: string, userId?: string) => Promise<void>
}) {
  const [org, setOrg] = React.useState<OrganizationDetail | null>(null)
  const [wallet, setWallet] = React.useState<CreditWallet | null>(null)
  const [transactions, setTransactions] = React.useState<CreditTransaction[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const [nameValue, setNameValue] = React.useState("")
  const [planIdValue, setPlanIdValue] = React.useState("")
  const [moduleFlags, setModuleFlags] = React.useState<Record<string, boolean>>({})

  const [adjustType, setAdjustType] = React.useState<"CREDIT" | "DEBIT">("CREDIT")
  const [adjustAmount, setAdjustAmount] = React.useState("")
  const [adjustReason, setAdjustReason] = React.useState("")

  const [resetTarget, setResetTarget] = React.useState<OrganizationUser | null>(null)
  const [resetResult, setResetResult] = React.useState<string | null>(null)

  const load = React.useCallback(async (id: string) => {
    setLoading(true)
    try {
      const [orgRes, walletRes, txRes] = await Promise.all([
        apiClient.get<OrganizationDetail>(`/admin/organizations/${id}`),
        apiClient.get<CreditWallet>(`/admin/organizations/${id}/credits/wallet`),
        apiClient.get<PaginatedResult<CreditTransaction>>(
          `/admin/organizations/${id}/credits/transactions`,
          { params: { pageSize: 20 } },
        ),
      ])
      setOrg(orgRes.data)
      setNameValue(orgRes.data.name)
      setPlanIdValue(orgRes.data.plan?.id ?? "")
      setModuleFlags(orgRes.data.enabledModules ?? {})
      setWallet(walletRes.data)
      setTransactions(txRes.data.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (organizationId) void load(organizationId)
    else {
      setOrg(null)
      setWallet(null)
      setTransactions([])
    }
  }, [organizationId, load])

  if (!organizationId) return null

  async function refresh() {
    if (organizationId) await load(organizationId)
    onChanged()
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    if (!organizationId) return
    setBusy(true)
    try {
      await apiClient.patch(`/admin/organizations/${organizationId}`, {
        name: nameValue,
        planId: planIdValue || null,
      })
      await refresh()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleStatus() {
    if (!organizationId || !org) return
    setBusy(true)
    try {
      const action = org.status === "ACTIVE" ? "suspend" : "activate"
      await apiClient.post(`/admin/organizations/${organizationId}/${action}`)
      await refresh()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleService() {
    if (!organizationId || !org) return
    setBusy(true)
    try {
      await apiClient.patch(`/admin/organizations/${organizationId}/service`, {
        enabled: !org.serviceEnabled,
      })
      await refresh()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveModules() {
    if (!organizationId) return
    setBusy(true)
    try {
      await apiClient.patch(`/admin/organizations/${organizationId}/modules`, {
        modules: moduleFlags,
      })
      await refresh()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleAdjustCredits(e: React.FormEvent) {
    e.preventDefault()
    if (!organizationId) return
    setBusy(true)
    try {
      await apiClient.post(`/admin/organizations/${organizationId}/credits/adjust`, {
        type: adjustType,
        amount: Number(adjustAmount),
        reason: adjustReason,
      })
      setAdjustAmount("")
      setAdjustReason("")
      await refresh()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!organizationId || !resetTarget) return
    setBusy(true)
    try {
      const res = await apiClient.post<{ generatedPassword?: string }>(
        `/admin/organizations/${organizationId}/reset-password`,
        { userId: resetTarget.id },
      )
      setResetResult(res.data.generatedPassword ?? null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function closeResetDialog() {
    setResetTarget(null)
    setResetResult(null)
  }

  return (
    <>
    <Dialog open={!!organizationId} onOpenChange={(open) => !open && onClose()}>
      <LargeDialogContent>
        <div className="overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {org?.name ?? "Loading…"}
            </DialogTitle>
            <DialogDescription>
              {org && (
                <span className="flex items-center gap-2">
                  <StatusPill active={org.status === "ACTIVE"} onLabel="ACTIVE" offLabel="SUSPENDED" />
                  <StatusPill
                    active={org.serviceEnabled}
                    onLabel="Service enabled"
                    offLabel="Service disabled"
                  />
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {loading && !org && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}

          {org && (
            <div className="mt-4 flex flex-col gap-8">
              <section className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void handleToggleStatus()} disabled={busy}>
                  {org.status === "ACTIVE" ? "Suspend" : "Activate"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleToggleService()} disabled={busy}>
                  {org.serviceEnabled ? "Disable service" : "Enable service"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => void onImpersonate(org.id)}
                  disabled={busy}
                  className="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-600"
                >
                  Login as customer
                </Button>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Details</h3>
                <form onSubmit={handleSaveDetails} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="detailName">Name</Label>
                    <Input
                      id="detailName"
                      required
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Plan</Label>
                    <select
                      className="rounded-md border bg-transparent px-3 py-2 text-sm"
                      value={planIdValue}
                      onChange={(e) => setPlanIdValue(e.target.value)}
                    >
                      <option value="">No plan</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" size="sm" disabled={busy}>
                      Save details
                    </Button>
                  </div>
                </form>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Feature modules</h3>
                <div className="flex flex-col gap-2">
                  {KNOWN_MODULES.map((mod) => {
                    const enabled = moduleFlags[mod.key] !== false
                    return (
                      <label key={mod.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            setModuleFlags((f) => ({ ...f, [mod.key]: e.target.checked }))
                          }
                        />
                        {mod.label}
                      </label>
                    )
                  })}
                  <div>
                    <Button size="sm" variant="outline" onClick={() => void handleSaveModules()} disabled={busy}>
                      Save modules
                    </Button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Credits</h3>
                <p className="mb-3 text-3xl font-bold tracking-tight text-foreground">
                  {wallet?.balance ?? 0}
                </p>
                <form onSubmit={handleAdjustCredits} className="mb-4 flex flex-wrap items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Type</Label>
                    <select
                      className="h-9 rounded-md border bg-transparent px-2 text-sm"
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as "CREDIT" | "DEBIT")}
                    >
                      <option value="CREDIT">Add credits</option>
                      <option value="DEBIT">Deduct credits</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="adjustAmount" className="text-xs">
                      Amount
                    </Label>
                    <Input
                      id="adjustAmount"
                      type="number"
                      min={1}
                      required
                      className="h-9 w-28"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor="adjustReason" className="text-xs">
                      Reason (required)
                    </Label>
                    <Input
                      id="adjustReason"
                      required
                      minLength={3}
                      className="h-9"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={busy}>
                    Apply
                  </Button>
                </form>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Reason</th>
                        <th className="px-3 py-2 text-right font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
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
                          <td className="px-3 py-2 text-right text-foreground">{tx.balanceAfter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Users</h3>
                <div className="flex flex-col gap-2">
                  {org.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <div>
                        <p className="text-foreground">
                          {u.firstName} {u.lastName}{" "}
                          {!u.isActive && <Badge variant="destructive">inactive</Badge>}
                        </p>
                        <p className="text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void onImpersonate(org.id, u.id)}
                        >
                          Login as
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setResetTarget(u)}>
                          Reset password
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </LargeDialogContent>
    </Dialog>

    <Dialog open={!!resetTarget} onOpenChange={(open) => !open && closeResetDialog()}>
      <DialogContent>
        {!resetResult ? (
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset password for {resetTarget?.email}</DialogTitle>
              <DialogDescription>
                A new password will be generated and shown once — the user will need it to log
                in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={busy}>
                {busy ? "Resetting…" : "Reset password"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Password reset</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">Copy it now, it won't be shown again:</p>
              <code className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                {resetResult}
              </code>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

function StatusPill({
  active,
  onLabel,
  offLabel,
}: {
  active: boolean
  onLabel: string
  offLabel: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-rose-500")} />
      {active ? onLabel : offLabel}
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

import * as React from "react"
import { isAxiosError } from "axios"
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
import { useAuth } from "@/lib/auth-context"
import type { AdminUser, PaginatedResult } from "@/lib/crm-types"

// Deliberately not the full `Role` type — the assignable-roles endpoint is
// tenant-safe and only ever returns the two roles a customer may assign
// (Admin, Agent), not the full global Role table (which includes Super
// Admin's own role and every permission detail).
interface AssignableRole {
  id: string
  name: string
}

interface CreateFormState {
  email: string
  password: string
  firstName: string
  lastName: string
  roleName: string
}

const EMPTY_CREATE: CreateFormState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  roleName: "",
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [roles, setRoles] = React.useState<AssignableRole[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState<CreateFormState>(EMPTY_CREATE)

  const [editUser, setEditUser] = React.useState<AdminUser | null>(null)
  const [editFirstName, setEditFirstName] = React.useState("")
  const [editLastName, setEditLastName] = React.useState("")
  const [editRoleId, setEditRoleId] = React.useState("")

  const [resetUser, setResetUser] = React.useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = React.useState("")

  const [saving, setSaving] = React.useState(false)

  // Only one Admin is allowed per organization — hide the option once one
  // already exists, rather than let the create/edit form round-trip to the
  // backend just to find out.
  const hasAdmin = users.some((u) => u.role.name === "Admin")
  const creatableRoles = roles.filter((r) => r.name !== "Admin" || !hasAdmin)
  const editableRoles = roles.filter(
    (r) => r.name !== "Admin" || !hasAdmin || editUser?.role.name === "Admin",
  )

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get<PaginatedResult<AdminUser>>("/users", { params: { pageSize: 100 } }),
        apiClient.get<AssignableRole[]>("/users/assignable-roles"),
      ])
      setUsers(usersRes.data.data)
      setRoles(rolesRes.data)
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
    setCreateForm(EMPTY_CREATE)
    setCreateOpen(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post("/users", createForm)
      setCreateOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(u: AdminUser) {
    setEditUser(u)
    setEditFirstName(u.firstName)
    setEditLastName(u.lastName)
    setEditRoleId(u.role.id)
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setSaving(true)
    try {
      await apiClient.patch(`/users/${editUser.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        roleId: editRoleId,
      })
      setEditUser(null)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(u: AdminUser) {
    if (!window.confirm(`Delete ${u.firstName} ${u.lastName} (${u.email})? This cannot be undone.`))
      return
    try {
      await apiClient.delete(`/users/${u.id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await apiClient.patch(`/users/${u.id}`, { isActive: !u.isActive })
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetUser) return
    setSaving(true)
    try {
      await apiClient.post(`/users/${resetUser.id}/reset-password`, { newPassword })
      setResetUser(null)
      setNewPassword("")
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <Button onClick={openCreate}>Create user</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          )}
          {users.map((u) => (
            <Card key={u.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {u.firstName} {u.lastName}
                    <Badge variant="outline">{u.role.name}</Badge>
                    {!u.isActive && <Badge variant="destructive">inactive</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setResetUser(u)}>
                    Reset password
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={u.id === currentUser?.id && u.isActive}
                    onClick={() => void toggleActive(u)}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={u.id === currentUser?.id}
                    onClick={() => void handleDelete(u)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create user</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="newUserEmail">Email</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newUserPassword">Password</Label>
                <Input
                  id="newUserPassword"
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newUserFirstName">First name</Label>
                <Input
                  id="newUserFirstName"
                  required
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newUserLastName">Last name</Label>
                <Input
                  id="newUserLastName"
                  required
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <select
                  required
                  className="rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={createForm.roleName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, roleName: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {creatableRoles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {hasAdmin && (
                  <p className="text-xs text-muted-foreground">
                    This organization already has an Admin — only one is allowed.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <form onSubmit={handleEditSave}>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="editFirstName">First name</Label>
                <Input
                  id="editFirstName"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editLastName">Last name</Label>
                <Input
                  id="editLastName"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <select
                  required
                  className="rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                >
                  {editableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent>
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset password for {resetUser?.email}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-2">
              <Label htmlFor="resetPassword">New password</Label>
              <Input
                id="resetPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Reset password"}
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

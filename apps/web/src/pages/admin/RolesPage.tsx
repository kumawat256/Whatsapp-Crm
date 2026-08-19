import * as React from "react"
import { isAxiosError } from "axios"
import { ShieldAlert } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import type { Permission, Role } from "@/lib/crm-types"

interface FormState {
  name: string
  description: string
  permissionKeys: Set<string>
}

const EMPTY_FORM: FormState = { name: "", description: "", permissionKeys: new Set() }

export function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<Role | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        apiClient.get<Role[]>("/roles"),
        apiClient.get<Permission[]>("/permissions"),
      ])
      setRoles(rolesRes.data)
      setPermissions(permissionsRes.data)
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
    setEditingRole(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(role: Role) {
    setEditingRole(role)
    setForm({
      name: role.name,
      description: role.description ?? "",
      permissionKeys: new Set(role.permissions.map((p) => p.key)),
    })
    setFormOpen(true)
  }

  function togglePermission(key: string) {
    setForm((f) => {
      const next = new Set(f.permissionKeys)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...f, permissionKeys: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        // System roles (Admin/Agent/Super Admin) can't be renamed — the
        // backend rejects name/description on those, so only send them for
        // a genuinely custom role.
        ...(editingRole?.isSystem ? {} : { name: form.name, description: form.description || undefined }),
        permissionKeys: Array.from(form.permissionKeys),
      }
      if (editingRole) {
        await apiClient.patch(`/roles/${editingRole.id}`, payload)
      } else {
        await apiClient.post("/roles", {
          name: form.name,
          description: form.description || undefined,
          permissionKeys: Array.from(form.permissionKeys),
        })
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(role: Role) {
    if (!window.confirm(`Delete the "${role.name}" role? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/roles/${role.id}`)
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform-wide roles and their permissions. Admin and Agent are shared by every
              customer — editing their permission set changes it for everyone.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-600"
          >
            Create role
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && roles.length === 0 && (
            <p className="text-sm text-muted-foreground">No roles yet.</p>
          )}
          {roles.map((role) => (
            <Card key={role.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-600/5 text-indigo-600 dark:text-indigo-400">
                    <ShieldAlert className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      {role.name}
                      {role.isSystem && <Badge variant="outline">system</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"} ·{" "}
                      {role._count.users} user{role._count.users === 1 ? "" : "s"}
                      {role.description ? ` · ${role.description}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(role)}>
                    Edit
                  </Button>
                  {!role.isSystem && (
                    <Button size="sm" variant="ghost" onClick={() => void handleDelete(role)}>
                      Delete
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRole ? `Edit "${editingRole.name}"` : "Create role"}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1">
              {!editingRole?.isSystem && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="roleName">Name</Label>
                    <Input
                      id="roleName"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="roleDescription">Description (optional)</Label>
                    <Textarea
                      id="roleDescription"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </>
              )}
              {editingRole?.isSystem && (
                <p className="text-xs text-muted-foreground">
                  System roles can't be renamed — only their permissions can be changed.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Label>Permissions</Label>
                <div className="flex flex-col gap-1.5 rounded-md border p-3">
                  {permissions.map((p) => (
                    <label key={p.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={form.permissionKeys.has(p.key)}
                        onChange={() => togglePermission(p.key)}
                      />
                      <span>
                        <span className="font-mono text-xs text-foreground">{p.key}</span>
                        {p.description && (
                          <span className="text-muted-foreground"> — {p.description}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingRole ? "Save changes" : "Create role"}
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

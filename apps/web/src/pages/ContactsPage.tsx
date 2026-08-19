import * as React from "react"
import { isAxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { downloadFromApi } from "@/lib/download"
import type { Contact, List, PaginatedResult } from "@/lib/crm-types"

interface ContactFormState {
  firstName: string
  lastName: string
  phoneNumber: string
  notes: string
  source: string
}

const EMPTY_FORM: ContactFormState = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  notes: "",
  source: "",
}

export function ContactsPage() {
  const [result, setResult] = React.useState<PaginatedResult<Contact> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<ContactFormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  const [importSummary, setImportSummary] = React.useState<{
    created: number
    updated: number
    skipped: { row: number; reason: string }[]
  } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Persists across page/search changes on purpose — building a big list
  // (hundreds+ contacts) means checking boxes across many pages, not just
  // the one currently on screen.
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [addToListOpen, setAddToListOpen] = React.useState(false)
  const [lists, setLists] = React.useState<List[]>([])
  const [listsLoading, setListsLoading] = React.useState(false)
  const [chosenListId, setChosenListId] = React.useState("")
  const [createListOpen, setCreateListOpen] = React.useState(false)
  const [newListName, setNewListName] = React.useState("")
  const [newListDescription, setNewListDescription] = React.useState("")
  const [listSaving, setListSaving] = React.useState(false)

  const pageSize = 20

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<PaginatedResult<Contact>>("/contacts", {
        params: { search: search || undefined, page, pageSize },
      })
      setResult(res.data)
      setError(null)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, page])

  React.useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditingId(contact.id)
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName ?? "",
      phoneNumber: contact.phoneNumber,
      notes: contact.notes ?? "",
      source: contact.source ?? "",
    })
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        phoneNumber: form.phoneNumber,
        notes: form.notes || undefined,
        source: form.source || undefined,
      }
      if (editingId) {
        await apiClient.patch(`/contacts/${editingId}`, payload)
      } else {
        await apiClient.post("/contacts", payload)
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this contact? This cannot be undone.")) return
    try {
      await apiClient.delete(`/contacts/${id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function toggleOptOut(contact: Contact) {
    try {
      await apiClient.post(`/contacts/${contact.id}/${contact.isOptedOut ? "opt-in" : "opt-out"}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const body = new FormData()
    body.append("file", file)
    try {
      const res = await apiClient.post("/contacts/import", body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setImportSummary(res.data)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pageIds = result?.data.map((c) => c.id) ?? []
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  async function openAddToList() {
    setChosenListId("")
    setAddToListOpen(true)
    setListsLoading(true)
    try {
      const res = await apiClient.get<List[]>("/lists")
      setLists(res.data)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setListsLoading(false)
    }
  }

  async function submitAddToList(e: React.FormEvent) {
    e.preventDefault()
    if (!chosenListId) return
    setListSaving(true)
    try {
      await apiClient.post(`/lists/${chosenListId}/members`, {
        contactIds: Array.from(selectedIds),
      })
      setAddToListOpen(false)
      setSelectedIds(new Set())
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setListSaving(false)
    }
  }

  function openCreateList() {
    setNewListName("")
    setNewListDescription("")
    setCreateListOpen(true)
  }

  async function submitCreateList(e: React.FormEvent) {
    e.preventDefault()
    setListSaving(true)
    try {
      const created = await apiClient.post<List>("/lists", {
        name: newListName,
        description: newListDescription || undefined,
      })
      await apiClient.post(`/lists/${created.data.id}/members`, {
        contactIds: Array.from(selectedIds),
      })
      setCreateListOpen(false)
      setSelectedIds(new Set())
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setListSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
            <p className="text-sm text-muted-foreground">{result?.total ?? 0} total</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => void handleImport(e)}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Import CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => void downloadFromApi("/contacts/import/template", "contacts-import-template.csv")}
            >
              Template
            </Button>
            <Button
              variant="outline"
              onClick={() => void downloadFromApi("/contacts/export?pageSize=100000", "contacts-export.csv")}
            >
              Export CSV
            </Button>
            <Button onClick={openCreate}>Add contact</Button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-sm"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border bg-muted/50 px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
            <Button size="sm" onClick={() => void openAddToList()}>
              Add to list
            </Button>
            <Button size="sm" variant="outline" onClick={openCreateList}>
              Create list from selection
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-2">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                  />
                </th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && result?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No contacts found.
                  </td>
                </tr>
              )}
              {result?.data.map((contact) => (
                <tr key={contact.id} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${contact.firstName}`}
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelected(contact.id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-4 py-2 text-foreground">{contact.phoneNumber}</td>
                  <td className="px-4 py-2">
                    {contact.isOptedOut ? (
                      <Badge variant="destructive">Opted out</Badge>
                    ) : (
                      <Badge variant="secondary">Subscribed</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(contact)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void toggleOptOut(contact)}>
                        {contact.isOptedOut ? "Opt in" : "Opt out"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void handleDelete(contact.id)}>
                        Delete
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit contact" : "Add contact"}</DialogTitle>
              <DialogDescription>
                Phone number must be unique across all contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  required
                  placeholder="e.g. 9876543210 or +919876543210"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  +91 is added automatically if you leave out the country code.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!importSummary} onOpenChange={(open) => !open && setImportSummary(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import complete</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex flex-col gap-2 text-sm">
            <p>Created: {importSummary?.created}</p>
            <p>Updated: {importSummary?.updated}</p>
            <p>Skipped: {importSummary?.skipped.length}</p>
            {importSummary && importSummary.skipped.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded-md border p-2 text-muted-foreground">
                {importSummary.skipped.map((s) => (
                  <li key={s.row}>
                    Row {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addToListOpen} onOpenChange={setAddToListOpen}>
        <DialogContent>
          <form onSubmit={(e) => void submitAddToList(e)}>
            <DialogHeader>
              <DialogTitle>Add {selectedIds.size} contact{selectedIds.size === 1 ? "" : "s"} to a list</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-2">
              <Label htmlFor="chosenList">List</Label>
              {listsLoading ? (
                <p className="text-sm text-muted-foreground">Loading lists…</p>
              ) : lists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No lists yet — create one instead.
                </p>
              ) : (
                <select
                  id="chosenList"
                  required
                  className="rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={chosenListId}
                  onChange={(e) => setChosenListId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l._count.members})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={listSaving || !chosenListId}>
                {listSaving ? "Adding…" : "Add to list"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
        <DialogContent>
          <form onSubmit={(e) => void submitCreateList(e)}>
            <DialogHeader>
              <DialogTitle>
                Create list from {selectedIds.size} contact{selectedIds.size === 1 ? "" : "s"}
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="newListName">Name</Label>
                <Input
                  id="newListName"
                  required
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newListDescription">Description (optional)</Label>
                <Textarea
                  id="newListDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={listSaving}>
                {listSaving ? "Creating…" : "Create list"}
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

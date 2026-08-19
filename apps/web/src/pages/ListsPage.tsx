import * as React from "react"
import { isAxiosError } from "axios"
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
import type { Contact, List, PaginatedResult } from "@/lib/crm-types"

export function ListsPage() {
  const [lists, setLists] = React.useState<List[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const [membersList, setMembersList] = React.useState<List | null>(null)
  const [members, setMembers] = React.useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<Contact[]>([])

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<List[]>("/lists")
      setLists(res.data)
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
    setName("")
    setDescription("")
    setFormOpen(true)
  }

  function openEdit(list: List) {
    setEditingId(list.id)
    setName(list.name)
    setDescription(list.description ?? "")
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name, description: description || undefined }
      if (editingId) {
        await apiClient.patch(`/lists/${editingId}`, payload)
      } else {
        await apiClient.post("/lists", payload)
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
    if (!window.confirm("Delete this list? Members are not deleted, only the list.")) return
    try {
      await apiClient.delete(`/lists/${id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function openMembers(list: List) {
    setMembersList(list)
    setSearchTerm("")
    setSearchResults([])
    await loadMembers(list.id)
  }

  async function loadMembers(listId: string) {
    const res = await apiClient.get<PaginatedResult<Contact>>(`/lists/${listId}/members`, {
      params: { pageSize: 100 },
    })
    setMembers(res.data.data)
  }

  async function handleSearchContacts(term: string) {
    setSearchTerm(term)
    if (!term) {
      setSearchResults([])
      return
    }
    const res = await apiClient.get<PaginatedResult<Contact>>("/contacts", {
      params: { search: term, pageSize: 5 },
    })
    setSearchResults(res.data.data)
  }

  async function addMember(contactId: string) {
    if (!membersList) return
    await apiClient.post(`/lists/${membersList.id}/members`, { contactIds: [contactId] })
    await loadMembers(membersList.id)
    await load()
  }

  async function removeMember(contactId: string) {
    if (!membersList) return
    await apiClient.delete(`/lists/${membersList.id}/members/${contactId}`)
    await loadMembers(membersList.id)
    await load()
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Lists</h1>
          <Button onClick={openCreate}>Create list</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && lists.length === 0 && (
            <p className="text-sm text-muted-foreground">No lists yet.</p>
          )}
          {lists.map((list) => (
            <div key={list.id} className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="font-medium text-foreground">{list.name}</p>
                <p className="text-sm text-muted-foreground">
                  {list.description || "No description"} · {list._count.members} members
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => void openMembers(list)}>
                  Members
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(list)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void handleDelete(list.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit list" : "Create list"}</DialogTitle>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="listName">Name</Label>
                <Input id="listName" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="listDescription">Description</Label>
                <Textarea
                  id="listDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create list"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!membersList} onOpenChange={(open) => !open && setMembersList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{membersList?.name} members</DialogTitle>
            <DialogDescription>Search contacts to add them to this list.</DialogDescription>
          </DialogHeader>
          <div className="my-2 flex flex-col gap-2">
            <Input
              placeholder="Search contacts by name or phone…"
              value={searchTerm}
              onChange={(e) => void handleSearchContacts(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="rounded-md border">
                {searchResults.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b p-2 text-sm last:border-b-0">
                    <span>
                      {c.firstName} {c.lastName} · {c.phoneNumber}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => void addMember(c.id)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-md border">
            {members.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">No members yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b p-2 text-sm last:border-b-0">
                <span>
                  {m.firstName} {m.lastName} · {m.phoneNumber}
                </span>
                <Button size="sm" variant="ghost" onClick={() => void removeMember(m.id)}>
                  Remove
                </Button>
              </div>
            ))}
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

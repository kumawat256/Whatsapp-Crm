import * as React from "react"
import { isAxiosError } from "axios"
import { ArrowLeft } from "lucide-react"
import type { Socket } from "socket.io-client"
import { AuthedMedia } from "@/components/authed-media"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { connectInboxSocket } from "@/lib/inbox-socket"
import { cn } from "@/lib/utils"
import type {
  Contact,
  Conversation,
  Message,
  PaginatedResult,
  WhatsAppAccountSummary,
} from "@/lib/crm-types"

export function InboxPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [composer, setComposer] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const socketRef = React.useRef<Socket | null>(null)

  const [newConvOpen, setNewConvOpen] = React.useState(false)
  const [accounts, setAccounts] = React.useState<WhatsAppAccountSummary[]>([])
  const [contactSearch, setContactSearch] = React.useState("")
  const [contactResults, setContactResults] = React.useState<Contact[]>([])
  const [selectedAccountId, setSelectedAccountId] = React.useState("")

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  const loadConversations = React.useCallback(async () => {
    const res = await apiClient.get<PaginatedResult<Conversation>>("/conversations", {
      params: { pageSize: 100 },
    })
    setConversations(res.data.data)
  }, [])

  React.useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  React.useEffect(() => {
    const socket = connectInboxSocket()
    socketRef.current = socket

    socket.on("message", (message: Message) => {
      // The same message fires this event multiple times as its status
      // progresses (sent -> server-ack -> delivered -> read) — upsert by id
      // instead of appending, or each status change renders as a new bubble.
      if (message.conversationId === selectedId) {
        setMessages((prev) => {
          const index = prev.findIndex((m) => m.id === message.id)
          if (index === -1) return [...prev, message]
          const next = [...prev]
          next[index] = message
          return next
        })
      }
      void loadConversations()
    })
    socket.on("conversation", () => {
      void loadConversations()
    })

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  async function selectConversation(id: string) {
    setSelectedId(id)
    setError(null)
    const res = await apiClient.get<PaginatedResult<Message>>(`/conversations/${id}/messages`, {
      params: { pageSize: 50 },
    })
    setMessages([...res.data.data].reverse())
    await apiClient.post(`/conversations/${id}/read`)
    await loadConversations()
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 0)
  }

  async function handleSendText(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !composer.trim()) return
    setSending(true)
    try {
      await apiClient.post(`/conversations/${selectedId}/messages`, {
        type: "TEXT",
        content: composer,
      })
      setComposer("")
      const res = await apiClient.get<PaginatedResult<Message>>(
        `/conversations/${selectedId}/messages`,
        { params: { pageSize: 50 } },
      )
      setMessages([...res.data.data].reverse())
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 0)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !selectedId) return
    setSending(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const uploadRes = await apiClient.post("/media", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      await apiClient.post(`/conversations/${selectedId}/messages`, {
        type: uploadRes.data.type,
        mediaId: uploadRes.data.id,
        caption: composer || undefined,
      })
      setComposer("")
      const res = await apiClient.get<PaginatedResult<Message>>(
        `/conversations/${selectedId}/messages`,
        { params: { pageSize: 50 } },
      )
      setMessages([...res.data.data].reverse())
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 0)
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function openNewConversation() {
    setNewConvOpen(true)
    setContactSearch("")
    setContactResults([])
    setSelectedAccountId("")
    const res = await apiClient.get<WhatsAppAccountSummary[]>("/whatsapp/accounts")
    setAccounts(res.data)
  }

  async function searchContacts(term: string) {
    setContactSearch(term)
    if (!term) {
      setContactResults([])
      return
    }
    const res = await apiClient.get<PaginatedResult<Contact>>("/contacts", {
      params: { search: term, pageSize: 5 },
    })
    setContactResults(res.data.data)
  }

  async function startConversation(contactId: string) {
    if (!selectedAccountId) {
      setError("Choose a WhatsApp account first")
      return
    }
    const res = await apiClient.post<Conversation>("/conversations", {
      contactId,
      whatsAppAccountId: selectedAccountId,
    })
    setNewConvOpen(false)
    await loadConversations()
    await selectConversation(res.data.id)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b p-3">
        <h1 className="text-lg font-semibold text-foreground">Inbox</h1>
        <Button size="sm" onClick={() => void openNewConversation()}>
          New conversation
        </Button>
      </div>

      {error && (
        <p className="border-b bg-destructive/10 p-2 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "w-full shrink-0 overflow-y-auto border-r md:block md:w-80",
            selected ? "hidden" : "block",
          )}
        >
          {conversations.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => void selectConversation(conv.id)}
              className={cn(
                "flex w-full flex-col gap-1 border-b p-3 text-left text-sm hover:bg-accent",
                selectedId === conv.id && "bg-accent",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {conv.contact.firstName} {conv.contact.lastName}
                </span>
                {conv.unreadCount > 0 && <Badge>{conv.unreadCount}</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">{conv.contact.phoneNumber}</span>
            </button>
          ))}
        </div>

        <div className={cn("flex-1 flex-col", selected ? "flex" : "hidden md:flex")}>
          {!selected && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view messages.
            </div>
          )}
          {selected && (
            <>
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-1 md:hidden"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div>
                    <p className="font-medium text-foreground">
                      {selected.contact.firstName} {selected.contact.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.contact.phoneNumber} · via {selected.whatsAppAccount.label}
                    </p>
                  </div>
                </div>
                <Badge variant={selected.whatsAppAccount.status === "CONNECTED" ? "default" : "outline"}>
                  {selected.whatsAppAccount.status}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-md rounded-lg px-3 py-2 text-sm",
                        msg.direction === "OUTBOUND"
                          ? "self-end bg-primary text-primary-foreground"
                          : "self-start bg-muted text-foreground",
                      )}
                    >
                      {msg.media && (
                        <AuthedMedia
                          mediaId={msg.media.id}
                          mimeType={msg.media.mimeType}
                          fileName={msg.media.fileName}
                        />
                      )}
                      {msg.content && <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        {msg.direction === "OUTBOUND" && <span>{msg.status}</span>}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form onSubmit={handleSendText} className="flex items-center gap-2 border-t p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => void handleAttach(e)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                >
                  📎
                </Button>
                <Input
                  placeholder="Type a message…"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !composer.trim()}>
                  Send
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>Pick a WhatsApp account and a contact.</DialogDescription>
          </DialogHeader>
          <div className="my-4 flex flex-col gap-3">
            <select
              className="rounded-md border bg-transparent px-3 py-2 text-sm"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="">Select WhatsApp account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.status !== "CONNECTED"}>
                  {a.label} ({a.status})
                </option>
              ))}
            </select>
            <Input
              placeholder="Search contacts by name or phone…"
              value={contactSearch}
              onChange={(e) => void searchContacts(e.target.value)}
            />
            {contactResults.length > 0 && (
              <div className="rounded-md border">
                {contactResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => void startConversation(c.id)}
                    className="flex w-full items-center justify-between border-b p-2 text-left text-sm last:border-b-0 hover:bg-accent"
                  >
                    <span>
                      {c.firstName} {c.lastName} · {c.phoneNumber}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

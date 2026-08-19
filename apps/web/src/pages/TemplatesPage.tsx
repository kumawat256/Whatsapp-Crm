import * as React from "react"
import { isAxiosError } from "axios"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LargeDialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WhatsAppPreview } from "@/components/whatsapp-preview"
import { apiClient } from "@/lib/api-client"
import { htmlToWhatsAppText } from "@/lib/whatsapp-format"
import type { Media, PaginatedResult, Template } from "@/lib/crm-types"

interface FormState {
  name: string
  category: string
  body: string
  isActive: boolean
  media: Media | null
}

const EMPTY_FORM: FormState = { name: "", category: "", body: "", isActive: true, media: null }

function detectVariables(body: string): string[] {
  const seen = new Set<string>()
  for (const match of body.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
    seen.add(match[1])
  }
  return Array.from(seen)
}

export function TemplatesPage() {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [uploadingMedia, setUploadingMedia] = React.useState(false)
  const mediaInputRef = React.useRef<HTMLInputElement>(null)

  const [htmlImportOpen, setHtmlImportOpen] = React.useState(false)
  const [htmlImportText, setHtmlImportText] = React.useState("")
  const htmlFileInputRef = React.useRef<HTMLInputElement>(null)

  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null)
  const [previewValues, setPreviewValues] = React.useState<Record<string, string>>({})
  const [previewResult, setPreviewResult] = React.useState<{ text: string; missing: string[] } | null>(
    null,
  )

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<PaginatedResult<Template>>("/templates", {
        params: { pageSize: 100 },
      })
      setTemplates(res.data.data)
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

  function openEdit(template: Template) {
    setEditingId(template.id)
    setForm({
      name: template.name,
      category: template.category ?? "",
      body: template.body,
      isActive: template.isActive,
      media: template.media,
    })
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        category: form.category || undefined,
        body: form.body,
        isActive: form.isActive,
        mediaId: form.media?.id ?? null,
      }
      if (editingId) {
        await apiClient.patch(`/templates/${editingId}`, payload)
      } else {
        await apiClient.post("/templates", { ...payload, mediaId: form.media?.id })
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
    if (!window.confirm("Delete this template?")) return
    try {
      await apiClient.delete(`/templates/${id}`)
      await load()
    } catch (err) {
      setError(extractMessage(err))
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadingMedia(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await apiClient.post<Media>("/media", body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setForm((f) => ({ ...f, media: res.data }))
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setUploadingMedia(false)
    }
  }

  async function handleHtmlFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const text = await file.text()
    setHtmlImportText(text)
  }

  function applyHtmlImport() {
    const converted = htmlToWhatsAppText(htmlImportText)
    setForm((f) => ({ ...f, body: f.body ? `${f.body}\n${converted}` : converted }))
    setHtmlImportOpen(false)
    setHtmlImportText("")
  }

  function openPreview(template: Template) {
    setPreviewTemplate(template)
    setPreviewValues(Object.fromEntries(template.variables.map((v) => [v, ""])))
    setPreviewResult(null)
  }

  async function runPreview() {
    if (!previewTemplate) return
    const res = await apiClient.post(`/templates/${previewTemplate.id}/preview`, {
      variables: previewValues,
    })
    setPreviewResult(res.data)
  }

  const liveVariables = detectVariables(form.body)

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
          <Button onClick={openCreate}>Create template</Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && templates.length === 0 && (
            <p className="text-sm text-muted-foreground">No templates yet.</p>
          )}
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {template.name}
                    {!template.isActive && <Badge variant="outline">inactive</Badge>}
                    {template.media && <Badge variant="secondary">📷 photo</Badge>}
                  </CardTitle>
                  <CardDescription>{template.category || "Uncategorized"}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => openPreview(template)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(template)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(template.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-foreground">{template.body}</p>
                {template.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
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
              <DialogTitle>{editingId ? "Edit template" : "Create template"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="templateName">Name</Label>
                    <Input
                      id="templateName"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="templateCategory">Category</Label>
                    <Input
                      id="templateCategory"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="templateBody">
                        Body — use {"{{variableName}}"} for placeholders
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setHtmlImportOpen(true)}
                      >
                        Import from HTML
                      </Button>
                    </div>
                    <Textarea
                      id="templateBody"
                      required
                      rows={10}
                      placeholder="Type or paste your message… *bold*, _italic_, ~strike~ are supported"
                      value={form.body}
                      onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    />
                    {liveVariables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {liveVariables.map((v) => (
                          <Badge key={v} variant="outline">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Photo (optional)</Label>
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleMediaUpload(e)}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingMedia}
                        onClick={() => mediaInputRef.current?.click()}
                      >
                        {uploadingMedia ? "Uploading…" : form.media ? "Replace photo" : "Add photo"}
                      </Button>
                      {form.media && (
                        <>
                          <span className="truncate text-xs text-muted-foreground">
                            {form.media.fileName}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setForm((f) => ({ ...f, media: null }))}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Live preview</Label>
                  <div className="sticky top-0">
                    <WhatsAppPreview body={form.body} media={form.media} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create template"}
              </Button>
            </DialogFooter>
          </form>
        </LargeDialogContent>
      </Dialog>

      <Dialog open={htmlImportOpen} onOpenChange={setHtmlImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from HTML</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Paste HTML source (e.g. copied from a webpage or email) or upload an .html file — it'll
              be converted to WhatsApp-friendly text (bold, italic, and lists preserved; everything
              else stripped) and appended to the body.
            </p>
            <input
              ref={htmlFileInputRef}
              type="file"
              accept=".html,.htm,text/html"
              className="hidden"
              onChange={(e) => void handleHtmlFile(e)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => htmlFileInputRef.current?.click()}
            >
              Upload .html file
            </Button>
            <Textarea
              rows={8}
              placeholder="<p>Paste HTML here…</p>"
              value={htmlImportText}
              onChange={(e) => setHtmlImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={applyHtmlImport} disabled={!htmlImportText.trim()}>
              Convert &amp; insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <LargeDialogContent>
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
              <div className="flex flex-col gap-3">
                {previewTemplate?.variables.map((v) => (
                  <div key={v} className="flex flex-col gap-2">
                    <Label htmlFor={`var-${v}`}>{v}</Label>
                    <Input
                      id={`var-${v}`}
                      value={previewValues[v] ?? ""}
                      onChange={(e) => setPreviewValues((prev) => ({ ...prev, [v]: e.target.value }))}
                    />
                  </div>
                ))}
                <Button type="button" onClick={() => void runPreview()} className="self-start">
                  Render preview
                </Button>
                {previewResult && previewResult.missing.length > 0 && (
                  <p className="text-xs text-destructive">
                    Missing: {previewResult.missing.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Live preview</Label>
                <div className="sticky top-0">
                  <WhatsAppPreview
                    body={previewResult?.text ?? previewTemplate?.body ?? ""}
                    media={previewTemplate?.media}
                  />
                </div>
              </div>
            </div>
          </div>
        </LargeDialogContent>
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

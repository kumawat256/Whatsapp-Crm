import * as React from "react"
import { apiClient } from "@/lib/api-client"
import { formatWhatsAppText } from "@/lib/whatsapp-format"
import type { Media } from "@/lib/crm-types"

function PreviewImage({ media }: { media: Media }) {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    void apiClient.get(`/media/${media.id}/file`, { responseType: "blob" }).then((res) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(res.data as Blob)
      setUrl(objectUrl)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [media.id])

  if (media.type !== "IMAGE") {
    return (
      <div className="mb-1 flex items-center gap-2 rounded-md bg-black/5 px-2 py-3 text-xs text-neutral-600">
        📎 {media.fileName}
      </div>
    )
  }
  if (!url) {
    return <div className="mb-1 h-32 w-full animate-pulse rounded-md bg-black/10" />
  }
  return (
    <img
      src={url}
      alt={media.fileName}
      className="mb-1 max-h-40 w-full rounded-md object-cover"
    />
  )
}

/** Mobile WhatsApp chat-bubble mockup — a live preview of how a template/message will actually look. */
export function WhatsAppPreview({
  body,
  media,
  businessName = "Your Business",
}: {
  body: string
  media?: Media | null
  businessName?: string
}) {
  const now = React.useMemo(
    () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [],
  )

  return (
    <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[24px] border-[6px] border-neutral-800 bg-neutral-800 shadow-lg">
      <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2 text-white">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
          {businessName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{businessName}</p>
          <p className="text-[10px] text-white/70">online</p>
        </div>
      </div>
      <div
        className="flex min-h-[280px] flex-col justify-end gap-2 px-2 py-3"
        style={{
          backgroundColor: "#e5ddd5",
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#dcf8c6] px-2 py-1.5 text-[13px] text-neutral-900 shadow">
          {media && <PreviewImage media={media} />}
          <p className="whitespace-pre-wrap break-words">
            {body ? (
              formatWhatsAppText(body)
            ) : (
              <span className="text-neutral-400">Message preview will appear here…</span>
            )}
          </p>
          <span className="float-right mt-0.5 ml-1.5 text-[10px] text-neutral-500">{now} ✓✓</span>
        </div>
      </div>
    </div>
  )
}

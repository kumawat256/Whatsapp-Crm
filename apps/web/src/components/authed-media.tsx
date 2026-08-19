import * as React from "react"
import { apiClient } from "@/lib/api-client"

export function AuthedMedia({
  mediaId,
  mimeType,
  fileName,
}: {
  mediaId: string
  mimeType: string
  fileName: string
}) {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    void apiClient.get(`/media/${mediaId}/file`, { responseType: "blob" }).then((res) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(res.data as Blob)
      setUrl(objectUrl)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  if (!url) {
    return <p className="text-xs text-muted-foreground">Loading attachment…</p>
  }
  if (mimeType.startsWith("image/")) {
    return <img src={url} alt={fileName} className="max-w-64 rounded-md border" />
  }
  if (mimeType.startsWith("video/")) {
    return <video src={url} controls className="max-w-64 rounded-md border" />
  }
  if (mimeType.startsWith("audio/")) {
    return <audio src={url} controls />
  }
  return (
    <a href={url} download={fileName} className="text-sm text-primary underline">
      📎 {fileName}
    </a>
  )
}

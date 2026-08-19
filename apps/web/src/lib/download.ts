import { apiClient } from "./api-client"

export async function downloadFromApi(url: string, filename: string) {
  const res = await apiClient.get(url, { responseType: "blob" })
  const blobUrl = URL.createObjectURL(res.data as Blob)
  const link = document.createElement("a")
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

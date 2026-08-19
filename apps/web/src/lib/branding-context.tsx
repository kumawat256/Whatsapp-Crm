import * as React from "react"
import { apiClient } from "./api-client"

const DEFAULT_APP_NAME = "WhatsApp CRM"

export interface Branding {
  appName: string
  supportContact: string | null
}

const BrandingContext = React.createContext<Branding>({
  appName: DEFAULT_APP_NAME,
  supportContact: null,
})

// Public endpoint (no auth needed) — the login page needs this before
// anyone's signed in, so it's fetched unconditionally at the app root
// rather than gated behind AuthProvider.
export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = React.useState<Branding>({
    appName: DEFAULT_APP_NAME,
    supportContact: null,
  })

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<Branding>("/branding")
        setBranding(res.data)
      } catch {
        // Falls back to the default name — a branding fetch failure must
        // never block the login page or the rest of the app from loading.
      }
    })()
  }, [])

  React.useEffect(() => {
    document.title = branding.appName
  }, [branding.appName])

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  return React.useContext(BrandingContext)
}

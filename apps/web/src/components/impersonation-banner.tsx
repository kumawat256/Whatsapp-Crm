import { ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function ImpersonationBanner() {
  const { user, isImpersonating, exitImpersonation } = useAuth()
  const navigate = useNavigate()

  if (!isImpersonating) return null

  function handleExit() {
    exitImpersonation()
    navigate("/admin/organizations")
  }

  return (
    <div className="flex items-center gap-2 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
      <ShieldAlert className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">
        Viewing as <span className="font-medium">{user?.firstName} {user?.lastName}</span>{" "}
        ({user?.email}) — logged in via Super Admin impersonation.
      </span>
      <Button size="sm" variant="outline" className="shrink-0" onClick={handleExit}>
        Exit
      </Button>
    </div>
  )
}

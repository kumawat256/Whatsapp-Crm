import * as React from "react"
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ScrollText,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useBranding } from "@/lib/branding-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Tenants",
    items: [
      { to: "/admin/organizations", label: "Customers", icon: Building2 },
      { to: "/admin/plans", label: "Plans", icon: CreditCard },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/roles", label: "Roles", icon: ShieldAlert },
      { to: "/admin/audit-logs", label: "Audit log", icon: ScrollText },
      { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
]

function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?"
}

// Deliberately a separate component from AppShell rather than a
// parametrized shared layout — same visual language (same CSS tokens), own
// nav config, matching how this codebase avoids abstraction elsewhere.
export function AdminShell() {
  const { user, logout } = useAuth()
  const { appName } = useBranding()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
          <ShieldAlert className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{appName}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">Super Admin</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md border-l-2 px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "border-indigo-500 bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {initials(user?.firstName, user?.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => void logout()}
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{appName}</span>
          {user && (
            <Badge variant="outline" className="ml-auto">
              {user.role}
            </Badge>
          )}
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

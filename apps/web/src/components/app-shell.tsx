import * as React from "react"
import {
  Activity,
  BarChart3,
  Contact,
  FileText,
  HelpCircle,
  Inbox as InboxIcon,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  ScrollText,
  Settings as SettingsIcon,
  Sun,
  Users as UsersIcon,
  Wallet,
  Zap,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImpersonationBanner } from "@/components/impersonation-banner"
import { useAuth } from "@/lib/auth-context"
import { useBranding } from "@/lib/branding-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Messaging",
    items: [
      { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle, permission: "whatsapp.manage" },
      { to: "/inbox", label: "Inbox", icon: InboxIcon, permission: "messages.manage" },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "/contacts", label: "Contacts", icon: Contact, permission: "contacts.manage" },
      { to: "/lists", label: "Lists", icon: ListChecks, permission: "lists.manage" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/templates", label: "Templates", icon: FileText, permission: "templates.manage" },
      { to: "/campaigns", label: "Campaigns", icon: Megaphone, permission: "campaigns.manage" },
      { to: "/automations", label: "Automations", icon: Zap, permission: "automations.manage" },
      { to: "/credits", label: "Credits", icon: Wallet, permission: "credits.manage" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3, permission: "analytics.view" },
      { to: "/users", label: "Users", icon: UsersIcon, permission: "users.manage" },
      { to: "/settings", label: "Settings", icon: SettingsIcon, permission: "settings.manage" },
      { to: "/audit-logs", label: "Audit log", icon: ScrollText, permission: "audit-logs.view" },
    ],
  },
]

function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?"
}

export function AppShell() {
  const { user, logout } = useAuth()
  const { appName, supportContact } = useBranding()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || user?.permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0)

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
          <Activity className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{appName}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">Admin panel</p>
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
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
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
        {supportContact && (
          <div className="mt-1 flex items-center gap-1.5 px-2 text-xs text-sidebar-foreground/60">
            <HelpCircle className="size-3.5 shrink-0" />
            <span className="truncate">Need help? {supportContact}</span>
          </div>
        )}
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
          {user && <Badge variant="outline" className="ml-auto">{user.role}</Badge>}
        </header>

        <ImpersonationBanner />

        {/* Pages scroll their own content; a page that needs the full height
            (e.g. Inbox's chat layout) uses h-full and manages its own
            internal scroll regions instead of relying on this scrolling. */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

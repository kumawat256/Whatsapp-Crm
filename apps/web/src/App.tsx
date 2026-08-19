import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AdminShell } from "@/components/admin-shell"
import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleProtectedRoute } from "@/components/role-protected-route"
import { TenantOnlyRoute } from "@/components/tenant-only-route"
import { AuthProvider } from "@/lib/auth-context"
import { BrandingProvider } from "@/lib/branding-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { OrganizationsPage } from "@/pages/admin/OrganizationsPage"
import { PlansPage } from "@/pages/admin/PlansPage"
import { RolesPage as AdminRolesPage } from "@/pages/admin/RolesPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { AuditLogsPage } from "@/pages/AuditLogsPage"
import { AutomationsPage } from "@/pages/AutomationsPage"
import { CampaignsPage } from "@/pages/CampaignsPage"
import { ContactsPage } from "@/pages/ContactsPage"
import { CreditsPage } from "@/pages/CreditsPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { InboxPage } from "@/pages/InboxPage"
import { ListsPage } from "@/pages/ListsPage"
import { LoginPage } from "@/pages/LoginPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { TemplatesPage } from "@/pages/TemplatesPage"
import { UsersPage } from "@/pages/UsersPage"
import { WhatsAppPage } from "@/pages/WhatsAppPage"

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <BrandingProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleProtectedRoute role="Super Admin" />}>
                  <Route element={<AdminShell />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/organizations" element={<OrganizationsPage />} />
                    <Route path="/admin/plans" element={<PlansPage />} />
                    <Route path="/admin/roles" element={<AdminRolesPage />} />
                    <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
                <Route element={<TenantOnlyRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/whatsapp" element={<WhatsAppPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/lists" element={<ListsPage />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/credits" element={<CreditsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/automations" element={<AutomationsPage />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrandingProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

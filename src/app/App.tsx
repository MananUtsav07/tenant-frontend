import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { usePageAnalytics } from '../hooks/usePageAnalytics'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { AdminLayout } from '../layouts/AdminLayout'
import { OwnerLayout } from '../layouts/OwnerLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { TenantLayout } from '../layouts/TenantLayout'
import { AdminProtectedRoute } from '../routes/AdminProtectedRoute'
import { OwnerProtectedRoute } from '../routes/OwnerProtectedRoute'
import { ROUTES } from '../routes/constants'
import { TenantProtectedRoute } from '../routes/TenantProtectedRoute'

function lazyNamedPage<TModule extends Record<string, unknown>, TKey extends keyof TModule>(
  importer: () => Promise<TModule>,
  key: TKey,
) {
  return lazy(async () => ({
    default: (await importer())[key] as ComponentType,
  }))
}

const LandingPage = lazyNamedPage(() => import('../pages/public/LandingPage'), 'LandingPage')
const FeaturesPage = lazyNamedPage(() => import('../pages/public/FeaturesPage'), 'FeaturesPage')
const HowItWorksPage = lazyNamedPage(() => import('../pages/public/HowItWorksPage'), 'HowItWorksPage')
const PricingPage = lazyNamedPage(() => import('../pages/public/PricingPage'), 'PricingPage')
const ContactPage = lazyNamedPage(() => import('../pages/public/ContactPage'), 'ContactPage')
const BlogPage = lazyNamedPage(() => import('../pages/public/BlogPage'), 'BlogPage')
const BlogPostPage = lazyNamedPage(() => import('../pages/public/BlogPostPage'), 'BlogPostPage')

const DocsHomePage = lazyNamedPage(() => import('../pages/docs/DocsHomePage'), 'DocsHomePage')
const DocsGettingStartedPage = lazyNamedPage(() => import('../pages/docs/DocsGettingStartedPage'), 'DocsGettingStartedPage')
const DocsTenantLoginPage = lazyNamedPage(() => import('../pages/docs/DocsTenantLoginPage'), 'DocsTenantLoginPage')
const DocsOwnerDashboardPage = lazyNamedPage(() => import('../pages/docs/DocsOwnerDashboardPage'), 'DocsOwnerDashboardPage')
const DocsSupportTicketsPage = lazyNamedPage(() => import('../pages/docs/DocsSupportTicketsPage'), 'DocsSupportTicketsPage')

const OwnerLoginPage = lazyNamedPage(() => import('../pages/auth/OwnerLoginPage'), 'OwnerLoginPage')
const OwnerForgotPasswordPage = lazyNamedPage(() => import('../pages/auth/OwnerForgotPasswordPage'), 'OwnerForgotPasswordPage')
const OwnerResetPasswordPage = lazyNamedPage(() => import('../pages/auth/OwnerResetPasswordPage'), 'OwnerResetPasswordPage')
const TenantLoginPage = lazyNamedPage(() => import('../pages/auth/TenantLoginPage'), 'TenantLoginPage')
const TenantForgotPasswordPage = lazyNamedPage(
  () => import('../pages/auth/TenantForgotPasswordPage'),
  'TenantForgotPasswordPage',
)
const TenantResetPasswordPage = lazyNamedPage(
  () => import('../pages/auth/TenantResetPasswordPage'),
  'TenantResetPasswordPage',
)
const AdminLoginPage = lazyNamedPage(() => import('../pages/auth/AdminLoginPage'), 'AdminLoginPage')

const OwnerDashboardPage = lazyNamedPage(() => import('../pages/owner/OwnerDashboardPage'), 'OwnerDashboardPage')
const OwnerPropertiesPage = lazyNamedPage(() => import('../pages/owner/OwnerPropertiesPage'), 'OwnerPropertiesPage')
const OwnerBrokersPage = lazyNamedPage(() => import('../pages/owner/OwnerBrokersPage'), 'OwnerBrokersPage')
const OwnerMaintenancePage = lazyNamedPage(() => import('../pages/owner/OwnerMaintenancePage'), 'OwnerMaintenancePage')
const OwnerTenantsPage = lazyNamedPage(() => import('../pages/owner/OwnerTenantsPage'), 'OwnerTenantsPage')
const OwnerTenantDetailPage = lazyNamedPage(() => import('../pages/owner/OwnerTenantDetailPage'), 'OwnerTenantDetailPage')
const OwnerTicketsPage = lazyNamedPage(() => import('../pages/owner/OwnerTicketsPage'), 'OwnerTicketsPage')
const OwnerNotificationsPage = lazyNamedPage(() => import('../pages/owner/OwnerNotificationsPage'), 'OwnerNotificationsPage')
const OwnerAutomationPage = lazyNamedPage(() => import('../pages/owner/OwnerAutomationPage'), 'OwnerAutomationPage')
const OwnerAutomationActivityPage = lazyNamedPage(
  () => import('../pages/owner/OwnerAutomationActivityPage'),
  'OwnerAutomationActivityPage',
)
const OwnerAiSettingsPage = lazyNamedPage(() => import('../pages/owner/OwnerAiSettingsPage'), 'OwnerAiSettingsPage')

const TenantDashboardPage = lazyNamedPage(() => import('../pages/tenant/TenantDashboardPage'), 'TenantDashboardPage')
const TenantTicketsPage = lazyNamedPage(() => import('../pages/tenant/TenantTicketsPage'), 'TenantTicketsPage')
const TenantSupportPage = lazyNamedPage(() => import('../pages/tenant/TenantSupportPage'), 'TenantSupportPage')

const AdminDashboardPage = lazyNamedPage(() => import('../pages/admin/AdminDashboardPage'), 'AdminDashboardPage')
const AdminOrganizationsPage = lazyNamedPage(() => import('../pages/admin/AdminOrganizationsPage'), 'AdminOrganizationsPage')
const AdminOrganizationDetailPage = lazyNamedPage(
  () => import('../pages/admin/AdminOrganizationDetailPage'),
  'AdminOrganizationDetailPage',
)
const AdminOwnersPage = lazyNamedPage(() => import('../pages/admin/AdminOwnersPage'), 'AdminOwnersPage')
const AdminTenantsPage = lazyNamedPage(() => import('../pages/admin/AdminTenantsPage'), 'AdminTenantsPage')
const AdminPropertiesPage = lazyNamedPage(() => import('../pages/admin/AdminPropertiesPage'), 'AdminPropertiesPage')
const AdminTicketsPage = lazyNamedPage(() => import('../pages/admin/AdminTicketsPage'), 'AdminTicketsPage')
const AdminAutomationsPage = lazyNamedPage(() => import('../pages/admin/AdminAutomationsPage'), 'AdminAutomationsPage')
const AdminContactMessagesPage = lazyNamedPage(
  () => import('../pages/admin/AdminContactMessagesPage'),
  'AdminContactMessagesPage',
)
const AdminBlogPage = lazyNamedPage(() => import('../pages/admin/AdminBlogPage'), 'AdminBlogPage')

function AppRoutes() {
  const { admin, loading: adminLoading } = useAdminAuth()

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.features} element={<FeaturesPage />} />
        <Route path={ROUTES.howItWorks} element={<HowItWorksPage />} />
        <Route path={ROUTES.pricing} element={<PricingPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path={ROUTES.blog} element={<BlogPage />} />
        <Route path={ROUTES.blogPost} element={<BlogPostPage />} />
        <Route path={ROUTES.docs} element={<DocsHomePage />} />
        <Route path={ROUTES.docsGettingStarted} element={<DocsGettingStartedPage />} />
        <Route path={ROUTES.docsTenantLogin} element={<DocsTenantLoginPage />} />
        <Route path={ROUTES.docsOwnerDashboard} element={<DocsOwnerDashboardPage />} />
        <Route path={ROUTES.docsSupportTickets} element={<DocsSupportTicketsPage />} />
        <Route path={ROUTES.ownerLogin} element={<OwnerLoginPage />} />
        <Route path={ROUTES.ownerForgotPassword} element={<OwnerForgotPasswordPage />} />
        <Route path={ROUTES.ownerResetPassword} element={<OwnerResetPasswordPage />} />
        <Route path={ROUTES.tenantLogin} element={<TenantLoginPage />} />
        <Route path={ROUTES.tenantForgotPassword} element={<TenantForgotPasswordPage />} />
        <Route path={ROUTES.tenantResetPassword} element={<TenantResetPasswordPage />} />
        <Route
          path={ROUTES.adminRoot}
          element={
            adminLoading ? (
              <div className="ph-prophives-bg flex min-h-screen items-center justify-center px-6 text-sm text-[var(--ph-text-muted)]">
                Loading admin session...
              </div>
            ) : (
              <Navigate to={admin ? ROUTES.adminDashboard : ROUTES.adminLogin} replace />
            )
          }
        />
        <Route path={ROUTES.adminLogin} element={<AdminLoginPage />} />
        <Route path={ROUTES.ownerLoginLegacy} element={<Navigate to={ROUTES.ownerLogin} replace />} />
        <Route path={ROUTES.tenantLoginLegacy} element={<Navigate to={ROUTES.tenantLogin} replace />} />
      </Route>

      <Route element={<OwnerProtectedRoute />}>
        <Route element={<OwnerLayout />}>
          <Route path={ROUTES.ownerDashboard} element={<OwnerDashboardPage />} />
          <Route path={ROUTES.ownerProperties} element={<OwnerPropertiesPage />} />
          <Route path={ROUTES.ownerBrokers} element={<OwnerBrokersPage />} />
          <Route path={ROUTES.ownerTenants} element={<OwnerTenantsPage />} />
          <Route path={ROUTES.ownerTenantDetail} element={<OwnerTenantDetailPage />} />
          <Route path={ROUTES.ownerTickets} element={<OwnerTicketsPage />} />
          <Route path={ROUTES.ownerMaintenance} element={<OwnerMaintenancePage />} />
          <Route path={ROUTES.ownerNotifications} element={<OwnerNotificationsPage />} />
          <Route path={ROUTES.ownerAutomation} element={<OwnerAutomationPage />} />
          <Route path={ROUTES.ownerAutomationActivity} element={<OwnerAutomationActivityPage />} />
          <Route path={ROUTES.ownerAiSettings} element={<OwnerAiSettingsPage />} />
          <Route path="/owner/applicants" element={<Navigate to={ROUTES.ownerDashboard} replace />} />
        </Route>
      </Route>

      <Route element={<TenantProtectedRoute />}>
        <Route element={<TenantLayout />}>
          <Route path={ROUTES.tenantDashboard} element={<TenantDashboardPage />} />
          <Route path={ROUTES.tenantTickets} element={<TenantTicketsPage />} />
          <Route path={ROUTES.tenantSupport} element={<TenantSupportPage />} />
        </Route>
      </Route>

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTES.adminOrganizations} element={<AdminOrganizationsPage />} />
          <Route path={ROUTES.adminOrganizationDetail} element={<AdminOrganizationDetailPage />} />
          <Route path={ROUTES.adminOwners} element={<AdminOwnersPage />} />
          <Route path={ROUTES.adminTenants} element={<AdminTenantsPage />} />
          <Route path={ROUTES.adminProperties} element={<AdminPropertiesPage />} />
          <Route path={ROUTES.adminTickets} element={<AdminTicketsPage />} />
          <Route path={ROUTES.adminAutomations} element={<AdminAutomationsPage />} />
          <Route path={ROUTES.adminContactMessages} element={<AdminContactMessagesPage />} />
          <Route path={ROUTES.adminBlog} element={<AdminBlogPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}

export function App() {
  usePageAnalytics()

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="ph-prophives-bg flex min-h-screen items-center justify-center px-6 text-sm text-[var(--ph-text-muted)]">
            Loading page...
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  )
}

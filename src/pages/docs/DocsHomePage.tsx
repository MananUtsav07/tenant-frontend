import { Button } from '../../components/common/Button'
import { SEO } from '../../components/common/SEO'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'

export function DocsHomePage() {
  return (
    <SectionContainer size="wide">
      <SEO title="Documentation" description="TenantFlow product documentation and setup guides." canonicalPath={ROUTES.docs} />

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Docs</p>
      <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">TenantFlow Documentation</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Quick guides for onboarding owners, helping tenants log in, and managing support operations.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Getting Started</h2>
          <p className="mt-2 text-sm text-slate-600">Set up your owner account, properties, and tenants from scratch.</p>
          <Button to={ROUTES.docsGettingStarted} variant="ghost" className="mt-3 px-0 text-blue-700 hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Tenant Login</h2>
          <p className="mt-2 text-sm text-slate-600">Help tenants access their dashboard using Tenant Access ID.</p>
          <Button to={ROUTES.docsTenantLogin} variant="ghost" className="mt-3 px-0 text-blue-700 hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Owner Dashboard</h2>
          <p className="mt-2 text-sm text-slate-600">Understand property, tenant, ticket, and notification workflows.</p>
          <Button to={ROUTES.docsOwnerDashboard} variant="ghost" className="mt-3 px-0 text-blue-700 hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Support Tickets</h2>
          <p className="mt-2 text-sm text-slate-600">Learn how tickets are created, managed, and resolved efficiently.</p>
          <Button to={ROUTES.docsSupportTickets} variant="ghost" className="mt-3 px-0 text-blue-700 hover:bg-transparent">
            Open guide
          </Button>
        </article>
      </div>
    </SectionContainer>
  )
}



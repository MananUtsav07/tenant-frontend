import { Button } from '../../components/common/Button'
import { SEO } from '../../components/common/SEO'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'

export function DocsHomePage() {
  return (
    <SectionContainer size="wide">
      <SEO title="Documentation" description="Prophives product documentation and setup guides." canonicalPath={ROUTES.docs} />

      <span className="ph-kicker">Documentation</span>
      <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)] md:text-6xl">Prophives Documentation</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
        Quick guides for onboarding owners, helping residents log in, and managing support operations inside Prophives.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="ph-surface-card rounded-xl p-5">
          <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Getting Started</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Set up your owner account, properties, and residents from scratch.</p>
          <Button to={ROUTES.docsGettingStarted} variant="ghost" className="mt-3 px-0 text-[#f3d49a] hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="ph-surface-card rounded-xl p-5">
          <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Resident Login</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Help residents access their workspace using their access ID.</p>
          <Button to={ROUTES.docsTenantLogin} variant="ghost" className="mt-3 px-0 text-[#f3d49a] hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="ph-surface-card rounded-xl p-5">
          <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Owner Workspace</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Understand property, resident, ticket, and notification workflows.</p>
          <Button to={ROUTES.docsOwnerDashboard} variant="ghost" className="mt-3 px-0 text-[#f3d49a] hover:bg-transparent">
            Open guide
          </Button>
        </article>

        <article className="ph-surface-card rounded-xl p-5">
          <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Support Tickets</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Learn how tickets are created, managed, and resolved efficiently.</p>
          <Button to={ROUTES.docsSupportTickets} variant="ghost" className="mt-3 px-0 text-[#f3d49a] hover:bg-transparent">
            Open guide
          </Button>
        </article>
      </div>
    </SectionContainer>
  )
}

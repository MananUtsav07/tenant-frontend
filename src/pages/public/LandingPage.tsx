import { Activity, BellRing, CircleDollarSign, MessageSquare, Sparkles, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CTASection } from '../../components/common/CTASection'
import { HeroSection } from '../../components/common/HeroSection'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import { FaqSection } from '../../sections/landing/FaqSection'
import { FeatureHighlightsSection } from '../../sections/landing/FeatureHighlightsSection'
import { HowItWorksSection } from '../../sections/landing/HowItWorksSection'
import { ProductBenefitsSection } from '../../sections/landing/ProductBenefitsSection'
import { TestimonialSection } from '../../sections/landing/TestimonialSection'
import type { OwnerSummary, PublicOperationsSnapshot } from '../../types/api'

type SnapshotMode = 'public' | 'owner'

function HeroPanel({
  mode,
  snapshot,
  ownerSummary,
  loading,
}: {
  mode: SnapshotMode
  snapshot: PublicOperationsSnapshot | null
  ownerSummary: OwnerSummary | null
  loading: boolean
}) {
  const renderCount = (value: number | null) => (value === null ? (loading ? '...' : '--') : value.toLocaleString('en-AE'))

  const openTickets = renderCount(
    mode === 'owner' ? ownerSummary?.open_tickets ?? null : snapshot?.open_tickets ?? null,
  )
  const tenantCount = renderCount(
    mode === 'owner' ? ownerSummary?.active_tenants ?? null : snapshot?.active_tenants ?? null,
  )
  const actionCount = renderCount(
    mode === 'owner' ? ownerSummary?.reminders_pending ?? null : snapshot?.due_this_week ?? null,
  )

  return (
    <div className="flex h-full min-h-[420px] flex-col gap-5 lg:min-h-[540px] lg:justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Live Portfolio Pulse</p>
          <h2 className="ph-title mt-2 text-2xl font-semibold text-[var(--ph-text)]">Signals from the command center</h2>
        </div>
        <span className="rounded-full border border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
          {mode === 'owner' ? 'Private View' : 'Public Benchmark'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-[rgba(83,88,100,0.38)] bg-white/[0.04] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
            <MessageSquare className="h-3.5 w-3.5 text-[var(--ph-accent)]" />
            Open Tickets
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ph-text)]">{openTickets}</p>
        </div>

        <div className="rounded-[1.35rem] border border-[rgba(83,88,100,0.38)] bg-white/[0.04] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
            <Users className="h-3.5 w-3.5 text-[var(--ph-accent)]" />
            Active Residents
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ph-text)]">{tenantCount}</p>
        </div>

        <div className="rounded-[1.35rem] border border-[rgba(83,88,100,0.38)] bg-white/[0.04] p-4 sm:col-span-2">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
            <BellRing className="h-3.5 w-3.5 text-[var(--ph-accent)]" />
            {mode === 'owner' ? 'Pending Reminder Actions' : 'Collections Due This Week'}
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ph-text)]">{actionCount}</p>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Automation Layer</p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--ph-text-soft)]">
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--ph-accent)]" />
            Resident support triage and status orchestration
          </li>
          <li className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-[var(--ph-accent)]" />
            Rent reminder timing with human approvals intact
          </li>
          <li className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--ph-accent)]" />
            Dashboard visibility for owners, operators, and residents
          </li>
        </ul>
      </div>

      {mode === 'public' && snapshot?.generated_at ? (
        <p className="text-xs text-[var(--ph-text-muted)]">
          Updated {new Date(snapshot.generated_at).toLocaleString('en-AE')}
        </p>
      ) : null}
    </div>
  )
}

export function LandingPage() {
  const { owner, token: ownerToken, loading: ownerLoading } = useOwnerAuth()

  const [snapshotMode, setSnapshotMode] = useState<SnapshotMode>('public')
  const [snapshot, setSnapshot] = useState<PublicOperationsSnapshot | null>(null)
  const [ownerSummary, setOwnerSummary] = useState<OwnerSummary | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)

  useEffect(() => {
    if (ownerLoading) {
      return
    }

    let cancelled = false

    const loadSnapshot = async () => {
      setSnapshotLoading(true)

      try {
        if (owner && ownerToken) {
          const response = await api.getOwnerSummary(ownerToken)
          if (!cancelled) {
            setSnapshotMode('owner')
            setOwnerSummary(response.summary)
            setSnapshot(null)
          }
          return
        }

        const response = await api.getPublicOperationsSnapshot()
        if (!cancelled) {
          setSnapshotMode('public')
          setSnapshot(response.snapshot)
          setOwnerSummary(null)
        }
      } catch {
        if (!cancelled) {
          setSnapshotMode(owner && ownerToken ? 'owner' : 'public')
          setOwnerSummary(null)
          setSnapshot(null)
        }
      } finally {
        if (!cancelled) {
          setSnapshotLoading(false)
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [owner, ownerLoading, ownerToken])

  usePageSeo({
    title: 'AI Property Operations Platform for Dubai Real Estate',
    description:
      'Prophives is a premium AI-powered property operations platform for Dubai real estate teams, with owner and tenant workspaces.',
    canonicalPath: ROUTES.home,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Prophives',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Premium AI-powered property operations platform for Dubai real estate teams, with owner and tenant workspaces.',
      offers: {
        '@type': 'Offer',
        category: 'SaaS',
      },
    },
  })

  return (
    <>
      <HeroSection
        badge="Premium AI Property Operations"
        fullViewport
        heading={
          <>
            The <span className="ph-highlight">AI operations layer</span> for premium Dubai real estate
          </>
        }
        subheading={
          <>
            Prophives brings resident service, rent workflows, and portfolio visibility into a single calm command
            center for owners, operators, and real estate teams.
          </>
        }
        actions={[
          { label: 'Book Private Demo', href: ROUTES.contact, variant: 'primary' },
          { label: 'Explore Platform', href: ROUTES.features, variant: 'secondary' },
          { label: 'Owner Login', href: ROUTES.ownerLogin, variant: 'outline' },
        ]}
        highlights={[
          'Premium operating environment for serious B2B real estate teams',
          'Owner and resident workspaces with controlled visibility',
          'AI-assisted reminders, service workflows, and approval handling',
          'Conversion-focused rollout for luxury portfolios in Dubai',
        ]}
        sidePanel={
          <HeroPanel
            mode={snapshotMode}
            snapshot={snapshot}
            ownerSummary={ownerSummary}
            loading={snapshotLoading}
          />
        }
      />

      <FeatureHighlightsSection />
      <HowItWorksSection />
      <ProductBenefitsSection />
      <TestimonialSection />
      <FaqSection />

      <CTASection
        eyebrow="Private Rollout"
        title={
          <>
            Ready to bring <span className="ph-highlight">luxury-grade operations</span> into one platform?
          </>
        }
        description={
          <>
            Launch your owner workspace, map your portfolio flows, and roll out resident-facing operations with a
            brand experience that feels premium from day one.
          </>
        }
        primaryAction={{ label: 'Talk to Prophives', href: ROUTES.contact }}
        secondaryAction={{ label: 'View Pricing', href: ROUTES.pricing }}
      />
    </>
  )
}

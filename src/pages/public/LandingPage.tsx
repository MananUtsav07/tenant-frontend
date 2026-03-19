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

function LiveMetricsStrip({
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
  const renderCount = (value: number | null) =>
    value === null ? (loading ? '·' : '--') : value.toLocaleString('en-AE')

  const openTickets = renderCount(mode === 'owner' ? ownerSummary?.open_tickets ?? null : snapshot?.open_tickets ?? null)
  const tenantCount = renderCount(mode === 'owner' ? ownerSummary?.active_tenants ?? null : snapshot?.active_tenants ?? null)
  const actionCount = renderCount(mode === 'owner' ? ownerSummary?.reminders_pending ?? null : snapshot?.due_this_week ?? null)

  const metrics = [
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Open Tickets', value: openTickets },
    { icon: <Users className="h-4 w-4" />, label: 'Active Residents', value: tenantCount },
    { icon: <BellRing className="h-4 w-4" />, label: mode === 'owner' ? 'Pending Reminders' : 'Collections Due', value: actionCount },
  ]

  const features = [
    { icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Resident support triage and status orchestration' },
    { icon: <CircleDollarSign className="h-3.5 w-3.5" />, label: 'Rent reminder timing with human approvals intact' },
    { icon: <Activity className="h-3.5 w-3.5" />, label: 'Dashboard visibility for owners, operators, and residents' },
  ]

  return (
    <div className="border-y border-[rgba(83,88,100,0.14)] bg-[rgba(9,13,21,0.72)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-0 lg:divide-x lg:divide-[rgba(83,88,100,0.14)]">

          {/* Live pulse label */}
          <div className="flex items-center gap-3 lg:pr-8">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ph-accent)]" style={{ animation: 'ph-dot-blink 2s ease-in-out infinite' }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ph-text-muted)]">Live Portfolio Pulse</span>
            </span>
            <span className="rounded-full border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f1cb85]">
              {mode === 'owner' ? 'Private' : 'Benchmark'}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-6 lg:flex-1 lg:justify-center lg:px-8">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-[var(--ph-text-muted)]">{m.icon}</span>
                <div>
                  <p className="font-heading text-xl font-semibold leading-none text-[var(--ph-text)]">{m.value}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--ph-text-muted)]">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Automation features */}
          <div className="flex flex-col gap-1.5 lg:pl-8">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-[11px] text-[var(--ph-text-muted)]">
                <span className="shrink-0 text-[var(--ph-accent)]">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

        </div>
        {mode === 'public' && snapshot?.generated_at ? (
          <p className="mt-3 text-[10px] text-[var(--ph-text-muted)] opacity-60">
            Updated {new Date(snapshot.generated_at).toLocaleString('en-AE')}
          </p>
        ) : null}
      </div>
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
      />

      <LiveMetricsStrip
        mode={snapshotMode}
        snapshot={snapshot}
        ownerSummary={ownerSummary}
        loading={snapshotLoading}
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

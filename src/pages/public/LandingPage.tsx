import { BellRing, CircleDollarSign, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CTASection } from '../../components/common/CTASection'
import { HeroSection } from '../../components/common/HeroSection'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import { FeatureHighlightsSection } from '../../sections/landing/FeatureHighlightsSection'
import { HowItWorksSection } from '../../sections/landing/HowItWorksSection'
import { ProductBenefitsSection } from '../../sections/landing/ProductBenefitsSection'
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
  const renderCount = (value: number | null) => (value === null ? (loading ? '...' : '--') : value.toLocaleString('en-IN'))

  const openTickets = renderCount(
    mode === 'owner' ? ownerSummary?.open_tickets ?? null : snapshot?.open_tickets ?? null,
  )
  const secondMetric = renderCount(
    mode === 'owner' ? ownerSummary?.active_tenants ?? null : snapshot?.active_tenants ?? null,
  )
  const thirdMetric = renderCount(
    mode === 'owner' ? ownerSummary?.reminders_pending ?? null : snapshot?.due_this_week ?? null,
  )

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Live Operations Snapshot</p>
      <h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Owner dashboard in one glance</h2>
      <div className="mt-6 grid gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-xs uppercase text-slate-500">
            <MessageSquare className="h-3.5 w-3.5" />
            Open Tickets
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{openTickets}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-2 text-xs uppercase text-slate-500">
              <BellRing className="h-3.5 w-3.5" />
              Active Tenants
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{secondMetric}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-2 text-xs uppercase text-slate-500">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {mode === 'owner' ? 'Reminders Pending' : 'Due This Week'}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{thirdMetric}</p>
          </div>
        </div>
        {mode === 'public' && snapshot?.generated_at ? (
          <p className="mt-3 text-xs text-slate-500">Updated {new Date(snapshot.generated_at).toLocaleString('en-IN')}</p>
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
    title: 'Property Management SaaS for Owners and Tenants',
    description:
      'TenantFlow helps property owners manage tenants, support tickets, reminders, and notifications from one platform.',
    canonicalPath: ROUTES.home,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TenantFlow',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'TenantFlow helps property owners manage tenants, support tickets, reminders, and notifications from one platform.',
      offers: {
        '@type': 'Offer',
        category: 'SaaS',
      },
    },
  })

  return (
    <>
      <HeroSection
        badge="Property Management SaaS"
        heading="Manage tenants, tickets, and reminders from one owner command center"
        subheading="TenantFlow gives landlords and property managers a focused platform for tenant operations, issue tracking, and rent reminder workflows."
        actions={[
          { label: 'Get Started', href: ROUTES.pricing, variant: 'secondary' },
          { label: 'Owner Login', href: ROUTES.ownerLogin, variant: 'primary' },
          { label: 'Tenant Login', href: ROUTES.tenantLogin, variant: 'outline' },
        ]}
        highlights={[
          'Tenant communication in one workspace',
          'Support ticket tracking',
          'Automated reminder workflows',
          'Portfolio-level visibility',
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
      <CTASection
        title="Start managing your tenants the smarter way."
        description="Create your owner account, add your properties, and onboard tenants with secure access IDs."
        primaryAction={{ label: 'Start Free Setup', href: ROUTES.ownerLogin }}
        secondaryAction={{ label: 'Contact Sales', href: ROUTES.contact }}
      />
    </>
  )
}

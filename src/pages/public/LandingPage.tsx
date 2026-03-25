import { BellRing, Building2, CreditCard, MessageCircle, MessageSquare, Send, Sparkles, Users } from 'lucide-react'
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
import type { OwnerSummary, PublicOperationsSnapshot } from '../../types/api'

type SnapshotMode = 'public' | 'owner'

function LivePortfolioCard({
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
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#92700A]">Live Portfolio</p>
          <h2 className="ph-title mt-1 text-xl font-bold text-[#1A1A1A]">Real-time metrics</h2>
        </div>
        <span className="ph-badge ph-badge-gold">
          {mode === 'owner' ? 'Private' : 'Public'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#FEFAEF] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
            <Building2 className="h-3.5 w-3.5 text-[#FED609]" />
            Properties
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">{openTickets}</p>
        </div>
        <div className="rounded-xl bg-[#FEFAEF] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
            <Users className="h-3.5 w-3.5 text-[#FED609]" />
            Tenants
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">{tenantCount}</p>
        </div>
        <div className="rounded-xl bg-[#FEFAEF] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
            <BellRing className="h-3.5 w-3.5 text-[#FED609]" />
            {mode === 'owner' ? 'Pending' : 'Due'}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">{actionCount}</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-auto grid gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-[#FFFAE2] p-3">
          <Sparkles className="h-5 w-5 text-[#FED609]" />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">AI Automation</p>
            <p className="text-xs text-[#6B7280]">Smart ticket classification & reminders</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-[#FFFAE2] p-3">
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">WhatsApp & Telegram</p>
            <p className="text-xs text-[#6B7280]">Integrated tenant messaging</p>
          </div>
        </div>
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
        badge="AI-Powered Property Management"
        fullViewport
        heading={
          <>
            Manage Your Properties{' '}
            <span className="text-[#D4A800]">Smarter with AI</span>
          </>
        }
        subheading="Automate rent collection, tenant communication, and property operations from one beautiful dashboard."
        actions={[
          { label: 'Get Started Free', href: ROUTES.ownerLogin, variant: 'primary' },
          { label: 'Book a Demo', href: ROUTES.contact, variant: 'outline' },
        ]}
        highlights={[
          'AI-powered ticket classification and smart reminders',
          'WhatsApp & Telegram integrated messaging',
          'Automated rent tracking with payment approvals',
          'Owner and tenant dashboards with real-time data',
        ]}
        sidePanel={
          <LivePortfolioCard
            mode={snapshotMode}
            snapshot={snapshot}
            ownerSummary={ownerSummary}
            loading={snapshotLoading}
          />
        }
      />

      <FeatureHighlightsSection />
      <HowItWorksSection />
      <FaqSection />

      <CTASection
        eyebrow="Ready to Start"
        title={
          <>
            Ready to simplify your{' '}
            <span className="text-[#1A1A1A]">property management?</span>
          </>
        }
        description="Join property owners who've already switched to AI-powered management. Set up in minutes, not days."
        primaryAction={{ label: 'Start Free Trial', href: ROUTES.ownerLogin }}
        secondaryAction={{ label: 'View Pricing', href: ROUTES.pricing }}
      />
    </>
  )
}

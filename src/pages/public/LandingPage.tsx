import { motion } from 'framer-motion'
import { BellRing, Building2, CreditCard, MessageCircle, Sparkles, Users, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import { FaqSection } from '../../sections/landing/FaqSection'
import { FeatureHighlightsSection } from '../../sections/landing/FeatureHighlightsSection'
import { HowItWorksSection } from '../../sections/landing/HowItWorksSection'
import { fadeIn, revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import type { OwnerSummary, PublicOperationsSnapshot } from '../../types/api'

type SnapshotMode = 'public' | 'owner'

function FloatingStatsCard({
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
    value === null ? (loading ? '...' : '--') : value.toLocaleString('en-AE')

  const properties = renderCount(
    mode === 'owner' ? ownerSummary?.open_tickets ?? null : snapshot?.open_tickets ?? null,
  )
  const tenants = renderCount(
    mode === 'owner' ? ownerSummary?.active_tenants ?? null : snapshot?.active_tenants ?? null,
  )
  const actionCount = renderCount(
    mode === 'owner' ? ownerSummary?.reminders_pending ?? null : snapshot?.due_this_week ?? null,
  )

  const revealVariants = useMotionVariants(revealUp)

  return (
    <motion.section
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#FED609]/10 bg-white p-8 shadow-xl md:p-12">
        <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="text-sm font-bold uppercase tracking-widest text-[#FED609]">
              Live Portfolio
            </span>
            <h3 className="ph-title mt-1 text-3xl font-bold">Real-time Metrics</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            <div className="text-center">
              <div className="ph-title mb-1 text-4xl font-extrabold text-[#1A1A1A]">{properties}</div>
              <div className="text-sm text-[#6B7280]">
                <Building2 className="mr-1 inline-block h-3.5 w-3.5 text-[#FED609]" />
                Properties
              </div>
            </div>
            <div className="text-center">
              <div className="ph-title mb-1 text-4xl font-extrabold text-[#FED609]">{tenants}</div>
              <div className="text-sm text-[#6B7280]">
                <Users className="mr-1 inline-block h-3.5 w-3.5 text-[#FED609]" />
                Active Tenants
              </div>
            </div>
            <div className="text-center">
              <div className="ph-title mb-1 text-4xl font-extrabold text-[#1A1A1A]">{actionCount}</div>
              <div className="text-sm text-[#6B7280]">
                <BellRing className="mr-1 inline-block h-3.5 w-3.5 text-[#FED609]" />
                {mode === 'owner' ? 'Pending' : 'Due This Week'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
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

  const revealVariants = useMotionVariants(revealUp)
  const fadeVariants = useMotionVariants(fadeIn)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      {/* Hero Section - Stitch Design */}
      <section className="relative min-h-[870px] overflow-hidden bg-gradient-to-br from-[#FFFAE2] to-[#FEFAEF]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:px-10">
          {/* Left - Text Content */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="show"
            className="z-10 text-center lg:text-left"
          >
            <motion.h1
              variants={revealVariants}
              className="ph-title text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1A1A1A] md:text-7xl"
            >
              Manage Your Properties{' '}
              <span className="text-[#FED609] underline decoration-[#FED609]/20">Smarter</span> with AI
            </motion.h1>
            <motion.p
              variants={revealVariants}
              className="mx-auto mt-6 max-w-xl text-lg text-[#6B7280] md:text-xl lg:mx-0"
            >
              The premium AI-powered property management platform designed for the modern Dubai real
              estate market. Automate everything from tenant communication to rent collection.
            </motion.p>
            <motion.div
              variants={fadeVariants}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link
                to={ROUTES.ownerLogin}
                className="w-full rounded-xl bg-[#FED609] px-8 py-4 text-center text-lg font-bold text-[#1A1A1A] shadow-lg transition-all hover:bg-[#FFD70B] hover:shadow-xl active:scale-95 sm:w-auto"
              >
                Get Started for Free
              </Link>
              <Link
                to={ROUTES.contact}
                className="w-full rounded-xl border-2 border-[#FED609] px-8 py-4 text-center text-lg font-bold text-[#1A1A1A] transition-all hover:bg-[#FED609]/5 active:scale-95 sm:w-auto"
              >
                Book a Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Right - Hero Image with Decorative Elements */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            animate="show"
            className="relative hidden h-[600px] lg:block"
          >
            {/* Abstract Geometric Shapes */}
            <div className="absolute inset-0">
              <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-[#FED609]/20 blur-3xl" />
              <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[#FFFAE2] blur-2xl" />
              <div className="grid grid-cols-6 gap-4 opacity-10">
                <div className="h-16 w-16 rounded-xl bg-[#1A1A1A]" />
                <div className="mt-8 h-16 w-16 rounded-xl bg-[#FED609]" />
                <div className="h-16 w-16 rounded-xl bg-[#1A1A1A]" />
                <div className="mt-12 h-16 w-16 rounded-xl bg-[#FED609]" />
                <div className="h-16 w-16 rounded-xl bg-[#1A1A1A]" />
                <div className="mt-4 h-16 w-16 rounded-xl bg-[#FED609]" />
              </div>
            </div>
            {/* Main Image */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border-8 border-white bg-white shadow-2xl">
              <img
                className="h-full w-full object-cover"
                alt="Modern luxury high-rise apartment building in Dubai with glass facade and sunset reflection in warm golden lighting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwGYvpeM85pwKFXm97S1TAATDSM4__Trygy2ql_yytBQ3PtwsoBr96--gxmJ1tNMfkJalxYzSIoxOG5TitKAI8TkAmCuh-HgVJ38g6tv4XlGNyPXwcGHVh7RvK5Ks-VxmOaevdxY3ls6cvgFdCLs-OYhCJoy5zWvuNQy-FHxiWD6PdkJIyIzAwaSdi3fyEPPzolc5u8TXThfIcwgElPPs8urnbO34Aq7_k4t9aCRyv_klF-0EOqdCSCXpXavAV4-aCl0F__5tH7H6N"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Stats Card with Live Data */}
      <FloatingStatsCard
        mode={snapshotMode}
        snapshot={snapshot}
        ownerSummary={ownerSummary}
        loading={snapshotLoading}
      />

      {/* Features Section */}
      <FeatureHighlightsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Banner - Stitch Design */}
      <section className="px-4 py-20 sm:px-6 lg:px-10">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#FED609] p-12 text-center md:p-20"
        >
          <div className="relative z-10">
            <h2 className="ph-title text-3xl font-black text-[#1A1A1A] md:text-5xl">
              Ready to simplify property management?
            </h2>
            <p className="mx-auto mb-10 mt-6 max-w-2xl text-lg text-[#1A1A1A]/80 md:text-xl">
              Join hundreds of property owners who have saved over 40 hours a week using our AI
              platform.
            </p>
            <Link
              to={ROUTES.ownerLogin}
              className="inline-block rounded-xl bg-white px-10 py-5 text-lg font-bold text-[#1A1A1A] shadow-xl transition-all hover:shadow-2xl active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
          {/* Decorative blur elements */}
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </motion.div>
      </section>
    </>
  )
}

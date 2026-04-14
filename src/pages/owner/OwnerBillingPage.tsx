import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle,
  Zap,
  MessageCircle,
  Send,
  Wallet,
  Crown,
  Loader2,
  Clock,
  ShieldCheck,
  Lock,
  Sparkles,
  Building2,
  Users,
  Bell,
  TicketCheck,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { BillingState } from '../../types/api'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { email: string }
  theme: { color: string }
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal: { ondismiss: () => void }
}

interface RazorpayInstance {
  open: () => void
}

type PlanFeature = { label: string; pro?: boolean }

const STARTER_FEATURES: PlanFeature[] = [
  { label: 'Up to 5 properties' },
  { label: 'Up to 10 tenants' },
  { label: 'Email notifications' },
  { label: 'Ticket system' },
  { label: 'Payment tracking' },
  { label: 'Smart reminders' },
]

const PRO_FEATURES: PlanFeature[] = [
  { label: 'Up to 25 properties' },
  { label: 'Up to 50 tenants' },
  { label: 'AI automation suite', pro: true },
  { label: 'WhatsApp integration', pro: true },
  { label: 'Telegram bot access', pro: true },
  { label: 'Payment tracking' },
  { label: 'Smart reminders' },
]

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function OwnerBillingPage() {
  const { token, owner } = useOwnerAuth()
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingPlan, setPayingPlan] = useState<'starter' | 'professional' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchBilling = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.getBillingState(token)
      setBilling(res.billing)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchBilling() }, [fetchBilling])

  const handleChoosePlan = async (planCode: 'starter' | 'professional') => {
    if (!token || !owner) return
    setError(null)
    setPayingPlan(planCode)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Failed to load payment gateway. Please check your internet connection.')
        setPayingPlan(null)
        return
      }
      const res = await api.initiateSubscription(token, planCode)
      const { order } = res
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Prophives',
        description: `${planCode.charAt(0).toUpperCase() + planCode.slice(1)} Plan — ${order.planLabel}`,
        order_id: order.orderId,
        prefill: { email: owner.email },
        theme: { color: '#2251E3' },
        handler: async (response) => {
          try {
            const confirmRes = await api.confirmSubscription(token, {
              plan_code: planCode,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setBilling(confirmRes.billing)
            setSuccess(true)
          } catch {
            setError('Payment received but verification failed. Please contact support.')
          } finally {
            setPayingPlan(null)
          }
        },
        modal: { ondismiss: () => setPayingPlan(null) },
      })
      rzp.open()
    } catch {
      setError('Could not initiate payment. Please try again.')
      setPayingPlan(null)
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2251E3]" />
          <p className="text-sm text-[#8D8D96] font-['Manrope']">Loading your plan details…</p>
        </div>
      </div>
    )
  }

  /* ── Active subscription success state ── */
  if (success || billing?.status === 'active') {
    const isPro = billing?.planCode === 'professional'
    const planName = isPro ? 'Professional' : 'Starter'
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className={`relative rounded-2xl border p-10 ${isPro ? 'border-[#2251E3]/40 bg-[#0c1230]' : 'border-[#272839] bg-[#101114]'}`}>
            {isPro && (
              <div className="absolute inset-0 rounded-2xl opacity-30"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,81,227,0.4) 0%, transparent 70%)' }} />
            )}
            <div className="relative">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${isPro ? 'bg-[#2251E3]/20' : 'bg-[#32C382]/15'}`}>
                {isPro
                  ? <Crown className="h-8 w-8 text-[#4E79FF]" />
                  : <CheckCircle className="h-8 w-8 text-[#32C382]" />}
              </div>
              <h1 className="text-2xl font-extrabold text-white font-['Sora'] mb-2">You're all set!</h1>
              <p className="text-[#8D8D96] mb-1 font-['Manrope']">
                Your <span className="font-semibold text-white">{planName}</span> subscription is active.
              </p>
              {billing?.currentPeriodEnd && (
                <p className="text-xs text-[#8D8D96] mb-6">
                  Renews {new Date(billing.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <a
                href="/owner/dashboard"
                className="inline-flex items-center gap-2 bg-[#2251E3] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#4E79FF] transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Choose plan ── */
  const daysLeft = billing?.daysLeftInTrial
  const isExpired = billing?.isTrialExpired

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="text-center mb-12">
        {/* Trial status pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${
          isExpired
            ? 'bg-red-950/50 border-red-800/50 text-red-300'
            : 'bg-amber-950/50 border-amber-800/50 text-amber-300'
        }`}>
          <Clock className="h-4 w-4" />
          {isExpired
            ? 'Your free trial has ended'
            : daysLeft !== null
            ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`
            : 'Free trial active'}
        </div>

        <h1 className="text-4xl font-extrabold text-white font-['Sora'] mb-3 tracking-tight">
          Choose your plan
        </h1>
        <p className="text-[#8D8D96] max-w-lg mx-auto font-['Manrope'] leading-relaxed">
          Your trial gave you Starter features. Upgrade to Professional to unlock WhatsApp, AI automation, and larger portfolio limits.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-red-950/60 border border-red-800/50 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-red-400" />
          {error}
        </motion.div>
      )}

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl border border-[#272839] bg-[#101114] p-8 flex flex-col hover:border-[#2251E3]/40 transition-all duration-300"
        >
          {/* Icon + name */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#141519] border border-[#272839]">
              <Wallet className="h-5 w-5 text-[#8D8D96]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Starter</p>
              <p className="text-xs text-[#8D8D96]/60 font-['Manrope']">For individual landlords</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-1">
            <span className="text-4xl font-extrabold text-white font-['Sora']">₹2,499</span>
            <span className="text-[#8D8D96] text-sm ml-1.5">/month</span>
          </div>
          <p className="text-xs text-[#8D8D96]/60 mb-6 font-['Manrope']">≈ $29/mo for international cards</p>

          {/* Divider */}
          <div className="h-px bg-[#272839] mb-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-grow">
            {STARTER_FEATURES.map(f => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-[#C8C8D0] font-['Manrope']">
                <CheckCircle className="h-4 w-4 text-[#32C382] shrink-0" />
                {f.label}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleChoosePlan('starter')}
            disabled={!!payingPlan}
            className="w-full py-3.5 rounded-xl font-bold text-sm border-2 border-[#2251E3]/60 text-[#4E79FF] hover:bg-[#2251E3]/10 hover:border-[#2251E3] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans']"
          >
            {payingPlan === 'starter' ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Opening payment…</>
            ) : (
              <><CreditCard className="h-4 w-4" />Subscribe to Starter</>
            )}
          </button>
        </motion.div>

        {/* Professional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl border-2 border-[#2251E3] bg-[#0c1230] p-8 flex flex-col overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(34,81,227,0.25) 0%, transparent 65%)' }} />

          {/* Most Popular badge */}
          <div className="absolute top-0 right-6 bg-[#2251E3] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-b-lg font-['DM_Sans']">
            Most Popular
          </div>

          {/* Icon + name */}
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="p-2.5 rounded-xl bg-[#2251E3]/20 border border-[#2251E3]/30">
              <Crown className="h-5 w-5 text-[#4E79FF]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4E79FF] font-['DM_Sans']">Professional</p>
              <p className="text-xs text-[#8D8D96]/70 font-['Manrope']">Full suite for serious managers</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-1 relative">
            <span className="text-4xl font-extrabold text-[#4E79FF] font-['Sora']">₹8,299</span>
            <span className="text-[#8D8D96] text-sm ml-1.5">/month</span>
          </div>
          <p className="text-xs text-[#8D8D96]/60 mb-6 font-['Manrope']">≈ $99/mo for international cards</p>

          {/* Divider */}
          <div className="h-px bg-[#2251E3]/20 mb-6 relative" />

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-grow relative">
            {PRO_FEATURES.map(f => (
              <li key={f.label} className="flex items-center gap-3 text-sm font-['Manrope']">
                <CheckCircle className={`h-4 w-4 shrink-0 ${f.pro ? 'text-[#4E79FF]' : 'text-[#32C382]'}`} />
                <span className={f.pro ? 'text-white font-medium' : 'text-[#C8C8D0]'}>{f.label}</span>
                {f.pro && (
                  <span className="ml-auto text-[10px] font-bold text-[#4E79FF] bg-[#2251E3]/15 px-1.5 py-0.5 rounded font-['DM_Sans']">PRO</span>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleChoosePlan('professional')}
            disabled={!!payingPlan}
            className="relative w-full py-3.5 rounded-xl font-bold text-sm bg-[#2251E3] text-white hover:bg-[#4E79FF] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2251E3]/30 font-['DM_Sans']"
          >
            {payingPlan === 'professional' ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Opening payment…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Subscribe to Professional</>
            )}
          </button>
        </motion.div>
      </div>

      {/* ── What's included summary ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-[#272839] bg-[#101114] p-6 mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#8D8D96] mb-4 font-['DM_Sans']">All plans include</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: 'Property management' },
            { icon: Users, label: 'Tenant portal' },
            { icon: Bell, label: 'Email notifications' },
            { icon: TicketCheck, label: 'Support tickets' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-[#8D8D96] font-['Manrope']">
              <Icon className="h-4 w-4 text-[#4E79FF] shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Trust footer ── */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-[#8D8D96] font-['Manrope']">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp on Pro
          </span>
          <span className="flex items-center gap-1.5 text-sm text-[#8D8D96] font-['Manrope']">
            <Send className="h-4 w-4 text-[#0088cc]" />
            Telegram on Pro
          </span>
          <span className="flex items-center gap-1.5 text-sm text-[#8D8D96] font-['Manrope']">
            <Zap className="h-4 w-4 text-[#4E79FF]" />
            AI on Pro
          </span>
          <span className="flex items-center gap-1.5 text-sm text-[#8D8D96] font-['Manrope']">
            <Lock className="h-4 w-4 text-[#32C382]" />
            Cancel anytime
          </span>
        </div>
        <p className="text-xs text-[#8D8D96]/50 font-['Manrope']">
          Payments powered by Razorpay · Secure &amp; encrypted · No hidden fees
        </p>
      </div>
    </div>
  )
}

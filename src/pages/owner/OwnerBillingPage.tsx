import { useState, useEffect, useCallback } from 'react'
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  Loader2,
  Lock,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { BillingState } from '../../types/api'
import { ROUTES } from '../../routes/constants'

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

type PaidPlanCode = 'starter' | 'standard' | 'plus' | 'beyond'

interface PlanDef {
  code: PaidPlanCode
  name: string
  range: string
  price: number   // USD/mo
  color: string
  accentBg: string
  popular: boolean
  icon: typeof Crown
  features: string[]
  missing: string[]
}

const PLANS: PlanDef[] = [
  {
    code: 'starter',
    name: 'Starter',
    range: '1–3 Properties',
    price: 6,
    color: '#4E79FF',
    accentBg: 'rgba(78,121,255,0.08)',
    popular: false,
    icon: Wallet,
    features: [
      'Up to 3 properties',
      'Up to 15 tenants',
      'Tenant portal & dashboard',
      'Rent payment tracking',
      'Support ticket system',
      'Email notifications',
      'Document storage',
      'Broker management',
    ],
    missing: ['WhatsApp & Telegram', 'AI features', 'Analytics'],
  },
  {
    code: 'standard',
    name: 'Standard',
    range: '4–10 Properties',
    price: 12,
    color: '#2251E3',
    accentBg: 'rgba(34,81,227,0.12)',
    popular: true,
    icon: Users,
    features: [
      'Up to 10 properties',
      'Unlimited tenants',
      'Everything in Starter',
      'WhatsApp rent reminders',
      'Telegram bot alerts',
      'Analytics dashboard',
      'AI ticket classification',
      'Broadcast messaging',
    ],
    missing: ['AI reply draft & digest', 'Priority support'],
  },
  {
    code: 'plus',
    name: 'Plus',
    range: '11–20 Properties',
    price: 20,
    color: '#EBCF42',
    accentBg: 'rgba(235,207,66,0.08)',
    popular: false,
    icon: Sparkles,
    features: [
      'Up to 20 properties',
      'Unlimited tenants',
      'Everything in Standard',
      'AI ticket summarization',
      'AI reply draft',
      'WhatsApp message composer',
      'Lease renewal risk digest',
      'Priority email support',
    ],
    missing: ['Dedicated onboarding', 'Custom integrations'],
  },
  {
    code: 'beyond',
    name: 'Beyond',
    range: '21+ Properties',
    price: 30,
    color: '#32C382',
    accentBg: 'rgba(50,195,130,0.08)',
    popular: false,
    icon: Crown,
    features: [
      'Unlimited properties',
      'Unlimited tenants',
      'Everything in Plus',
      'Dedicated onboarding manager',
      'Custom integrations',
      'Volume discounts',
      'Priority phone + email support',
      'SLA guarantee',
    ],
    missing: [],
  },
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
  const navigate = useNavigate()
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingPlan, setPayingPlan] = useState<PaidPlanCode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [beyondCount, setBeyondCount] = useState(21)

  const fetchBilling = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.getBillingState(token)
      setBilling(res.billing)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void fetchBilling() }, [fetchBilling])

  const handleChoosePlan = async (planCode: PaidPlanCode) => {
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
      const res = await api.initiateSubscription(token, planCode, planCode === 'beyond' ? beyondCount : undefined)
      const { order } = res
      const planDef = PLANS.find((p) => p.code === planCode)!
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Prophives',
        description: `${planDef.name} Plan — ${order.planLabel}`,
        order_id: order.orderId,
        prefill: { email: owner.email },
        theme: { color: planDef.color },
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

  /* ── Active subscription ── */
  if (success || billing?.status === 'active') {
    const planDef = PLANS.find((p) => p.code === billing?.planCode) ?? PLANS[0]
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative rounded-2xl border p-10" style={{ borderColor: `${planDef.color}40`, backgroundColor: '#101114' }}>
            <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${planDef.color}60 0%, transparent 70%)` }} />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                style={{ backgroundColor: `${planDef.color}20` }}>
                <CheckCircle className="h-8 w-8" style={{ color: planDef.color }} />
              </div>
              <h1 className="text-2xl font-extrabold text-white font-['Sora'] mb-2">You're all set!</h1>
              <p className="text-[#8D8D96] mb-1 font-['Manrope']">
                Your <span className="font-semibold text-white">{billing?.planDisplayName ?? planDef.name}</span> subscription is active.
              </p>
              {billing?.currentPeriodEnd && (
                <p className="text-xs text-[#8D8D96] mb-6">
                  Renews {new Date(billing.currentPeriodEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate(ROUTES.ownerDashboard)}
                className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all text-white"
                style={{ backgroundColor: planDef.color }}
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Choose Plan ── */
  const daysLeft = billing?.daysLeftInTrial
  const isExpired = billing?.isTrialExpired

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-12">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${
          isExpired
            ? 'bg-red-950/50 border-red-800/50 text-red-300'
            : 'bg-amber-950/50 border-amber-800/50 text-amber-300'
        }`}>
          <Clock className="h-4 w-4" />
          {isExpired
            ? 'Your free trial has ended — choose a plan to continue'
            : daysLeft !== null
            ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`
            : 'Free trial active'}
        </div>
        <h1 className="text-4xl font-extrabold text-white font-['Sora'] mb-3 tracking-tight">Choose your plan</h1>
        <p className="text-[#8D8D96] max-w-xl mx-auto font-['Manrope'] leading-relaxed">
          Property-count pricing — pay only for what you manage. All prices in USD.
        </p>
      </div>

      {/* Error */}
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

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon
          const isPaying = payingPlan === plan.code
          const isCurrentPlan = billing?.planCode === plan.code && billing?.status === 'active'

          return (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative rounded-2xl border flex flex-col transition-all"
              style={{
                backgroundColor: plan.popular ? '#0c1230' : '#101114',
                borderColor: plan.popular ? plan.color : isCurrentPlan ? `${plan.color}60` : '#272839',
                boxShadow: plan.popular ? `0 0 30px ${plan.color}20` : undefined,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap font-['DM_Sans']"
                  style={{ backgroundColor: plan.color }}>
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32C382] text-[#06070B] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap font-['DM_Sans']">
                  Current Plan
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: plan.accentBg }}>
                    <Icon className="h-4 w-4" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-['Sora']">{plan.name}</p>
                    <p className="text-[11px] text-[#8D8D96] font-['DM_Sans']">{plan.range}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5 pb-5 border-b border-[#272839]">
                  {plan.code === 'beyond' ? (
                    <>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-extrabold font-['Sora']" style={{ color: '#32C382' }}>
                          ${(beyondCount * 1.5).toFixed(2)}
                        </span>
                        <span className="text-[#8D8D96] text-sm mb-0.5">/mo</span>
                      </div>
                      <p className="text-[11px] text-[#8D8D96] mb-2">$1.50 × {beyondCount} properties</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBeyondCount((c) => Math.max(21, c - 1))}
                          className="w-7 h-7 rounded-lg border border-[#272839] flex items-center justify-center text-[#8D8D96] hover:border-[#32C382]/50 hover:text-[#32C382] transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold text-white font-['DM_Sans'] min-w-[2rem] text-center">{beyondCount}</span>
                        <button
                          type="button"
                          onClick={() => setBeyondCount((c) => c + 1)}
                          className="w-7 h-7 rounded-lg border border-[#272839] flex items-center justify-center text-[#8D8D96] hover:border-[#32C382]/50 hover:text-[#32C382] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="text-[10px] text-[#8D8D96]">properties</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-extrabold font-['Sora']" style={{ color: plan.popular ? plan.color : '#FFFFFF' }}>
                          ${plan.price}
                        </span>
                        <span className="text-[#8D8D96] text-sm mb-0.5">/mo</span>
                      </div>
                      <p className="text-[11px] text-[#8D8D96] mt-0.5">USD · billed monthly</p>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[#C8C8D0] font-['Manrope']">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                  {plan.missing.length > 0 && (
                    <>
                      <li className="pt-1"><hr className="border-[#272839]" /></li>
                      {plan.missing.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#3A3A45] font-['Manrope']">
                          <Minus className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#2A2A35]" />
                          {f}
                        </li>
                      ))}
                    </>
                  )}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="mt-4 w-full py-3 rounded-xl text-sm text-center font-bold font-['DM_Sans'] text-[#32C382] bg-[#32C382]/10 border border-[#32C382]/30">
                    Active Plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleChoosePlan(plan.code as PaidPlanCode)}
                    disabled={!!payingPlan}
                    className="mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all font-['DM_Sans'] flex items-center justify-center gap-2 disabled:opacity-50"
                    style={
                      plan.popular
                        ? { backgroundColor: plan.color, color: '#FFFFFF' }
                        : { border: `1px solid ${plan.color}50`, color: plan.color, backgroundColor: plan.accentBg }
                    }
                  >
                    {isPaying
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Opening payment…</>
                      : plan.code === 'beyond'
                      ? <><CreditCard className="h-4 w-4" />Subscribe — ${(beyondCount * 1.5).toFixed(2)}/mo</>
                      : <><CreditCard className="h-4 w-4" />Subscribe — ${plan.price}/mo</>
                    }
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* All plans include */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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

      {/* Trust footer */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: MessageCircle, color: '#25D366', label: 'WhatsApp on Standard+' },
            { icon: Send, color: '#0088CC', label: 'Telegram on Standard+' },
            { icon: Zap, color: '#EBCF42', label: 'AI on Standard+' },
            { icon: Phone, color: '#4E79FF', label: 'Full AI suite on Plus+' },
            { icon: Lock, color: '#32C382', label: 'Cancel anytime' },
          ].map(({ icon: Icon, color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-sm text-[#8D8D96] font-['Manrope']">
              <Icon className="h-4 w-4 shrink-0" style={{ color }} />
              {label}
            </span>
          ))}
        </div>
        <p className="text-xs text-[#8D8D96]/50 font-['Manrope']">
          Payments powered by Razorpay · Secure &amp; encrypted · No hidden fees
        </p>
      </div>
    </div>
  )
}

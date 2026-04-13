import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Zap, MessageCircle, Send, Wallet, Crown, Loader2, AlertCircle } from 'lucide-react'
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

const PLANS = [
  {
    code: 'starter' as const,
    name: 'Starter',
    priceINR: '₹2,499',
    priceUSD: '$29',
    period: '/month',
    description: 'Perfect for individual landlords.',
    features: [
      'Up to 5 properties',
      'Up to 10 tenants',
      'Email notifications',
      'Basic ticket system',
      'Payment tracking',
      'Smart reminders',
    ],
    icon: Wallet,
    highlighted: false,
  },
  {
    code: 'professional' as const,
    name: 'Professional',
    priceINR: '₹8,299',
    priceUSD: '$99',
    period: '/month',
    description: 'The full suite for serious property managers.',
    features: [
      'Up to 25 properties',
      'Up to 50 tenants',
      'AI automation suite',
      'WhatsApp integration',
      'Telegram bot access',
      'Payment tracking',
      'Smart reminders',
    ],
    icon: Crown,
    highlighted: true,
  },
]

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
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
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchBilling()
  }, [fetchBilling])

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
            setError('Payment was received but verification failed. Please contact support.')
          } finally {
            setPayingPlan(null)
          }
        },
        modal: {
          ondismiss: () => setPayingPlan(null),
        },
      })

      rzp.open()
    } catch {
      setError('Could not initiate payment. Please try again.')
      setPayingPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2251E3]" />
      </div>
    )
  }

  if (success || billing?.status === 'active') {
    const planName = PLANS.find(p => p.code === billing?.planCode)?.name ?? billing?.planCode ?? 'Plan'
    return (
      <div className="max-w-lg mx-auto mt-16 text-center px-4">
        <div className="bg-white rounded-2xl border border-green-200 p-10 shadow-sm">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 font-['Sora'] mb-2">You're all set!</h1>
          <p className="text-gray-500 mb-6">
            Your <span className="font-semibold text-gray-800">{planName}</span> subscription is active.
          </p>
          <a
            href="/owner/dashboard"
            className="inline-block bg-[#2251E3] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#4E79FF] transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <AlertCircle className="h-4 w-4" />
          {billing?.isTrialExpired
            ? 'Your free trial has ended'
            : `${billing?.daysLeftInTrial ?? 0} day${billing?.daysLeftInTrial === 1 ? '' : 's'} left in your free trial`}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-['Sora'] mb-2">
          Choose your plan to continue
        </h1>
        <p className="text-gray-500">
          All plans include everything you used during the trial. Cancel anytime.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isPaying = payingPlan === plan.code
          return (
            <div
              key={plan.code}
              className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all ${
                plan.highlighted
                  ? 'border-[#2251E3] shadow-lg shadow-blue-100'
                  : 'border-gray-200 hover:border-[#2251E3]/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2251E3] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${plan.highlighted ? 'bg-[#2251E3]/10' : 'bg-gray-100'}`}>
                  <Icon className={`h-5 w-5 ${plan.highlighted ? 'text-[#2251E3]' : 'text-gray-600'}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-['Sora']">{plan.name}</h2>
              </div>

              <div className="mb-2">
                <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-[#2251E3]' : 'text-gray-900'}`}>
                  {plan.priceINR}
                </span>
                <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">≈ {plan.priceUSD}/mo for international cards</p>
              <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleChoosePlan(plan.code)}
                disabled={!!payingPlan}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-[#2251E3] text-white hover:bg-[#4E79FF] shadow-md shadow-blue-200'
                    : 'border-2 border-[#2251E3] text-[#2251E3] hover:bg-blue-50'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening payment...
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust footer */}
      <div className="text-center text-sm text-gray-400 space-y-1">
        <div className="flex items-center justify-center gap-6">
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp included</span>
          <span className="flex items-center gap-1"><Send className="h-4 w-4 text-[#0088cc]" /> Telegram included</span>
          <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-[#2251E3]" /> AI included</span>
        </div>
        <p>Payments powered by Razorpay. Secure &amp; encrypted.</p>
      </div>
    </div>
  )
}

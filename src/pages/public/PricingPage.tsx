import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Home,
  MessageCircle,
  Minus,
  Plus,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { usePageSeo } from "../../hooks/usePageSeo";
import { useOwnerAuth } from "../../hooks/useOwnerAuth";
import { ROUTES } from "../../routes/constants";
import {
  revealUp,
  staggerParent,
  useMotionVariants,
  viewportOnce,
} from "../../utils/motion";

type BillingCycle = "monthly" | "annual";

const ANNUAL_DISCOUNT = 0.20;

const plans = [
  {
    id: "starter",
    name: "Starter",
    range: "1–3 Properties",
    monthlyPrice: 6,
    trialDays: 14,
    description: "Everything a new landlord needs to run their first properties professionally.",
    popular: false,
    cta: "Start Free Trial",
    color: "#4E79FF",
    features: [
      "Up to 3 properties",
      "Up to 15 tenants",
      "Tenant portal & dashboard",
      "Rent payment tracking",
      "Support ticket system",
      "Email notifications",
      "Document storage (5 docs/tenant)",
      "Broker management",
      "Rent ledger & payment history",
    ],
    notIncluded: [
      "WhatsApp & Telegram",
      "AI features",
      "Analytics dashboard",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    range: "4–10 Properties",
    monthlyPrice: 12,
    trialDays: null,
    description: "The go-to plan for growing landlords — automation and messaging included.",
    popular: true,
    cta: "Get Started",
    color: "#2251E3",
    features: [
      "Up to 10 properties",
      "Unlimited tenants",
      "Everything in Starter",
      "WhatsApp rent reminders",
      "Telegram bot alerts",
      "Analytics dashboard",
      "AI ticket classification",
      "Broadcast messaging",
    ],
    notIncluded: [
      "AI reply drafting",
      "Lease risk digest",
      "Priority support",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    range: "11–20 Properties",
    monthlyPrice: 20,
    trialDays: null,
    description: "Full AI automation for serious landlords managing a growing portfolio.",
    popular: false,
    cta: "Get Started",
    color: "#EBCF42",
    features: [
      "Up to 20 properties",
      "Unlimited tenants",
      "Everything in Standard",
      "AI ticket summarization",
      "AI reply draft (one-click)",
      "WhatsApp message composer",
      "Lease renewal risk digest",
      "Advanced analytics",
      "Priority email support",
    ],
    notIncluded: [
      "Dedicated onboarding",
      "Custom integrations",
    ],
  },
  {
    id: "beyond",
    name: "Beyond",
    range: "21+ Properties",
    basePrice: 25,          // $25 for 21 properties
    extraPerProperty: 1.50, // +$1.50 per property above 21
    trialDays: null,
    description: "Enterprise-grade management for large portfolios — scales with every property you add.",
    popular: false,
    cta: "Get Started",
    color: "#32C382",
    features: [
      "Unlimited properties",
      "Unlimited tenants",
      "Everything in Plus",
      "Dedicated onboarding manager",
      "Custom integrations",
      "Volume discounts available",
      "Priority phone + email support",
      "SLA guarantee",
    ],
    notIncluded: [],
  },
] as const;

type Plan = typeof plans[number];

const comparisonFeatures = [
  { name: "Properties", starter: "1–3", standard: "4–10", plus: "11–20", beyond: "Unlimited" },
  { name: "Tenants", starter: "Up to 15", standard: "Unlimited", plus: "Unlimited", beyond: "Unlimited" },
  { name: "Free Trial", starter: "14 days", standard: "—", plus: "—", beyond: "—" },
  { name: "Tenant Portal", starter: true, standard: true, plus: true, beyond: true },
  { name: "Rent Tracking", starter: true, standard: true, plus: true, beyond: true },
  { name: "Ticket System", starter: true, standard: true, plus: true, beyond: true },
  { name: "Email Notifications", starter: true, standard: true, plus: true, beyond: true },
  { name: "Document Storage", starter: true, standard: true, plus: true, beyond: true },
  { name: "Broker Management", starter: true, standard: true, plus: true, beyond: true },
  { name: "WhatsApp Reminders", starter: false, standard: true, plus: true, beyond: true },
  { name: "Telegram Bot", starter: false, standard: true, plus: true, beyond: true },
  { name: "Analytics Dashboard", starter: false, standard: true, plus: true, beyond: true },
  { name: "Broadcast Messaging", starter: false, standard: true, plus: true, beyond: true },
  { name: "AI Ticket Classification", starter: false, standard: true, plus: true, beyond: true },
  { name: "AI Ticket Summarization", starter: false, standard: false, plus: true, beyond: true },
  { name: "AI Reply Draft", starter: false, standard: false, plus: true, beyond: true },
  { name: "WhatsApp Composer", starter: false, standard: false, plus: true, beyond: true },
  { name: "Lease Risk Digest", starter: false, standard: false, plus: true, beyond: true },
  { name: "Priority Support", starter: false, standard: false, plus: true, beyond: true },
  { name: "Dedicated Onboarding", starter: false, standard: false, plus: false, beyond: true },
  { name: "Custom Integrations", starter: false, standard: false, plus: false, beyond: true },
  { name: "SLA Guarantee", starter: false, standard: false, plus: false, beyond: true },
];

const faqs = [
  {
    question: "What is the early bird pricing?",
    answer:
      "Early bird pricing is our launch offer — rates locked below market competitors for users who sign up now. Your price is guaranteed for 12 months after signup, even after we raise prices for new users.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — the Starter plan includes a 14-day free trial with no credit card required. You get full access to all Starter features during the trial period.",
  },
  {
    question: "How does the Beyond plan pricing work?",
    answer:
      "The Beyond plan starts at $25/month for 21 properties, then adds $1.50 for every additional property. For example, 30 properties = $25 + (9 × $1.50) = $38.50/month. Annual billing gives you 20% off.",
  },
  {
    question: "How does WhatsApp integration work?",
    answer:
      "Prophives connects to WhatsApp Business API to send automated rent reminders, payment confirmations, and maintenance updates directly to your tenants. Available on Standard and above.",
  },
  {
    question: "What AI features are included in Plus?",
    answer:
      "Plus includes AI ticket summarization, one-click AI reply drafting for tenant support tickets, a WhatsApp message composer (you describe your intent, AI writes the message), and a lease renewal risk digest that flags expiring leases and overdue tenants.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, upgrade or downgrade at any time. Changes are pro-rated and reflected in your next billing cycle.",
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-semibold text-white">{value}</span>;
  }
  if (value) {
    return <CheckCircle className="mx-auto h-5 w-5 text-[#32C382]" />;
  }
  return <Minus className="mx-auto h-5 w-5 text-[#272839]" />;
}

function PlanPrice({ plan, billing, beyondCount }: { plan: Plan; billing: BillingCycle; beyondCount?: number }) {
  if ("basePrice" in plan) {
    const count = beyondCount ?? 21
    const raw = plan.basePrice + Math.max(0, count - 21) * plan.extraPerProperty
    const price = billing === "annual" ? raw * (1 - ANNUAL_DISCOUNT) : raw
    return (
      <div>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-white">${price.toFixed(2)}</span>
          <span className="text-[#8D8D96] mb-1 text-sm">/mo</span>
        </div>
        <p className="text-xs text-[#8D8D96] mt-1">
          $25 base · +$1.50 per property above 21
        </p>
      </div>
    )
  }

  const monthly = "monthlyPrice" in plan ? plan.monthlyPrice : 0;
  const price = billing === "annual" ? monthly * (1 - ANNUAL_DISCOUNT) : monthly;

  return (
    <div>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-extrabold text-white">
          ${billing === "annual" ? price.toFixed(2) : price}
        </span>
        <span className="text-[#8D8D96] mb-1 text-sm">/mo</span>
      </div>
      {billing === "annual" && (
        <p className="text-xs text-[#32C382] mt-1 font-semibold">
          ${(price * 12).toFixed(0)} billed annually
        </p>
      )}
    </div>
  );
}

export function PricingPage() {
  usePageSeo({
    title: "Pricing",
    description:
      "Prophives early bird pricing — property management plans from $6/month. AI automation, WhatsApp, Telegram built in.",
    canonicalPath: ROUTES.pricing,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "PriceSpecification",
      name: "Prophives Early Bird Pricing",
      description: "Starter, Standard, Plus, and Beyond pricing tiers for AI-powered property management.",
    },
  });

  const navigate = useNavigate();
  const { token } = useOwnerAuth();
  const revealVariants = useMotionVariants(revealUp);
  const staggerVariants = useMotionVariants(staggerParent);

  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [beyondCount, setBeyondCount] = useState(21);

  const handlePlanCta = () => {
    if (token) {
      navigate(ROUTES.ownerBilling);
    } else {
      navigate(`${ROUTES.ownerLogin}?next=${encodeURIComponent(ROUTES.ownerBilling)}`);
    }
  };

  return (
    <>
      {/* Early Bird Banner */}
      <div className="bg-gradient-to-r from-[#2251E3] to-[#4E79FF] py-3 px-6 text-center">
        <p className="text-white text-sm font-bold flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          Early Bird Offer — Lock in launch pricing before it expires. Rates guaranteed for 12 months.
          <Sparkles className="h-4 w-4 shrink-0" />
        </p>
      </div>

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-[1200px] mx-auto">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <div className="inline-flex items-center gap-2 bg-[rgba(34,81,227,0.12)] text-[#4E79FF] px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wider uppercase font-['DM_Sans']">
            <Sparkles className="h-4 w-4" />
            Early Bird Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight font-['Sora']">
            Pay Less. Get More.
          </h1>
          <p className="text-[#8D8D96] text-lg max-w-2xl mx-auto font-['Manrope'] mb-8">
            Property-count based pricing — pay only for what you manage.
            AI automation, WhatsApp, and a full tenant portal built in at every growing tier.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 bg-[#101114] border border-[#272839] rounded-full p-1.5">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all font-['DM_Sans'] ${
                billing === "monthly"
                  ? "bg-[#2251E3] text-white shadow-md"
                  : "text-[#8D8D96] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all font-['DM_Sans'] flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-[#2251E3] text-white shadow-md"
                  : "text-[#8D8D96] hover:text-white"
              }`}
            >
              Annual
              <span className="bg-[#32C382] text-[#06070B] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                −20%
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24 px-6 max-w-[1200px] mx-auto">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={revealVariants}
              className={`relative bg-[#101114] rounded-2xl border flex flex-col transition-all ${
                plan.popular
                  ? "border-[#2251E3] shadow-[0_0_40px_rgba(34,81,227,0.2)]"
                  : "border-[#272839] hover:border-[#4E79FF]/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2251E3] text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap font-['DM_Sans']">
                  Most Popular
                </div>
              )}

              {/* Early bird badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 bg-[#32C382]/15 text-[#32C382] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-[#32C382]/20">
                  <Clock className="h-2.5 w-2.5" />
                  Early Bird
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                {/* Plan header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-4 w-4" style={{ color: plan.color }} />
                    <span className="text-xs font-bold text-[#8D8D96] font-['DM_Sans']">{plan.range}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white font-['Sora'] mb-2">{plan.name}</h3>
                  <p className="text-[#8D8D96] text-sm font-['Manrope'] leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-[#272839]">
                  <PlanPrice plan={plan} billing={billing} beyondCount={beyondCount} />
                  {/* Beyond property counter */}
                  {plan.id === "beyond" && (
                    <div className="flex items-center gap-2 mt-3">
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
                      <span className="text-xs text-[#8D8D96]">properties</span>
                    </div>
                  )}
                  {"trialDays" in plan && plan.trialDays ? (
                    <p className="mt-2 text-xs font-bold" style={{ color: '#4E79FF' }}>
                      {plan.trialDays}-day free trial · No credit card required
                    </p>
                  ) : null}
                </div>

                {/* Included features */}
                <ul className="space-y-2.5 mb-4 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-white font-['Manrope']">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.length > 0 ? (
                    <>
                      <li className="pt-1">
                        <hr className="border-[#272839]" />
                      </li>
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-[#4A4A55] font-['Manrope']">
                          <Minus className="h-4 w-4 shrink-0 mt-0.5 text-[#3A3A45]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </>
                  ) : null}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handlePlanCta}
                  className={`mt-6 w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all font-['DM_Sans'] ${
                    plan.popular
                      ? "bg-[#2251E3] text-white hover:bg-[#4E79FF] shadow-lg shadow-[#2251E3]/30"
                      : plan.id === "plus"
                      ? "bg-[#EBCF42]/15 text-[#EBCF42] border border-[#EBCF42]/40 hover:bg-[#EBCF42]/25"
                      : plan.id === "beyond"
                      ? "bg-[#32C382]/15 text-[#32C382] border border-[#32C382]/40 hover:bg-[#32C382]/25"
                      : "border-2 border-[#272839] text-white hover:border-[#4E79FF]/60 hover:bg-[#4E79FF]/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Under grid note */}
        <p className="text-center text-[#8D8D96] text-sm mt-8 font-['Manrope']">
          All prices in USD · Cancel anytime · Early bird rates locked for 12 months after signup
        </p>
      </section>

      {/* Why we beat the competition */}
      <section className="py-20 bg-[#101114]">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-extrabold text-white font-['Sora'] mb-3">
              More powerful than anything in this price range.
            </h2>
            <p className="text-[#8D8D96] font-['Manrope'] max-w-xl mx-auto">
              Property-count pricing that scales with you — with AI automation, WhatsApp, Telegram, and a full tenant portal that competitors simply don&apos;t have.
            </p>
          </motion.div>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Zap className="h-5 w-5 text-[#EBCF42]" />,
                iconBg: "bg-[#EBCF42]/15",
                title: "AI Automation",
                description:
                  "Auto-classify tickets, generate smart reminders, summarize long threads, draft replies, and get lease renewal risk digests — all powered by AI. Available from Plus.",
              },
              {
                icon: <MessageCircle className="h-5 w-5 text-[#25D366]" />,
                iconBg: "bg-[#25D366]/15",
                title: "WhatsApp Integration",
                description:
                  "Send rent reminders and payment confirmations on WhatsApp. Compose tenant messages via AI — just describe your intent and send. Available on Standard and above.",
              },
              {
                icon: <Send className="h-5 w-5 text-[#0088CC]" />,
                iconBg: "bg-[#0088CC]/15",
                title: "Telegram Bot",
                description:
                  "Instant Telegram alerts for rent due dates, ticket updates, and payment approvals. Landlords and tenants stay informed without opening an app.",
              },
              {
                icon: <Users className="h-5 w-5 text-[#4E79FF]" />,
                iconBg: "bg-[#4E79FF]/15",
                title: "Full Tenant Portal",
                description:
                  "Tenants get their own dashboard to raise tickets, view lease dates, track rent status, and contact you directly. No other tool at this price offers a tenant-facing portal.",
              },
              {
                icon: <FileText className="h-5 w-5 text-[#4E79FF]" />,
                iconBg: "bg-[#4E79FF]/15",
                title: "Document Management",
                description:
                  "Upload lease agreements, ID copies, payment proofs, and notices per tenant. Accessible anytime with secure cloud storage.",
              },
              {
                icon: <Bot className="h-5 w-5 text-[#EBCF42]" />,
                iconBg: "bg-[#EBCF42]/15",
                title: "Broker Management",
                description:
                  "Maintain a broker directory, assign brokers to tenants, and track referrals. Ideal for markets where broker relationships are central to leasing.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={revealVariants}
                className="bg-[#141519] rounded-xl border border-[#272839] p-6 hover:border-[#4E79FF]/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-white font-bold font-['Sora'] mb-2">{item.title}</h3>
                <p className="text-[#8D8D96] text-sm font-['Manrope'] leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#101114]">
        <div className="max-w-[1050px] mx-auto px-6">
          <motion.h2
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-3xl font-extrabold text-center mb-12 font-['Sora'] text-white"
          >
            Detailed Plan Comparison
          </motion.h2>
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="overflow-x-auto rounded-xl border border-[#272839]"
          >
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="bg-[#141519] border-b border-[#272839]">
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">Feature</th>
                  {(["Starter", "Standard", "Plus", "Beyond"] as const).map((name) => (
                    <th
                      key={name}
                      className="p-5 font-bold text-xs uppercase tracking-wider text-center font-['DM_Sans']"
                      style={{ color: name === "Plus" ? "#EBCF42" : name === "Beyond" ? "#32C382" : "#FFFFFF" }}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-[#272839] ${index % 2 === 0 ? "bg-[#141519]" : "bg-[#101114]"}`}
                  >
                    <td className="p-5 font-medium text-white font-['Manrope']">{feature.name}</td>
                    <td className="p-5 text-center"><ComparisonCell value={feature.starter} /></td>
                    <td className="p-5 text-center"><ComparisonCell value={feature.standard} /></td>
                    <td className="p-5 text-center"><ComparisonCell value={feature.plus} /></td>
                    <td className="p-5 text-center"><ComparisonCell value={feature.beyond} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <motion.h2
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-3xl font-extrabold text-center mb-12 font-['Sora'] text-white"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              variants={revealVariants}
              className="bg-[#101114] rounded-xl border border-[#272839] p-6"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between text-left font-bold font-['Sora'] text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#8D8D96] transition-transform duration-200 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 text-[#8D8D96] text-sm leading-relaxed font-['Manrope']"
                >
                  {faq.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-24">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-[1100px] mx-auto bg-gradient-to-br from-[#2251E3] to-[#4E79FF] rounded-3xl p-12 text-center shadow-xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 font-['DM_Sans']">
            <Clock className="h-3.5 w-3.5" />
            Early Bird — Limited Time
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-['Sora']">
            Lock in your rate before it expires
          </h2>
          <p className="text-white/75 text-lg mb-8 max-w-xl font-['Manrope']">
            Sign up now and your price is guaranteed for 12 months — even after we raise rates for new subscribers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => {
                if (token) {
                  navigate(ROUTES.ownerBilling);
                } else {
                  navigate(`${ROUTES.ownerLogin}?next=${encodeURIComponent(ROUTES.ownerBilling)}`);
                }
              }}
              className="bg-white text-[#2251E3] font-bold py-4 px-10 rounded-xl hover:bg-[rgba(255,255,255,0.9)] transition-all shadow-md flex items-center gap-2 font-['DM_Sans']"
            >
              <Sparkles className="h-5 w-5" />
              Claim Early Bird Pricing
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.contact)}
              className="border-2 border-white/40 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 font-['DM_Sans']"
            >
              <Calendar className="h-5 w-5" />
              Talk to Sales
            </button>
          </div>
        </motion.div>
      </section>
    </>
  );
}

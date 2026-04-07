import { usePageSeo } from '../../hooks/usePageSeo'

interface PolicySection {
  id: string
  heading: string
  content: React.ReactNode
}

const sections: PolicySection[] = [
  {
    id: 'overview',
    heading: '1. Overview',
    content: (
      <>
        <p>
          Prophives operates on a subscription-based SaaS model. This Refund Policy explains when refunds are
          available, how to request them, and how disputes are handled for owner subscriptions and add-on services.
        </p>
        <p className="mt-4">
          By subscribing to any Prophives plan, you acknowledge and agree to this Refund Policy. This policy was last
          updated in <strong>April 2025</strong>.
        </p>
      </>
    ),
  },
  {
    id: 'subscription-plans',
    heading: '2. Subscription Plans',
    content: (
      <>
        <p>Prophives offers monthly and annual subscription tiers. The following terms apply:</p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            <strong>Monthly subscriptions</strong> — billed on a rolling basis. You may cancel at any time; your
            access continues until the end of the current billing period. No partial refunds are issued for the
            remaining days in a billing cycle.
          </li>
          <li>
            <strong>Annual subscriptions</strong> — billed upfront for 12 months. If you cancel within the first{' '}
            <strong>14 days</strong> of your initial purchase and have not processed more than 5 active tenant
            records, you are eligible for a full refund.
          </li>
          <li>
            <strong>Starter (free) plan</strong> — no charges apply. No refund action is available or required.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'eligible-refunds',
    heading: '3. Eligible Refunds',
    content: (
      <>
        <p>You may be eligible for a full or partial refund in the following situations:</p>
        <ul className="mt-4 space-y-3 list-disc list-inside">
          <li>
            <strong>14-day cooling-off (annual plans only)</strong> — first-time annual subscribers who cancel within
            14 calendar days of the initial charge and have not made substantial use of the platform (defined as
            fewer than 5 tenants onboarded and no AI summarisation credits consumed).
          </li>
          <li>
            <strong>Duplicate payment</strong> — if your payment method was charged twice for the same billing
            period due to a system error, we will refund the duplicate charge in full.
          </li>
          <li>
            <strong>Extended service outage</strong> — if Prophives experiences a verified outage exceeding 72
            consecutive hours that renders the core platform unusable, affected subscribers may request a pro-rated
            credit for the outage period.
          </li>
          <li>
            <strong>Incorrect pricing charged</strong> — if a plan change or promotional price was applied
            incorrectly due to a platform error, we will adjust the charge and refund any overpayment.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'non-refundable',
    heading: '4. Non-Refundable Items',
    content: (
      <>
        <p>The following are explicitly non-refundable:</p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Monthly subscription fees once the billing period has begun</li>
          <li>Annual subscriptions cancelled after the 14-day cooling-off period</li>
          <li>AI usage credits or message credits consumed (WhatsApp, Telegram)</li>
          <li>Setup or onboarding fees, if applicable to your plan</li>
          <li>
            Fees charged during a period where your account was suspended due to a violation of our Terms of
            Service
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-to-request',
    heading: '5. How to Request a Refund',
    content: (
      <>
        <p>To submit a refund request:</p>
        <ol className="mt-4 space-y-3 list-decimal list-inside">
          <li>
            Email <strong>support@prophives.com</strong> with the subject line{' '}
            <em>"Refund Request — [your registered email]"</em>.
          </li>
          <li>
            Include your account email, subscription plan, payment date, and the reason for your refund request.
          </li>
          <li>
            For duplicate-charge or billing-error claims, attach a screenshot of the payment receipt or bank
            statement showing the charge(s).
          </li>
        </ol>
        <p className="mt-4">
          We aim to acknowledge all refund requests within <strong>2 business days</strong> and resolve eligible
          claims within <strong>7 business days</strong>. Approved refunds are processed to the original payment
          method and may take 5–10 additional business days to appear depending on your bank or card provider.
        </p>
      </>
    ),
  },
  {
    id: 'disputes',
    heading: '6. Payment Disputes & Chargebacks',
    content: (
      <>
        <p>
          We ask that you contact us directly before initiating a chargeback with your bank or payment provider.
          Most billing issues can be resolved quickly and without the delays associated with chargeback proceedings.
        </p>
        <p className="mt-4">
          Initiating a chargeback without first contacting us may result in temporary suspension of your account
          while the dispute is under review. If a chargeback is later found to be unwarranted, Prophives reserves
          the right to recover the disputed amount plus any fees levied by the payment processor.
        </p>
      </>
    ),
  },
  {
    id: 'jurisdiction',
    heading: '7. Jurisdiction & Governing Law',
    content: (
      <>
        <p>
          Prophives operates across multiple jurisdictions including the United Arab Emirates and India. The
          following consumer protection frameworks are acknowledged:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            <strong>UAE</strong> — Consumer Protection Law (Federal Law No. 15 of 2020) and applicable DIFC
            regulations where relevant.
          </li>
          <li>
            <strong>India</strong> — Consumer Protection Act, 2019. Subscribers in India retain statutory rights
            under the Act that cannot be waived by this policy.
          </li>
        </ul>
        <p className="mt-4">
          Nothing in this Refund Policy limits or excludes any rights you have under applicable consumer protection
          legislation in your country of residence. Where local law grants broader refund rights than those described
          here, those rights prevail.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    heading: '8. Changes to This Policy',
    content: (
      <p>
        Prophives reserves the right to update this Refund Policy at any time. Material changes will be communicated
        via email or a notice within the platform at least 14 days before taking effect. Continued use of the Service
        after the effective date constitutes acceptance of the revised policy.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: '9. Contact Us',
    content: (
      <>
        <p>For all refund and billing enquiries:</p>
        <ul className="mt-4 space-y-1 list-disc list-inside">
          <li>
            <strong>Email:</strong> support@prophives.com
          </li>
          <li>
            <strong>Response time:</strong> within 2 business days
          </li>
        </ul>
      </>
    ),
  },
]

export function RefundPolicyPage() {
  usePageSeo({
    title: 'Refund Policy — Prophives',
    description:
      'Understand when refunds are available for Prophives subscriptions, how to request them, and how disputes are handled.',
  })

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0D0D12]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #2251E3 0%, transparent 50%), radial-gradient(circle at 80% 50%, #2251E3 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20">
          <span
            className="inline-block mb-4 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{
              backgroundColor: 'rgba(34,81,227,0.15)',
              color: '#4E79FF',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Legal
          </span>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Refund Policy
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#C0C0C5] max-w-2xl">
            We stand behind the value Prophives delivers. This policy explains when refunds apply, how to request
            one, and how we handle billing disputes.
          </p>
          <p className="mt-6 text-sm text-[#8D8D96]">Last updated: April 2025</p>
        </div>
      </div>

      {/* Table of contents + body */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        {/* TOC */}
        <nav
          className="mb-12 rounded-xl border border-[#272839] bg-[#101114] p-6"
          aria-label="Table of contents"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8D8D96]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Contents
          </p>
          <ol className="space-y-1.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm font-medium text-[#C0C0C5] transition-colors duration-150 hover:text-[#4E79FF]"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-14">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2
                className="mb-4 text-xl md:text-2xl font-bold text-white border-b border-[#272839] pb-3"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {section.heading}
              </h2>
              <div className="text-[#C0C0C5] leading-relaxed text-[15px]">{section.content}</div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 rounded-xl border border-[#272839] bg-[#101114] px-6 py-5 text-sm text-[#8D8D96] text-center">
          This Refund Policy is effective as of <strong className="text-white">April 2025</strong>. For questions,
          contact <strong className="text-white">support@prophives.com</strong>.
        </div>
      </div>
    </div>
  )
}

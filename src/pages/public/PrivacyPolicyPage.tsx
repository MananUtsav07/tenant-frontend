import { usePageSeo } from '../../hooks/usePageSeo'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface PolicySection {
  id: string
  heading: string
  content: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Section data                                                        */
/* ------------------------------------------------------------------ */

const sections: PolicySection[] = [
  {
    id: 'introduction',
    heading: '1. Introduction',
    content: (
      <>
        <p>
          Prophives ("we", "our", or "us") operates an AI-powered property management platform designed for property
          owners and their tenants. This Privacy Policy explains how we collect, use, disclose, and safeguard information
          when you use our web application, APIs, and related services (collectively, the "Service").
        </p>
        <p className="mt-4">
          By creating an account or using the Service, you agree to the collection and use of information in accordance
          with this policy. If you do not agree, please do not access or use the Service.
        </p>
        <p className="mt-4">
          This policy was last updated on <strong>January 2025</strong> and applies to all users of Prophives,
          including property owners, tenants, and administrators.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    heading: '2. Information We Collect',
    content: (
      <>
        <p>We collect several categories of information to operate and improve our Service:</p>

        <h3 className="mt-6 mb-2 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Account Data
        </h3>
        <p>
          When you register as a property owner or tenant, we collect your name, email address, phone number, and
          account credentials (stored as a salted hash — we never store plain-text passwords). Owners may additionally
          provide business name, trade licence number, and billing contact details.
        </p>

        <h3 className="mt-6 mb-2 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Property Data
        </h3>
        <p>
          Owners provide property information including unit addresses, building names, floor numbers, rental amounts,
          lease start and end dates, and any attachments such as floor plans or photographs uploaded to the platform.
        </p>

        <h3 className="mt-6 mb-2 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Tenant Data
        </h3>
        <p>
          Tenant profiles contain names, contact information, national ID or passport references (where provided by the
          owner), lease terms, and communication preferences including WhatsApp and Telegram contact handles where
          tenants opt in to automated messaging.
        </p>

        <h3 className="mt-6 mb-2 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Payment Data
        </h3>
        <p>
          We record payment due dates, amounts, and statuses within the platform. Full card numbers and banking
          credentials are processed exclusively by our payment partners and are never stored on Prophives
          infrastructure.
        </p>

        <h3 className="mt-6 mb-2 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Usage Analytics
        </h3>
        <p>
          We collect anonymised usage data such as page views, feature interactions, session durations, and error logs
          to understand how users navigate the platform and to guide product improvements. This data does not identify
          individual users.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    heading: '3. How We Use Your Information',
    content: (
      <>
        <p>We use the information we collect for the following purposes:</p>
        <ul className="mt-4 space-y-3 list-none">
          {[
            {
              label: 'Service Delivery',
              text: 'To create and manage accounts, display property and tenant records, process support tickets, and provide all core platform functionality.',
            },
            {
              label: 'Notifications & Reminders',
              text: 'To send automated rent due reminders, lease expiry alerts, and maintenance status updates via email, WhatsApp, or Telegram based on your notification preferences.',
            },
            {
              label: 'AI Features',
              text: 'To power ticket classification, priority scoring, and AI-generated summaries of tenant requests. Inputs sent to AI processing are anonymised before transmission — personally identifiable details such as names and unit numbers are stripped or pseudonymised.',
            },
            {
              label: 'Platform Analytics',
              text: 'To monitor performance, identify usage patterns, diagnose technical issues, and inform our product roadmap.',
            },
            {
              label: 'Security & Compliance',
              text: 'To detect fraudulent activity, prevent unauthorised access, and comply with applicable laws and regulations.',
            },
            {
              label: 'Customer Support',
              text: 'To respond to inquiries, resolve disputes, and assist with onboarding.',
            },
          ].map(({ label, text }) => (
            <li key={label} className="flex gap-3">
              <span
                className="mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#2251E3', color: '#FFFFFF' }}
              >
                ✓
              </span>
              <span>
                <strong>{label}:</strong> {text}
              </span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'data-sharing',
    heading: '4. Data Sharing',
    content: (
      <>
        <p>
          We do not sell your personal data. We share data only with the third-party processors listed below, each bound
          by data processing agreements consistent with this policy:
        </p>
        <div className="mt-6 space-y-5">
          {[
            {
              name: 'Supabase',
              role: 'Database & Authentication',
              detail:
                'Our primary database and authentication provider. All data stored within Supabase is encrypted at rest. Row-level security policies restrict access to authorised users only.',
            },
            {
              name: 'OpenAI',
              role: 'AI Features',
              detail:
                'Ticket text and maintenance request summaries are processed via OpenAI\'s API. Data is anonymised before transmission. We have opted out of data usage for model training under OpenAI\'s API terms.',
            },
            {
              name: 'WhatsApp / Meta Business API',
              role: 'Messaging',
              detail:
                'Automated rent reminders and tenant notifications may be sent via the Meta Business Messaging API when tenants have provided a WhatsApp number and consented to automated messages.',
            },
            {
              name: 'Telegram',
              role: 'Messaging',
              detail:
                'Tenants who choose to connect their Telegram account may receive notifications and interact with support requests via our Telegram bot integration.',
            },
          ].map(({ name, role, detail }) => (
            <div
              key={name}
              className="rounded-lg border border-[#272839] bg-[#141519] p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(34,81,227,0.15)', color: '#4E79FF', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {role}
                </span>
                <span className="font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {name}
                </span>
              </div>
              <p className="text-sm text-[#8D8D96]">{detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[#8D8D96]">
          We may also disclose information where required by law, regulation, court order, or to protect the rights,
          safety, and property of Prophives, our users, or the public.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    heading: '5. Data Retention',
    content: (
      <>
        <p>
          We retain your data for as long as your account is active and as necessary to provide the Service and comply
          with our legal obligations.
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside text-[#C0C0C5]">
          <li>
            <strong>Active accounts:</strong> All account, property, tenant, and ticket data is retained while your
            subscription is active.
          </li>
          <li>
            <strong>Deleted accounts:</strong> Upon account deletion, your data is marked for purging and permanently
            deleted from our systems within <strong>90 days</strong>. Anonymised, aggregated analytics derived from
            your usage may be retained indefinitely as they cannot be used to identify you.
          </li>
          <li>
            <strong>Billing records:</strong> Transaction records required for tax and accounting purposes are retained
            for up to 7 years in accordance with financial regulations.
          </li>
          <li>
            <strong>Communication logs:</strong> WhatsApp and Telegram message logs related to rent notifications are
            retained for 12 months and then automatically purged.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-rights',
    heading: '6. Your Rights',
    content: (
      <>
        <p>
          Depending on your jurisdiction, you may have the following rights with respect to your personal data:
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { right: 'Access', desc: 'Request a copy of the personal data we hold about you.' },
            { right: 'Correction', desc: 'Request correction of inaccurate or incomplete data.' },
            { right: 'Deletion', desc: 'Request erasure of your personal data, subject to legal retention requirements.' },
            { right: 'Export', desc: 'Request a portable export of your data in a machine-readable format (JSON or CSV).' },
            { right: 'Objection', desc: 'Object to processing of your data for specific purposes such as marketing.' },
            { right: 'Restriction', desc: 'Request that we limit the processing of your data in certain circumstances.' },
          ].map(({ right, desc }) => (
            <div key={right} className="rounded-lg border border-[#272839] bg-[#141519] p-4">
              <p className="font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                {right}
              </p>
              <p className="text-sm text-[#8D8D96]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
            support@prohives.com
          </a>
          . We will respond within 30 days. We may need to verify your identity before processing your request.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    heading: '7. Security',
    content: (
      <>
        <p>
          We implement industry-standard technical and organisational measures to protect your data against unauthorised
          access, alteration, disclosure, or destruction:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            <strong>Encryption in transit:</strong> All data transmitted between your browser and our servers is
            protected using TLS 1.2 or higher (HTTPS).
          </li>
          <li>
            <strong>Encryption at rest:</strong> Database storage is encrypted at rest using AES-256, managed by
            Supabase.
          </li>
          <li>
            <strong>Authentication:</strong> Sessions are managed using signed JSON Web Tokens (JWT) with short
            expiry windows and refresh token rotation.
          </li>
          <li>
            <strong>Row-level security:</strong> Database access policies enforce that each user can only access
            records belonging to their own account or organisation.
          </li>
          <li>
            <strong>Access controls:</strong> Internal access to production data is restricted to authorised
            personnel and audited regularly.
          </li>
        </ul>
        <p className="mt-4">
          Despite our efforts, no method of transmission over the internet or electronic storage is 100% secure. If
          you believe your account has been compromised, contact us immediately at{' '}
          <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
            support@prohives.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    heading: '8. Cookies',
    content: (
      <>
        <p>
          Prophives uses a minimal set of cookies required to operate the platform. We do not use advertising cookies,
          cross-site tracking cookies, or any third-party analytics cookies that profile individual users.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-[#272839]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#272839] bg-[#2251E3]">
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Cookie
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Purpose
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272839] bg-[#101114]">
              {[
                { name: 'sb-auth-token', purpose: 'Supabase authentication session token', expiry: '1 hour' },
                { name: 'sb-refresh-token', purpose: 'Supabase session refresh token', expiry: '7 days' },
                { name: 'ph-pref', purpose: 'User interface preferences (theme, language)', expiry: '1 year' },
              ].map(({ name, purpose, expiry }) => (
                <tr key={name}>
                  <td className="px-4 py-3 font-mono text-xs text-[#C0C0C5]">{name}</td>
                  <td className="px-4 py-3 text-[#8D8D96]">{purpose}</td>
                  <td className="px-4 py-3 text-[#8D8D96]">{expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-[#8D8D96]">
          You can disable cookies in your browser settings, however doing so may impair core platform functionality
          such as login session persistence.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    heading: '9. Contact',
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy, wish to exercise your data rights, or want to report a
          privacy concern, please contact our privacy team:
        </p>
        <div className="mt-4 rounded-lg border border-[#272839] bg-[#141519] p-5 space-y-2">
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
              support@prohives.com
            </a>
          </p>
          <p>
            <strong>Subject line:</strong> Privacy Request — [Your Name / Account Email]
          </p>
        </div>
        <p className="mt-4 text-sm text-[#8D8D96]">
          We are committed to resolving privacy inquiries promptly. If you are unsatisfied with our response, you
          may have the right to lodge a complaint with a relevant data protection authority in your jurisdiction.
        </p>
      </>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function PrivacyPolicyPage() {
  usePageSeo({
    title: 'Privacy Policy',
    description: 'Prophives Privacy Policy — how we collect, use, and protect your data.',
  })

  return (
    <div style={{ backgroundColor: '#06070B', minHeight: '100vh', fontFamily: 'Manrope, sans-serif', color: '#C0C0C5' }}>
      {/* Hero */}
      <div
        style={{ backgroundColor: '#101114' }}
        className="relative overflow-hidden border-b border-[#272839]"
      >
        <div
          className="absolute inset-0 opacity-10"
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#C0C0C5] max-w-2xl">
            We believe in full transparency. This policy explains exactly what data Prophives collects, how it is
            used, and how we keep it safe.
          </p>
          <p className="mt-6 text-sm text-[#8D8D96]">Last updated: January 2025</p>
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
          This Privacy Policy is effective as of <strong className="text-white">January 2025</strong>. Continued
          use of Prophives after any update constitutes acceptance of the revised policy.
        </div>
      </div>
    </div>
  )
}

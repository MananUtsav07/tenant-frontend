import { usePageSeo } from '../../hooks/usePageSeo'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface TermsSection {
  id: string
  heading: string
  content: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Section data                                                        */
/* ------------------------------------------------------------------ */

const sections: TermsSection[] = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using the Prophives platform, website, APIs, or any related services (collectively, the
          "Service"), you confirm that you have read, understood, and agree to be bound by these Terms of Service
          ("Terms"). If you are accepting these Terms on behalf of an organisation, you represent and warrant that you
          have the authority to do so.
        </p>
        <p className="mt-4">
          If you do not agree to these Terms, you must not access or use the Service. These Terms were last updated
          in <strong>January 2025</strong> and supersede all prior versions.
        </p>
      </>
    ),
  },
  {
    id: 'description',
    heading: '2. Description of Service',
    content: (
      <>
        <p>
          Prophives is an AI-powered property management Software-as-a-Service (SaaS) platform. The Service enables
          property owners and managers to:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Manage property portfolios, units, and lease agreements</li>
          <li>Onboard and communicate with tenants</li>
          <li>Receive, classify, and resolve maintenance tickets with AI assistance</li>
          <li>Send automated rent reminders and notifications via WhatsApp and Telegram</li>
          <li>Configure AI-powered automation workflows for recurring property tasks</li>
        </ul>
        <p className="mt-4">
          Tenants access a separate, role-scoped portal to submit maintenance requests, view lease information, and
          communicate with their property manager.
        </p>
        <p className="mt-4">
          Prophives reserves the right to modify, suspend, or discontinue any aspect of the Service at any time with
          reasonable notice to active subscribers.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    heading: '3. User Accounts',
    content: (
      <>
        <p>
          The Service provides two primary account types: <strong>Owner Accounts</strong> for property managers and
          landlords, and <strong>Tenant Accounts</strong> for residents. Each account type has a distinct set of
          permissions and access controls.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Owner Accounts',
              points: [
                'Created via self-registration or invitation',
                'Full control over property, tenant, and ticket data',
                'Responsible for inviting and managing tenant accounts',
                'Subscription billing is associated with the owner account',
              ],
            },
            {
              title: 'Tenant Accounts',
              points: [
                'Created by invitation from a property owner',
                'Access limited to their own lease and tickets',
                'Cannot modify property or billing settings',
                'May connect messaging integrations (WhatsApp, Telegram)',
              ],
            },
          ].map(({ title, points }) => (
            <div key={title} className="rounded-lg border border-[#272839] bg-[#141519] p-5">
              <p className="mb-3 font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {title}
              </p>
              <ul className="space-y-1.5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-[#8D8D96]">
                    <span
                      className="mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: '#2251E3', color: '#FFFFFF' }}
                    >
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4">
          You are responsible for maintaining the confidentiality of your account credentials and for all activity
          that occurs under your account. You must notify us immediately if you suspect unauthorised access at{' '}
          <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
            support@prohives.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    heading: '4. Acceptable Use',
    content: (
      <>
        <p>
          You agree to use the Service only for lawful purposes and in accordance with these Terms. The following
          actions are strictly prohibited:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Using the Service for any illegal purpose or in violation of any applicable law or regulation</li>
          <li>
            Reverse engineering, decompiling, disassembling, or attempting to derive the source code of the Service
          </li>
          <li>Sending spam, unsolicited communications, or abusive messages through platform integrations</li>
          <li>
            Uploading or transmitting malware, viruses, or any other malicious code that could harm the Service or
            other users
          </li>
          <li>
            Attempting to gain unauthorised access to any part of the Service, its servers, or connected systems
          </li>
          <li>Scraping, crawling, or harvesting data from the platform without written permission</li>
          <li>Impersonating any person or entity or misrepresenting your affiliation with any person or entity</li>
          <li>
            Using the Service in a manner that could disable, overburden, or impair the platform's infrastructure
          </li>
        </ul>
        <p className="mt-4">
          Violation of these acceptable use standards may result in immediate suspension or termination of your
          account without refund.
        </p>
      </>
    ),
  },
  {
    id: 'ai-features',
    heading: '5. AI Features',
    content: (
      <>
        <div
          className="mb-5 rounded-lg border-l-4 p-4"
          style={{ borderColor: '#2251E3', backgroundColor: 'rgba(34,81,227,0.08)' }}
        >
          <p className="font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            Important Disclaimer
          </p>
          <p className="text-sm text-[#8D8D96]">
            AI-generated outputs — including ticket classifications, summaries, suggested responses, and automated
            messages — are provided for informational and operational convenience only. They do not constitute
            legal advice, financial advice, or professional recommendations of any kind.
          </p>
        </div>
        <p>
          Prophives uses large language model APIs (currently OpenAI) to power features such as ticket
          classification, request summarisation, and automated notification drafting. These features are designed to
          assist property managers, not to replace professional judgment.
        </p>
        <p className="mt-4">
          AI outputs may occasionally be inaccurate, incomplete, or contextually inappropriate. You are solely
          responsible for reviewing AI-generated content before acting on it, sharing it with tenants, or using it
          to make decisions affecting your property or tenants.
        </p>
        <p className="mt-4">
          Prophives makes no warranty, express or implied, as to the accuracy, reliability, or fitness for any
          particular purpose of any AI-generated content.
        </p>
      </>
    ),
  },
  {
    id: 'payment',
    heading: '6. Payment & Subscription',
    content: (
      <>
        <p>
          Access to the full Prophives feature set requires an active paid subscription. By subscribing, you agree
          to the following billing terms:
        </p>
        <ul className="mt-4 space-y-3 list-disc list-inside">
          <li>
            <strong>Billing cycle:</strong> Subscriptions are billed monthly or annually in advance, depending on
            your selected plan. The billing period begins on the date your subscription activates.
          </li>
          <li>
            <strong>Automatic renewal:</strong> Subscriptions automatically renew at the end of each billing period
            unless cancelled before the renewal date.
          </li>
          <li>
            <strong>Cancellation:</strong> You may cancel your subscription at any time from your account settings.
            Cancellation takes effect at the end of the current billing period; no partial refunds are issued for
            unused time within a billing period.
          </li>
          <li>
            <strong>Price changes:</strong> We reserve the right to change subscription pricing with at least 30
            days' notice to active subscribers. Continued use after a price change constitutes acceptance of the new
            pricing.
          </li>
          <li>
            <strong>Taxes:</strong> All prices are exclusive of applicable taxes unless stated otherwise. You are
            responsible for any taxes applicable in your jurisdiction.
          </li>
          <li>
            <strong>Failed payments:</strong> If a payment fails, we will attempt to retry the charge. Continued
            failure may result in suspension of your account until the outstanding balance is settled.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-ownership',
    heading: '7. Data Ownership',
    content: (
      <>
        <p>
          You retain full ownership of all data you input into the Service, including property records, tenant
          profiles, lease documents, maintenance tickets, and any other content you create or upload ("Your Data").
        </p>
        <p className="mt-4">
          Prophives claims no ownership, intellectual property rights, or licence over Your Data beyond what is
          strictly necessary to provide the Service. Specifically:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>We do not sell Your Data to any third party</li>
          <li>We do not use Your Data to train our own AI models</li>
          <li>We do not use Your Data for any advertising or marketing purposes</li>
          <li>
            We process Your Data solely to operate the Service and as described in our Privacy Policy
          </li>
        </ul>
        <p className="mt-4">
          Upon account termination, you may request an export of Your Data prior to deletion. Exports are available
          in JSON or CSV format and must be requested before the 90-day post-deletion purge window closes.
        </p>
        <p className="mt-4">
          By using the Service, you grant Prophives a limited, non-exclusive, royalty-free licence to process Your
          Data solely for the purpose of providing and improving the Service as described in these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    heading: '8. Limitation of Liability',
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, Prophives and its officers, directors, employees, and
          agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
          including but not limited to loss of profits, data, business, or goodwill, arising out of or in connection
          with:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Your use of, or inability to use, the Service</li>
          <li>Any unauthorised access to or alteration of your data</li>
          <li>Decisions made based on AI-generated content from the platform</li>
          <li>Third-party service failures (including WhatsApp, Telegram, or payment processors)</li>
          <li>Any bugs, errors, or inaccuracies in the Service</li>
        </ul>
        <p className="mt-4">
          In all cases, Prophives's total aggregate liability to you for any claims arising under these Terms shall
          not exceed the greater of (a) the total fees paid by you to Prophives in the three months immediately
          preceding the claim, or (b) one hundred US dollars (USD $100).
        </p>
        <p className="mt-4">
          Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some
          of the above limitations may not apply to you.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    heading: '9. Termination',
    content: (
      <>
        <p>
          Either party may terminate the user relationship at any time. You may close your account from within the
          platform settings. Prophives reserves the right to suspend or terminate your account immediately, without
          prior notice or refund, under the following conditions:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>Breach of these Terms, including violations of the Acceptable Use policy</li>
          <li>Non-payment of applicable subscription fees</li>
          <li>Conduct that poses a security risk to the Service or other users</li>
          <li>Regulatory or legal requirements compelling us to do so</li>
          <li>Repeated or egregious misuse of AI features or messaging integrations</li>
        </ul>
        <p className="mt-4">
          Upon termination, your access to the Service will cease immediately. Data export requests must be submitted
          before account closure. Following account deletion, all data will be purged within 90 days as described in
          our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    heading: '10. Changes to Terms',
    content: (
      <>
        <p>
          We reserve the right to modify these Terms at any time. When we make material changes, we will:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            Notify active subscribers by email at least <strong>30 days</strong> before the changes take effect
          </li>
          <li>Display a prominent notice within the platform dashboard</li>
          <li>Update the "Last updated" date at the top of this page</li>
        </ul>
        <p className="mt-4">
          Your continued use of the Service after the effective date of any changes constitutes your acceptance of
          the revised Terms. If you do not agree to the new Terms, you must stop using the Service and may cancel
          your subscription before the changes take effect.
        </p>
        <p className="mt-4">
          For non-material changes (such as corrections to typographic errors, clarifications that do not alter your
          rights, or updates to contact information), we may update the Terms without advance notice.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    heading: '11. Governing Law',
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with applicable law, without regard to
          conflict of law principles. Any disputes arising under or in connection with these Terms that cannot be
          resolved informally shall be subject to the exclusive jurisdiction of the competent courts in the
          jurisdiction where Prophives is incorporated.
        </p>
        <p className="mt-4">
          You agree that any claim or cause of action arising out of or related to these Terms or the Service must
          be filed within one (1) year after such claim or cause of action arose, or it shall be forever barred.
        </p>
        <p className="mt-4">
          We encourage you to contact us first to resolve any disputes informally before pursuing formal legal
          action.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    heading: '12. Contact',
    content: (
      <>
        <p>
          If you have questions about these Terms of Service, need to report a legal concern, or wish to contact us
          regarding your account or subscription, please reach out to our legal team:
        </p>
        <div className="mt-4 rounded-lg border border-[#272839] bg-[#141519] p-5 space-y-2">
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
              support@prohives.com
            </a>
          </p>
          <p>
            <strong>Subject line:</strong> Legal Inquiry — [Your Name / Account Email]
          </p>
        </div>
        <p className="mt-4 text-sm text-[#8D8D96]">
          For privacy-related requests, please use{' '}
          <a href="mailto:support@prohives.com" className="font-medium underline text-[#4E79FF] hover:text-[#2251E3]">
            support@prohives.com
          </a>{' '}
          instead.
        </p>
      </>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function TermsOfServicePage() {
  usePageSeo({
    title: 'Terms of Service',
    description: 'Prophives Terms of Service — the rules and agreements that govern use of our property management platform.',
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
            Terms of Service
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#C0C0C5] max-w-2xl">
            Please read these terms carefully before using Prophives. They form a binding agreement between you and
            Prophives governing your use of our property management platform.
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
          These Terms of Service are effective as of <strong className="text-white">January 2025</strong>.
          Continued use of Prophives after any update constitutes acceptance of the revised Terms.
        </div>
      </div>
    </div>
  )
}

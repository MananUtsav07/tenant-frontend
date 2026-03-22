import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'

import { SEO } from '../common/SEO'
import { SectionContainer } from '../common/SectionContainer'
import { ROUTES } from '../../routes/constants'

type DocsArticleLayoutProps = {
  title: string
  description: string
  markdown: string
  canonicalPath: string
}

export function DocsArticleLayout({ title, description, markdown, canonicalPath }: DocsArticleLayoutProps) {
  return (
    <SectionContainer size="narrow">
      <SEO title={title} description={description} canonicalPath={canonicalPath} />

      <span className="ph-kicker">Documentation</span>
      <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)]">{title}</h1>
      <p className="mt-3 text-[var(--ph-text-muted)]">{description}</p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link className="rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-[var(--ph-text-soft)] hover:text-[var(--ph-text)]" to={ROUTES.docs}>
          Docs Home
        </Link>
        <Link className="rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-[var(--ph-text-soft)] hover:text-[var(--ph-text)]" to={ROUTES.docsGettingStarted}>
          Getting Started
        </Link>
        <Link className="rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-[var(--ph-text-soft)] hover:text-[var(--ph-text)]" to={ROUTES.docsTenantLogin}>
          Resident Login
        </Link>
        <Link className="rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-[var(--ph-text-soft)] hover:text-[var(--ph-text)]" to={ROUTES.docsOwnerDashboard}>
          Owner Workspace
        </Link>
        <Link className="rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-[var(--ph-text-soft)] hover:text-[var(--ph-text)]" to={ROUTES.docsSupportTickets}>
          Support Tickets
        </Link>
      </nav>

      <article className="ph-surface-card ph-rich-markdown mt-8 rounded-xl p-6 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.72)] [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </SectionContainer>
  )
}

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

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Documentation</p>
      <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 text-slate-600">{description}</p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900" to={ROUTES.docs}>
          Docs Home
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900" to={ROUTES.docsGettingStarted}>
          Getting Started
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900" to={ROUTES.docsTenantLogin}>
          Tenant Login
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900" to={ROUTES.docsOwnerDashboard}>
          Owner Dashboard
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900" to={ROUTES.docsSupportTickets}>
          Support Tickets
        </Link>
      </nav>

      <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.55)] [&_h1]:font-[Space_Grotesk] [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:font-[Space_Grotesk] [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:font-[Space_Grotesk] [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </SectionContainer>
  )
}



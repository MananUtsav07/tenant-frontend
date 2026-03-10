import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SEO } from '../../components/common/SEO'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { BlogPost } from '../../types/api'
import { formatDate } from '../../utils/date'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Blog slug missing')
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        setError(null)
        const response = await api.getBlogPostBySlug(slug)
        setPost(response.post)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  return (
    <SectionContainer size="narrow">
      {post ? (
        <SEO
          title={post.title}
          description={post.excerpt}
          canonicalPath={`/blog/${post.slug}`}
          ogType="article"
          image={post.cover_image ?? undefined}
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image ?? undefined,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            datePublished: post.created_at,
            mainEntityOfPage: `/blog/${post.slug}`,
          }}
        />
      ) : (
        <SEO title="Blog Post" description="TenantFlow blog article." canonicalPath={ROUTES.blog} />
      )}

      <Button to={ROUTES.blog} variant="ghost" className="px-0 text-blue-700 hover:bg-transparent">
        Back to blog
      </Button>

      {error ? <ErrorState message={error} variant="light" /> : null}
      {loading ? <LoadingState message="Loading article..." variant="message" /> : null}

      {!loading && post ? (
        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.55)] md:p-8">
          {post.cover_image ? (
            <img src={post.cover_image} alt={post.title} loading="lazy" className="mb-6 h-64 w-full rounded-xl object-cover" />
          ) : null}

          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{formatDate(post.created_at)}</p>
          <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-900">{post.title}</h1>
          <p className="mt-2 text-sm text-slate-500">By {post.author}</p>

          <div className="mt-8 space-y-4 text-slate-700 [&_h1]:font-[Space_Grotesk] [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:font-[Space_Grotesk] [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:font-[Space_Grotesk] [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      ) : null}
    </SectionContainer>
  )
}



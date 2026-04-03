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
    <SectionContainer size="narrow" tone="cream">
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
        <SEO title="Article" description="Prophives insights article." canonicalPath={ROUTES.blog} />
      )}

      <Button to={ROUTES.blog} variant="ghost" className="px-0 text-[#4E79FF] hover:bg-transparent hover:text-[#2251E3]">
        Back to insights
      </Button>

      <div className="mt-6">{error ? <ErrorState message={error} variant="light" /> : null}</div>
      {loading ? <div className="mt-6"><LoadingState message="Loading article..." variant="message" /></div> : null}

      {!loading && post ? (
        <article className="mt-6 rounded-xl border border-[#272839] bg-[#101114] p-6 shadow-sm md:p-8">
          {post.cover_image ? (
            <img src={post.cover_image} alt={post.title} loading="lazy" className="mb-6 h-64 w-full rounded-xl object-cover" />
          ) : null}

          <p className="ph-label text-xs uppercase tracking-[0.18em] text-[#8D8D96]">{formatDate(post.created_at)}</p>
          <h1 className="ph-title mt-3 text-4xl font-semibold text-white">{post.title}</h1>
          <p className="mt-2 text-sm text-[#8D8D96]">By {post.author}</p>

          <div className="mt-8 space-y-4 text-[#C0C0C5] [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      ) : null}
    </SectionContainer>
  )
}

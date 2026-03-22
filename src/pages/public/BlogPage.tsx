import { useEffect, useState } from 'react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SEO } from '../../components/common/SEO'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { BlogPost } from '../../types/api'
import { formatDate } from '../../utils/date'

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const response = await api.getBlogPosts({ page: 1, page_size: 24, sort_by: 'created_at', sort_order: 'desc' })
        setPosts(response.posts)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <SectionContainer size="wide">
      <SEO
        title="Insights"
        description="Insights and practical notes for property teams using Prophives."
        canonicalPath={ROUTES.blog}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Prophives Insights',
          description: 'Property operations, resident experience, and workflow intelligence.',
          url: ROUTES.blog,
        }}
      />

      <span className="ph-kicker">Insights</span>
      <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)] md:text-6xl">
        Notes on premium property operations
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
        Learn how high-performing real estate teams design calmer service workflows, clearer approvals, and stronger
        resident experiences.
      </p>

      <div className="mt-8">{error ? <ErrorState message={error} variant="light" /> : null}</div>
      {loading ? <div className="mt-8"><LoadingState message="Loading articles..." variant="message" /></div> : null}

      {!loading && posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No articles published yet" description="Published articles will appear here." />
        </div>
      ) : null}

      {!loading && posts.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="ph-surface-card overflow-hidden rounded-xl"
            >
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} loading="lazy" className="h-44 w-full object-cover" />
              ) : null}
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">{formatDate(post.created_at)}</p>
                <h2 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ph-text-muted)]">{post.excerpt}</p>
                <Button
                  to={`/blog/${post.slug}`}
                  variant="ghost"
                  className="mt-4 px-0 text-[#f3d49a] hover:bg-transparent"
                  analyticsEvent="blog_post_open"
                  analyticsMetadata={{ slug: post.slug }}
                >
                  Read article
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-10 rounded-xl border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-6">
        <h3 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Need help translating these ideas into rollout decisions?</h3>
        <p className="mt-2 text-[var(--ph-text-muted)]">Talk with our team to map your portfolio process in Prophives.</p>
        <Button to={ROUTES.contact} variant="primary" className="mt-4" analyticsEvent="cta_click" analyticsMetadata={{ location: 'blog_footer_contact' }}>
          Contact Team
        </Button>
      </div>
    </SectionContainer>
  )
}

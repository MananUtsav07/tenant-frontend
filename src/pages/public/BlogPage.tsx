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
        title="Blog"
        description="Insights and practical guides for property managers using TenantFlow."
        canonicalPath={ROUTES.blog}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'TenantFlow Blog',
          description: 'Property management and tenant operations insights.',
          url: ROUTES.blog,
        }}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Blog</p>
      <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">Product and operations insights</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Learn how high-performing property teams manage tenants, support workflows, and reminders at scale.
      </p>

      {error ? <ErrorState message={error} variant="light" /> : null}
      {loading ? <LoadingState message="Loading blog posts..." variant="message" /> : null}

      {!loading && posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No blog posts yet" description="Published blog posts will appear here." />
        </div>
      ) : null}

      {!loading && posts.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_60px_-45px_rgba(15,23,42,0.55)]">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} loading="lazy" className="h-44 w-full object-cover" />
              ) : null}
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{formatDate(post.created_at)}</p>
                <h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold text-slate-900">{post.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
                <Button
                  to={`/blog/${post.slug}`}
                  variant="ghost"
                  className="mt-4 px-0 text-blue-700 hover:bg-transparent"
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

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6">
        <h3 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">Need help implementing these workflows?</h3>
        <p className="mt-2 text-slate-600">Talk with our team to map your portfolio process in TenantFlow.</p>
        <Button to={ROUTES.contact} variant="secondary" className="mt-4" analyticsEvent="cta_click" analyticsMetadata={{ location: 'blog_footer_contact' }}>
          Contact Team
        </Button>
      </div>
    </SectionContainer>
  )
}



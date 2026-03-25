import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Send } from 'lucide-react'

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
import { revealUp, staggerParent, fadeIn, viewportOnce, useMotionVariants } from '../../utils/motion'

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const revealUpMotion = useMotionVariants(revealUp)
  const fadeInMotion = useMotionVariants(fadeIn)
  const staggerMotion = useMotionVariants(staggerParent)

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

  const featuredPost = posts.length > 0 ? posts[0] : null
  const gridPosts = posts.length > 1 ? posts.slice(1) : []

  return (
    <>
      <SEO
        title="Prophives Blog"
        description="Insights on property management, AI, and real estate tech. Discover how automation is reshaping the Dubai market."
        canonicalPath={ROUTES.blog}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Prophives Blog',
          description: 'Property operations, resident experience, and workflow intelligence.',
          url: ROUTES.blog,
        }}
      />

      {/* Header Section */}
      <SectionContainer tone="cream" size="wide" padded>
        <motion.div
          className="text-center"
          variants={revealUpMotion}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <h1 className="ph-title text-4xl font-extrabold text-[#1A1A1A] md:text-6xl">
            Prophives Blog
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-[Manrope] text-lg text-[#6B7280] md:text-xl">
            Insights on property management, AI, and real estate tech. Discover how automation is reshaping the Dubai market.
          </p>
        </motion.div>
      </SectionContainer>

      {/* Error State */}
      {error ? (
        <SectionContainer tone="cream" size="wide" padded={false}>
          <div className="py-8">
            <ErrorState message={error} variant="light" />
          </div>
        </SectionContainer>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <SectionContainer tone="cream" size="wide" padded={false}>
          <div className="py-8">
            <LoadingState message="Loading articles..." variant="message" />
          </div>
        </SectionContainer>
      ) : null}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error ? (
        <SectionContainer tone="cream" size="wide" padded={false}>
          <div className="py-8">
            <EmptyState title="No articles published yet" description="Published articles will appear here." />
          </div>
        </SectionContainer>
      ) : null}

      {/* Featured Post Section */}
      {!loading && featuredPost ? (
        <section className="bg-[#FEFAEF] px-4 sm:px-6 lg:px-10">
          <motion.div
            className="mx-auto -mt-12 mb-20 max-w-7xl"
            variants={fadeInMotion}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <article className="flex min-h-[450px] flex-col overflow-hidden rounded-xl bg-white shadow-xl md:flex-row">
              {/* Featured Image */}
              <div className="relative overflow-hidden md:w-3/5">
                {featuredPost.cover_image ? (
                  <img
                    alt={featuredPost.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src={featuredPost.cover_image}
                    loading="eager"
                  />
                ) : (
                  <img
                    alt={featuredPost.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJN6xLDvsFpfq4ReBw7lPLnv3tbDiz6kXHwvpd0WDNCyO389YlyEQ2mVdCiFOoWbb8ubYt2dqfLn2pIGnFPFdbBhCvC2ysfUxlXV3RuVopgQMm6tkyngqSZ0moVaTt8U1TtbNlTA9QD9u4BDajR0RfpYyMBJ81cmLLwa81pptJipIEOT8Y13wkjOpAzM1DG28vNiYwivNFT3T9c7leVk0z4zkak_gdndm3nmM0SK9UG7-go_aKvIcsTD37_0_0vcBjewaehPa32oOR"
                  />
                )}
              </div>
              {/* Featured Content */}
              <div className="flex flex-col justify-center p-8 md:w-2/5 md:p-12">
                <span className="mb-4 inline-block rounded-full bg-[#FFFAE2] px-3 py-1 font-[DM_Sans] text-xs font-bold uppercase tracking-wider text-[#FFD70B]">
                  Featured
                </span>
                <h2 className="ph-title mb-4 text-2xl font-bold leading-tight text-[#1A1A1A] md:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mb-6 font-[Manrope] leading-relaxed text-[#6B7280]">
                  {featuredPost.excerpt}
                </p>
                <div className="mb-8 flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#FEFAEF]">
                    <img
                      alt="Author"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUDNNL3OC9Vv4eZw4uqnFqM-lzIbUkQu-GZBB0aMMB8v9xOJGEFzQY3eAmHyrl_mpNVm5tX3_aRbbRBvDOaXH_bXqdRCJJdd2fa8nWEAmfb7V04N0AmtR_7DfjgcMe5w9e_krPx0xqoOTBXfPSwZIRjBtVUfZlTg4rt5e18pUQodpL8D5Y7cyH-WHYcq8yX62Xcl8ed3fJ8oaHYqBvoLu2e_1NHb4Mwn2LDof-jVJU07kz7tGxF6g7-3qsR8KoUmU7WqDWaW8karUY"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{featuredPost.author}</p>
                    <p className="text-xs text-[#6B7280]">{formatDate(featuredPost.created_at)}</p>
                  </div>
                </div>
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="group inline-flex items-center font-bold text-[#FED609] transition-colors hover:text-[#FFD70B]"
                >
                  Read More
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </motion.div>
        </section>
      ) : null}

      {/* Blog Grid Section */}
      {!loading && gridPosts.length > 0 ? (
        <SectionContainer tone="cream" size="wide" padded>
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerMotion}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            {gridPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={revealUpMotion}
                className="group flex flex-col overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:border-[#FED609] hover:shadow-md"
              >
                {/* Card Image */}
                <div className="h-48 overflow-hidden">
                  {post.cover_image ? (
                    <img
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={post.cover_image}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FFFAE2]">
                      <span className="ph-title text-3xl font-bold text-[#FED609]/30">P</span>
                    </div>
                  )}
                </div>
                {/* Card Content */}
                <div className="flex flex-grow flex-col p-6">
                  <h3 className="ph-title mb-3 text-xl font-bold leading-snug text-[#1A1A1A]">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#FFD70B] transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mb-6 line-clamp-2 text-sm text-[#6B7280]">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                        <img
                          alt="Author"
                          className="h-full w-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrERI4JJ_FURnyzuFjYAquzwniQs6rCOLhY4_-BmXzyrmvEakETSRvRAvkf-y2CuKn5w4GeIqBnfzb6JtjvxlOoym6qZamg1xIAliEjFJZ8ryZ_B46IKwELU0Km1xmL3pHjROM3eUy58QVRj9kLVGJ9V8QoHxUxhfCkybHAyJEpYBHAh6q1D_ZtndpIUBc1v9yTXkmr5tBgOuCK_bLvONH5BqFoKc2GS9BVngTJqUvqtoadGjGvVNiCbLaDrHuYFjBpJgPHqFEJCFM"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#1A1A1A]">{post.author}</span>
                    </div>
                    <div className="font-[DM_Sans] text-[10px] uppercase text-[#6B7280]">
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </SectionContainer>
      ) : null}

      {/* Newsletter CTA Section */}
      <SectionContainer tone="ivory" size="default" padded>
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={revealUpMotion}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <h2 className="ph-title text-3xl font-extrabold text-[#1A1A1A] md:text-4xl">
            Stay Updated
          </h2>
          <p className="mx-auto mb-8 mt-4 max-w-lg font-[Manrope] text-[#6B7280]">
            Get the latest property management insights delivered to your inbox weekly.
          </p>
          <div className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <input
              className="flex-grow rounded-xl border-2 border-white px-6 py-4 font-[Manrope] shadow-sm outline-none focus:border-[#FED609] focus:ring-0"
              placeholder="Enter your email address"
              type="email"
            />
            <button className="rounded-xl bg-[#FED609] px-8 py-4 font-bold text-[#1A1A1A] shadow-md transition-all duration-200 hover:bg-[#FFD70B]">
              Subscribe
            </button>
          </div>
          <div className="mt-8 flex justify-center space-x-6">
            <div className="flex items-center text-sm font-semibold text-[#25D366]">
              <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp Alerts
            </div>
            <div className="flex items-center text-sm font-semibold text-[#0088cc]">
              <Send className="mr-1 h-4 w-4" /> Telegram Channel
            </div>
          </div>
        </motion.div>
      </SectionContainer>
    </>
  )
}

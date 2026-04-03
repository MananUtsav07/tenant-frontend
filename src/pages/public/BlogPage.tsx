import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Send, ChevronRight } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SEO } from '../../components/common/SEO'
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
        description="Insights on property management, AI, and real estate tech. Discover how automation is reshaping the property management market."
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
      <header className="bg-[#06070B] py-16 md:py-24 px-6">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={revealUpMotion}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <h1 className="font-['Sora'] text-4xl md:text-6xl font-extrabold text-white mb-6">
            Prophives Blog
          </h1>
          <p className="font-['Manrope'] text-lg md:text-xl text-[#8D8D96] max-w-2xl mx-auto">
            Insights on property management, AI, and real estate tech. Discover how automation is reshaping the property management market.
          </p>
        </motion.div>
      </header>

      {/* Error State */}
      {error ? (
        <div className="bg-[#06070B] px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <ErrorState message={error} variant="light" />
          </div>
        </div>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <div className="bg-[#06070B] px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <LoadingState message="Loading articles..." variant="message" />
          </div>
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error ? (
        <div className="bg-[#06070B] px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <EmptyState title="No articles published yet" description="Published articles will appear here." />
          </div>
        </div>
      ) : null}

      {/* Featured Post Section */}
      {!loading && featuredPost ? (
        <section className="px-6 -mt-12 mb-20">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={fadeInMotion}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <article className="bg-[#101114] border border-[#272839] rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">
              {/* Featured Image */}
              <div className="md:w-3/5 relative overflow-hidden">
                {featuredPost.cover_image ? (
                  <img
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    src={featuredPost.cover_image}
                    loading="eager"
                  />
                ) : (
                  <img
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJN6xLDvsFpfq4ReBw7lPLnv3tbDiz6kXHwvpd0WDNCyO389YlyEQ2mVdCiFOoWbb8ubYt2dqfLn2pIGnFPFdbBhCvC2ysfUxlXV3RuVopgQMm6tkyngqSZ0moVaTt8U1TtbNlTA9QD9u4BDajR0RfpYyMBJ81cmLLwa81pptJipIEOT8Y13wkjOpAzM1DG28vNiYwivNFT3T9c7leVk0z4zkak_gdndm3nmM0SK9UG7-go_aKvIcsTD37_0_0vcBjewaehPa32oOR"
                  />
                )}
              </div>
              {/* Featured Content */}
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-[rgba(34,81,227,0.12)] text-[#4E79FF] font-['DM_Sans'] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  Featured
                </span>
                <h2 className="font-['Sora'] text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-[#8D8D96] mb-6 font-['Manrope'] leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#141519] flex items-center justify-center overflow-hidden border border-[#272839]">
                    <img
                      alt="Author"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUDNNL3OC9Vv4eZw4uqnFqM-lzIbUkQu-GZBB0aMMB8v9xOJGEFzQY3eAmHyrl_mpNVm5tX3_aRbbRBvDOaXH_bXqdRCJJdd2fa8nWEAmfb7V04N0AmtR_7DfjgcMe5w9e_krPx0xqoOTBXfPSwZIRjBtVUfZlTg4rt5e18pUQodpL8D5Y7cyH-WHYcq8yX62Xcl8ed3fJ8oaHYqBvoLu2e_1NHb4Mwn2LDof-jVJU07kz7tGxF6g7-3qsR8KoUmU7WqDWaW8karUY"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{featuredPost.author}</p>
                    <p className="text-xs text-[#8D8D96]">{formatDate(featuredPost.created_at)}</p>
                  </div>
                </div>
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center font-bold text-[#4E79FF] hover:text-[#2251E3] transition-colors group"
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
        <section className="bg-[#06070B] py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerMotion}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              {gridPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={revealUpMotion}
                  className="bg-[#101114] rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-[rgba(34,81,227,0.4)] border border-[#272839] group"
                >
                  {/* Card Image */}
                  <div className="h-48 overflow-hidden">
                    {post.cover_image ? (
                      <img
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={post.cover_image}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#141519]">
                        <span className="font-['Sora'] text-3xl font-bold text-[#2251E3]/30">P</span>
                      </div>
                    )}
                  </div>
                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-['Sora'] text-xl font-bold text-white mb-3 leading-snug">
                      <Link to={`/blog/${post.slug}`} className="hover:text-[#4E79FF] transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-[#8D8D96] text-sm mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#141519] overflow-hidden border border-[#272839]">
                          <img
                            alt="Author"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrERI4JJ_FURnyzuFjYAquzwniQs6rCOLhY4_-BmXzyrmvEakETSRvRAvkf-y2CuKn5w4GeIqBnfzb6JtjvxlOoym6qZamg1xIAliEjFJZ8ryZ_B46IKwELU0Km1xmL3pHjROM3eUy58QVRj9kLVGJ9V8QoHxUxhfCkybHAyJEpYBHAh6q1D_ZtndpIUBc1v9yTXkmr5tBgOuCK_bLvONH5BqFoKc2GS9BVngTJqUvqtoadGjGvVNiCbLaDrHuYFjBpJgPHqFEJCFM"
                          />
                        </div>
                        <span className="text-xs font-semibold text-white">{post.author}</span>
                      </div>
                      <div className="font-['DM_Sans'] text-[10px] uppercase text-[#8D8D96]">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2251E3] text-white font-bold shadow-sm"
              >
                1
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#101114] border border-[#272839] text-[#8D8D96] hover:text-[#4E79FF] transition-colors font-medium"
              >
                2
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#101114] border border-[#272839] text-[#8D8D96] hover:text-[#4E79FF] transition-colors font-medium"
              >
                3
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#101114] border border-[#272839] text-[#8D8D96] hover:text-[#4E79FF] transition-colors font-medium"
              >
                4
              </a>
              <a href="#" className="text-[#8D8D96] hover:text-[#4E79FF] transition-colors">
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* Newsletter CTA Section */}
      <section className="bg-[#101114] border-t border-[#272839] py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={revealUpMotion}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <h2 className="font-['Sora'] text-3xl md:text-4xl font-extrabold text-white mb-4">
            Stay Updated
          </h2>
          <p className="font-['Manrope'] text-[#8D8D96] mb-8 max-w-lg mx-auto">
            Get the latest property management insights delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              className="flex-grow px-6 py-4 rounded-xl border border-[#272839] bg-[#06070B] text-white placeholder-[#8D8D96] focus:border-[#2251E3] focus:ring-2 focus:ring-[rgba(34,81,227,0.2)] outline-none font-['Manrope']"
              placeholder="Enter your email address"
              type="email"
            />
            <button className="bg-[#2251E3] hover:bg-[#4E79FF] text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 shadow-md">
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
      </section>
    </>
  )
}

import { motion } from 'framer-motion'

import { SectionContainer } from '../../components/common/SectionContainer'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const testimonials = [
  {
    quote:
      'Prophives finally gave our portfolio team the calm control room we were missing. Resident issues, rent follow-up, and approvals now move with much less friction.',
    name: 'Nadia Al Mansoori',
    role: 'Director of Operations',
    company: 'Private Dubai Portfolio',
  },
  {
    quote:
      'The experience feels premium from both sides. Our owners get cleaner visibility, while residents get faster responses and a more polished service journey.',
    name: 'Omar Hadi',
    role: 'Asset Management Lead',
    company: 'Luxury Residential Group',
  },
  {
    quote:
      'What stood out was the restraint. The automation is helpful, but the platform still keeps people in control where it matters.',
    name: 'Leila Rahman',
    role: 'Head of Resident Experience',
    company: 'Boutique Property Brand',
  },
]

export function TestimonialSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide" tone="navy">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <span className="ph-kicker">Operator Feedback</span>
        <h2 className="ph-title mt-6 max-w-4xl text-3xl font-semibold text-[var(--ph-text)] md:text-5xl">
          Trusted by teams that expect luxury-grade execution
        </h2>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-4 lg:gap-5 lg:grid-cols-3"
      >
        {testimonials.map((testimonial) => (
          <motion.article
            key={testimonial.name}
            variants={revealVariants}
            className="rounded-xl border border-[rgba(83,88,100,0.34)] bg-white/[0.025] p-6 sm:p-7"
          >
            <p className="text-lg leading-relaxed text-[var(--ph-text-soft)]">"{testimonial.quote}"</p>
            <div className="mt-6 border-t border-[rgba(83,88,100,0.28)] pt-4">
              <p className="ph-title text-base font-semibold text-[var(--ph-text)]">{testimonial.name}</p>
              <p className="text-sm text-[var(--ph-text-muted)]">
                {testimonial.role} · {testimonial.company}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </SectionContainer>
  )
}

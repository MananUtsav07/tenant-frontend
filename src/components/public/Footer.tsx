import { motion } from 'framer-motion'
import { Copyright, Github, Linkedin, Mail, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/constants'
import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'

const productLinks = [
  { to: ROUTES.features, label: 'Features' },
  { to: ROUTES.howItWorks, label: 'How It Works' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.blog, label: 'Blog' },
  { to: ROUTES.docs, label: 'Documentation' },
]

const companyLinks = [
  { to: ROUTES.contact, label: 'Contact' },
  { to: ROUTES.ownerLogin, label: 'Owner Login' },
  { to: ROUTES.tenantLogin, label: 'Tenant Login' },
]

const supportLinks = [
  { href: 'mailto:support@tenantflow.app', label: 'support@tenantflow.app', icon: <Mail className="h-4 w-4" /> },
  { href: 'tel:+910000000000', label: '+91 00000 00000', icon: <Phone className="h-4 w-4" /> },
  { href: ROUTES.contact, label: 'Contact Form', icon: <MessageCircle className="h-4 w-4" />, isInternal: true },
]

const socialLinks = [
  { href: ROUTES.contact, label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, isInternal: true },
  { href: ROUTES.contact, label: 'GitHub', icon: <Github className="h-4 w-4" />, isInternal: true },
  { href: 'mailto:support@tenantflow.app', label: 'Email', icon: <Mail className="h-4 w-4" /> },
]

export function Footer() {
  const revealVariants = useMotionVariants(revealUp)

  return (
    <footer className="border-t border-slate-200/80 bg-white/90">
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8"
      >
        <div>
          <h3 className="font-[Space_Grotesk] text-lg font-semibold text-slate-900">TenantFlow</h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
            Professional property operations software for modern landlords and portfolio teams.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Product</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {productLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-blue-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {companyLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-blue-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {supportLinks.map((link) => (
              <li key={link.label}>
                {link.isInternal ? (
                  <Link to={link.href} className="inline-flex items-center gap-2 hover:text-blue-700">
                    {link.icon}
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="inline-flex items-center gap-2 hover:text-blue-700">
                    {link.icon}
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map((link) =>
              link.isInternal ? (
                <Link
                  key={link.label}
                  to={link.href}
                  aria-label={link.label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {link.icon}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {link.icon}
                </a>
              ),
            )}
          </div>
        </div>
      </motion.div>
      <div className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1.5">
            <Copyright className="h-3.5 w-3.5" />
            {new Date().getFullYear()} TenantFlow. All rights reserved.
          </p>
          <p>Built for modern property operations.</p>
        </div>
      </div>
    </footer>
  )
}


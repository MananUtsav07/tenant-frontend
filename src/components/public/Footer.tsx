import { Copyright, Mail, MessageCircle, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/constants'
import { Button } from '../common/Button'

const productLinks = [
  { to: ROUTES.features, label: 'Features' },
  { to: ROUTES.howItWorks, label: 'How It Works' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.blog, label: 'Blog' },
  { to: ROUTES.contact, label: 'Contact' },
]

const workspaceLinks = [
  { to: ROUTES.ownerLogin, label: 'Owner Login' },
  { to: ROUTES.tenantLogin, label: 'Tenant Login' },
]

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr]">
        {/* Brand */}
        <div>
          <div className="inline-flex items-center">
            <img src="/prophives-logo-original.svg" alt="Prophives" className="h-10 w-auto object-contain rounded-lg" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            The smart operations layer for property portfolios. AI-powered automation, integrated messaging, and seamless tenant management.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button to={ROUTES.contact} variant="primary" size="sm">
              Get Started
            </Button>
            <Button to={ROUTES.pricing} variant="outline" size="sm" className="!border-white/20 !text-white hover:!bg-white/5">
              View Plans
            </Button>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/40">Platform</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            {productLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition hover:text-[#FED609]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Workspace Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/40">Workspaces</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            {workspaceLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition hover:text-[#FED609]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/40">Legal</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li>
              <Link to="/privacy-policy" className="transition hover:text-[#FED609]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="transition hover:text-[#FED609]">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Integrations */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/40">Connect</h4>
          <div className="mt-4 space-y-3 text-sm text-white/60">
            <p className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#FED609]" />
              support@prohives.com
            </p>
            <p className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              WhatsApp Support
            </p>
            <p className="inline-flex items-center gap-2">
              <Send className="h-4 w-4 text-[#0088cc]" />
              <a
                href="https://t.me/prophives"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-[#0088cc] transition-colors"
              >
                Telegram Bot
              </a>
            </p>
          </div>
        </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 py-4 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p className="inline-flex items-center gap-1.5">
            <Copyright className="h-3.5 w-3.5" />
            {new Date().getFullYear()} Prophives. All rights reserved.
          </p>
          <p>AI-powered property management platform.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

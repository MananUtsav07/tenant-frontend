import { Building2, Copyright, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/constants'
import { Button } from '../common/Button'

const productLinks = [
  { to: ROUTES.features, label: 'Platform' },
  { to: ROUTES.howItWorks, label: 'Workflow' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.blog, label: 'Insights' },
  { to: ROUTES.docs, label: 'Documentation' },
]

const workspaceLinks = [
  { to: ROUTES.ownerLogin, label: 'Owner Workspace' },
  { to: ROUTES.tenantLogin, label: 'Tenant Workspace' },
]

export function Footer() {
  return (
    <footer className="border-t border-[rgba(83,88,100,0.28)] bg-[rgba(9,13,24,0.86)] backdrop-blur">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 py-14 lg:grid-cols-[1.25fr_0.75fr_0.75fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(240,163,35,0.24)] bg-[linear-gradient(135deg,rgba(240,163,35,0.16),rgba(11,22,51,0.92))] shadow-[0_16px_34px_-22px_rgba(240,163,35,0.28)]">
                <span className="absolute inset-[5px] rounded-[0.85rem] border border-white/8 bg-[rgba(11,22,51,0.58)]" />
                <span className="ph-title relative z-10 text-base font-semibold text-[var(--ph-accent)]">P</span>
              </span>
              <div>
                <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Prophives</h3>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ph-text-muted)]">Dubai AI Real Estate Ops</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Prophives is the premium operations layer for real estate portfolios that expect faster response loops,
              calmer control rooms, and luxury-grade service delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={ROUTES.contact} variant="primary" size="sm">
                Book Private Demo
              </Button>
              <Button to={ROUTES.pricing} variant="secondary" size="sm">
                View Plans
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Platform</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--ph-text-soft)]">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-[#f3d49a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Workspaces</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--ph-text-soft)]">
              {workspaceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-[#f3d49a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Rollout</h4>
            <div className="mt-4 space-y-3 text-sm text-[var(--ph-text-soft)]">
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--ph-accent)]" />
                support@prophives.com
              </p>
              <p className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--ph-accent)]" />
                Dubai-focused onboarding and portfolio setup
              </p>
              <p className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--ph-accent)]" />
                AI workflow mapping for owners and operators
              </p>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
                Secure multi-role access across portfolios
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(83,88,100,0.28)] bg-[rgba(7,10,18,0.9)]">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 py-4 text-xs text-[var(--ph-text-muted)] md:flex-row md:items-center md:justify-between">
            <p className="inline-flex items-center gap-1.5">
              <Copyright className="h-3.5 w-3.5" />
              {new Date().getFullYear()} Prophives. All rights reserved.
            </p>
            <p>Luxury AI operations platform for real estate.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

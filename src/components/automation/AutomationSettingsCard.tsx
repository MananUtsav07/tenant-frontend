import type { ReactNode } from 'react'

export function AutomationSettingsCard({
  eyebrow,
  title,
  description,
  icon,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <article className="ph-form-panel rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">{eyebrow}</p>
          <h3 className="mt-3 inline-flex items-center gap-2 text-xl font-semibold text-[var(--ph-text)]">
            <span className="text-[var(--ph-accent)]">{icon}</span>
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </article>
  )
}

import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

export function AutomationSectionTabs({
  tabs,
}: {
  tabs: Array<{
    to: string
    label: string
    description: string
  }>
}) {
  return (
    <nav
      aria-label="Automation sections"
      className="grid gap-3 rounded-xl border border-[rgba(83,88,100,0.42)] bg-[rgba(255,255,255,0.03)] p-3 md:grid-cols-2"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            clsx(
              'rounded-lg border px-4 py-3 transition',
              isActive
                ? 'border-[rgba(240,163,35,0.28)] bg-[linear-gradient(180deg,rgba(240,163,35,0.14),rgba(151,105,34,0.08))] shadow-[0_22px_44px_-34px_rgba(240,163,35,0.45)]'
                : 'border-[rgba(83,88,100,0.34)] bg-[rgba(10,16,28,0.52)] hover:border-[rgba(151,105,34,0.34)] hover:bg-[rgba(255,255,255,0.03)]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <p
                className={clsx(
                  'text-sm font-semibold',
                  isActive ? 'text-[var(--ph-text)]' : 'text-[var(--ph-text-soft)]',
                )}
              >
                {tab.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ph-text-muted)]">{tab.description}</p>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

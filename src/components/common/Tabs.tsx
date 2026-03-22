import clsx from 'clsx'

type Tab = {
  key: string
  label: string
}

type TabsProps = {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1 rounded-lg bg-white/[0.03] p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={clsx(
            'rounded-md px-4 py-2 text-sm font-medium transition duration-150',
            activeKey === tab.key
              ? 'border-b-2 border-[var(--ph-accent)] bg-white/[0.06] text-[var(--ph-text)]'
              : 'text-[var(--ph-text-muted)] hover:text-[var(--ph-text-soft)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

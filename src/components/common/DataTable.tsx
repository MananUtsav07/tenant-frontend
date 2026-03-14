import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-[1.75rem] border border-[rgba(83,88,100,0.56)] bg-[linear-gradient(180deg,rgba(26,34,56,0.94),rgba(16,21,34,0.98))] shadow-[0_20px_54px_-40px_rgba(0,0,0,0.76)]">
      <table className="min-w-full divide-y divide-[rgba(83,88,100,0.36)]">
        <thead className="bg-white/[0.03]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ph-text-muted)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(83,88,100,0.32)] text-sm text-[var(--ph-text-soft)] [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.04]">
          {children}
        </tbody>
      </table>
    </div>
  )
}

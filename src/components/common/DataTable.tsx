import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(83,88,100,0.3)] bg-[rgba(20,26,40,0.94)] shadow-[0_1px_3px_rgba(0,0,0,0.24)]">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-[rgba(83,88,100,0.2)]">
          <thead className="bg-white/[0.02]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(83,88,100,0.16)] text-sm text-[var(--ph-text-soft)] [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.02]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[1.55rem] border border-[rgba(83,88,100,0.42)] bg-[linear-gradient(180deg,rgba(20,26,40,0.94),rgba(11,16,27,0.98))] shadow-[0_20px_48px_-40px_rgba(0,0,0,0.74)]">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-[rgba(83,88,100,0.28)]">
          <thead className="bg-white/[0.02]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(83,88,100,0.24)] text-sm text-[var(--ph-text-soft)] [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.025]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

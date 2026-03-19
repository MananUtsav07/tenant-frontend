import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[rgba(83,88,100,0.14)]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-medium text-[var(--ph-text-muted)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-[var(--ph-text-soft)] [&>tr]:border-b [&>tr]:border-[rgba(83,88,100,0.08)] [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.025] [&>tr:last-child]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  )
}

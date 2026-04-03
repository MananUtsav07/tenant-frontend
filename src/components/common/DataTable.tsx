import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#272839] bg-[#101114] shadow-sm">
      <table className="min-w-full divide-y divide-[#272839]">
        <thead className="bg-[#141519]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8D8D96]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272839] text-sm text-[#C0C0C5] [&>tr]:transition-colors [&>tr:hover]:bg-[#141519] [&>tr:nth-child(even)]:bg-[#141519]/50">
          {children}
        </tbody>
      </table>
    </div>
  )
}

import type { ReactNode } from 'react'

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.06)] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[rgba(0,0,0,0.06)]">
        <thead className="bg-[#FEFAEF]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(0,0,0,0.06)] text-sm text-[#4B5563] [&>tr]:transition-colors [&>tr:hover]:bg-[#FEFAEF]/60 [&>tr:nth-child(even)]:bg-[#FEFAEF]/30">
          {children}
        </tbody>
      </table>
    </div>
  )
}

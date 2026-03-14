import type { ReactNode } from 'react'

import type { TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'
import { DataTable } from './DataTable'
import { StatusBadge } from './StatusBadge'

export function TicketTable({
  tickets,
  action,
}: {
  tickets: TenantTicket[]
  action?: (ticket: TenantTicket) => ReactNode
}) {
  const headers = ['Subject', 'Message', 'Status', 'Created']
  if (action) {
    headers.push('Action')
  }

  return (
    <DataTable headers={headers}>
      {tickets.map((ticket) => (
        <tr key={ticket.id}>
          <td className="px-4 py-3 font-medium text-[var(--ph-text)]">{ticket.subject}</td>
          <td className="max-w-lg px-4 py-3 text-[var(--ph-text-soft)]">{ticket.message}</td>
          <td className="px-4 py-3">
            <StatusBadge status={ticket.status} />
          </td>
          <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(ticket.created_at)}</td>
          {action ? <td className="px-4 py-3">{action(ticket)}</td> : null}
        </tr>
      ))}
    </DataTable>
  )
}

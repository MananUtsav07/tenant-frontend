import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
  Ticket,
  TicketX,
} from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const ownerTicketStatuses: TenantTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']

const TICKETS_PER_PAGE = 8

type FilterStatus = 'all' | TenantTicket['status']
type ModalType = 'reply' | 'status' | 'view' | null

function getStatusBadgeClasses(status: TenantTicket['status']): string {
  switch (status) {
    case 'open':
      return 'bg-[#FED609] text-[#1A1A1A] shadow-sm'
    case 'in_progress':
      return 'bg-blue-100 text-blue-600 border border-blue-200'
    case 'resolved':
      return 'bg-green-100 text-green-600 border border-green-200'
    case 'closed':
      return 'bg-gray-100 text-gray-600 border border-gray-200'
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
}

function getStatusLabel(status: TenantTicket['status']): string {
  switch (status) {
    case 'open': return 'Open'
    case 'in_progress': return 'In Progress'
    case 'resolved': return 'Resolved'
    case 'closed': return 'Closed'
    default: return status
  }
}

export function OwnerTicketsPage() {
  const { token } = useOwnerAuth()

  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<ModalType>(null)

  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)

  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)

  const [statusValue, setStatusValue] = useState<TenantTicket['status']>('open')
  const [closingMessage, setClosingMessage] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const loadTickets = useCallback(async () => {
    if (!token) return
    try {
      setError(null)
      const response = await api.getOwnerTickets(token)
      setTickets(response.tickets)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const loadThread = useCallback(
    async (ticketId: string) => {
      if (!token) return
      try {
        setThreadLoading(true)
        setThreadError(null)
        const response = await api.getOwnerTicketDetail(token, ticketId)
        setThread(response.thread)
        setStatusValue(response.thread.ticket.status)
        setClosingMessage('')
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket')
      } finally {
        setThreadLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!activeTicketId) return
    void loadThread(activeTicketId)
  }, [activeTicketId, loadThread])

  const openModal = (type: ModalType, ticketId: string) => {
    setActiveTicketId(ticketId)
    setModalType(type)
    setReplyMessage('')
    setThreadError(null)
  }

  const closeModal = () => {
    setModalType(null)
    setThread(null)
    setActiveTicketId(null)
  }

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) return
    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyOwnerTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
      closeModal()
    } catch (replyError) {
      setThreadError(replyError instanceof Error ? replyError.message : 'Failed to send reply')
    } finally {
      setReplyBusy(false)
    }
  }

  const handleStatusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread) return
    try {
      setStatusBusy(true)
      setThreadError(null)
      await api.updateOwnerTicket(token, thread.ticket.id, {
        status: statusValue,
        closing_message:
          statusValue === 'closed' && closingMessage.trim().length > 0
            ? closingMessage.trim()
            : undefined,
      })
      setClosingMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
      closeModal()
    } catch (statusError) {
      setThreadError(statusError instanceof Error ? statusError.message : 'Failed to update status')
    } finally {
      setStatusBusy(false)
    }
  }

 
  // const ticketSummary = useMemo(() => {
  //   if (!thread) return null
  //   const tenant = thread.ticket.tenants
  //   const property = tenant?.properties
  //   return {
  //     tenantLabel: tenant ? `${tenant.full_name} (${tenant.tenant_access_id})` : 'Tenant unavailable',
  //     tenantName: tenant?.full_name ?? 'Unknown Tenant',
  //     propertyLabel: property?.property_name ?? 'Property unavailable',
  //     unitLabel: property?.unit_number ?? '-',
  //   }
  // }, [thread])

  const statsTotal = tickets.length
  const statsOpen = tickets.filter((t) => t.status === 'open').length
  const statsInProgress = tickets.filter((t) => t.status === 'in_progress').length
  const statsResolved = tickets.filter((t) => t.status === 'resolved').length

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [tickets, filterStatus, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedTickets = filteredTickets.slice((safePage - 1) * TICKETS_PER_PAGE, safePage * TICKETS_PER_PAGE)

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const filterPills: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEFAEF', color: '#1A1A1A' }}>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight" style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}>
            Support Tickets
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280', fontFamily: 'Manrope, sans-serif' }}>
            Manage and track property maintenance and tenant inquiries.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none w-64 text-sm focus:ring-2"
              style={{ borderColor: 'rgba(254,214,9,0.2)', fontFamily: 'Manrope, sans-serif' }}
            />
          </div>
        </div>
      </header>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading owner tickets..." rows={5} /> : null}

      {!loading && tickets.length === 0 ? (
        <EmptyState
          title="No tickets"
          description="New tenant tickets will appear here after tenants submit support requests."
          icon={<TicketX className="h-5 w-5" />}
          actionLabel="Go to Tenants"
          actionHref={ROUTES.ownerTenants}
        />
      ) : null}

      {!loading && tickets.length > 0 ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all" style={{ borderColor: 'rgba(254,214,9,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>Total Tickets</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}>{statsTotal}</h3>
                <Ticket className="h-6 w-6 group-hover:scale-110 transition-transform" style={{ color: '#FED609' }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:border-r hover:border-t hover:border-b hover:border-[rgba(254,214,9,0.3)] transition-all group" style={{ borderLeftColor: '#FED609' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>Open</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#FED609' }}>{statsOpen}</h3>
                <Circle className="h-6 w-6 group-hover:scale-110 transition-transform fill-current" style={{ color: '#FED609' }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all" style={{ borderColor: 'rgba(254,214,9,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>In Progress</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-blue-500" style={{ fontFamily: 'Sora, sans-serif' }}>{statsInProgress}</h3>
                <RefreshCw className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all" style={{ borderColor: 'rgba(254,214,9,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>Resolved</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-green-500" style={{ fontFamily: 'Sora, sans-serif' }}>{statsResolved}</h3>
                <CheckCircle className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterPills.map((pill) => {
              const isActive = filterStatus === pill.value
              const isAll = pill.value === 'all'
              return (
                <button
                  key={pill.value}
                  onClick={() => handleFilterChange(pill.value)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? isAll
                        ? { backgroundColor: '#1A1A1A', color: '#ffffff' }
                        : { backgroundColor: '#FED609', color: '#1A1A1A' }
                      : { backgroundColor: '#ffffff', border: '1px solid rgba(254,214,9,0.2)', color: '#6B7280' }
                  }
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid rgba(254,214,9,0.1)' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ backgroundColor: '#FFFAE2', borderColor: 'rgba(254,214,9,0.2)' }}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}>Ticket ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}>Subject</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}>Tenant / Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}>Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#6B7280' }}>
                      No tickets match your current filters.
                    </td>
                  </tr>
                ) : null}
                {pagedTickets.map((ticket, index) => {
                  const isEven = index % 2 === 1
                  return (
                    <tr
                      key={ticket.id}
                      className="border-t transition-colors"
                      style={{
                        backgroundColor: isEven ? '#FEFAEF' : '#ffffff',
                        borderColor: 'rgba(254,214,9,0.06)',
                      }}
                    >
                      <td className="px-6 py-4 text-sm" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
                        #{ticket.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-sm" style={{ color: '#1A1A1A', fontFamily: 'Manrope, sans-serif' }}>
                          {ticket.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: '#1A1A1A', fontFamily: 'Manrope, sans-serif' }}>Tenant</div>
                        <div className="text-xs" style={{ color: '#6B7280' }}>{formatDateTime(ticket.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Reply */}
                          <button
                            type="button"
                            onClick={() => openModal('reply', ticket.id)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#FFFAE2]"
                            style={{ color: '#1A1A1A', border: '1px solid rgba(254,214,9,0.3)' }}
                            title="Reply to tenant"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                          </button>
                          {/* Change Status */}
                          <button
                            type="button"
                            onClick={() => openModal('status', ticket.id)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#FFFAE2]"
                            style={{ color: '#1A1A1A', border: '1px solid rgba(254,214,9,0.3)' }}
                            title="Change status"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Status
                          </button>
                          {/* View History */}
                          <button
                            type="button"
                            onClick={() => openModal('view', ticket.id)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{ backgroundColor: '#FED609', color: '#1A1A1A' }}
                            title="View ticket history"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-white border-t flex items-center justify-between" style={{ borderColor: 'rgba(254,214,9,0.1)' }}>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Showing {pagedTickets.length} of {filteredTickets.length} tickets
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'rgba(254,214,9,0.2)', color: '#6B7280' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
                    style={
                      safePage === page
                        ? { backgroundColor: '#FED609', color: '#1A1A1A' }
                        : { border: '1px solid rgba(254,214,9,0.2)', color: '#6B7280', backgroundColor: 'transparent' }
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'rgba(254,214,9,0.2)', color: '#6B7280' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Reply Modal */}
      <Modal isOpen={modalType === 'reply'} onClose={closeModal} title="Reply to Tenant" size="md">
        {threadLoading ? (
          <LoadingState message="Loading ticket..." rows={3} />
        ) : threadError ? (
          <ErrorState message={threadError} />
        ) : thread ? (
          <div className="space-y-4">
            <div className="rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'rgba(254,214,9,0.1)', color: '#92700A' }}>
              #{thread.ticket.id.slice(0, 8).toUpperCase()} — {thread.ticket.subject}
            </div>
            <TicketReplyComposer
              title=""
              description="Replies are added to the permanent ticket history and shared with the tenant."
              value={replyMessage}
              onChange={setReplyMessage}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send Reply"
              placeholder="Write a clear next step, update, or resolution note."
            />
          </div>
        ) : null}
      </Modal>

      {/* Status Modal */}
      <Modal isOpen={modalType === 'status'} onClose={closeModal} title="Update Ticket Status" size="sm">
        {threadLoading ? (
          <LoadingState message="Loading ticket..." rows={2} />
        ) : threadError ? (
          <ErrorState message={threadError} />
        ) : thread ? (
          <div className="space-y-4">
            <div className="rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'rgba(254,214,9,0.1)', color: '#92700A' }}>
              #{thread.ticket.id.slice(0, 8).toUpperCase()} — {thread.ticket.subject}
            </div>
            <form onSubmit={(e) => void handleStatusSubmit(e)} className="space-y-3">
              <select
                value={statusValue}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusValue(e.target.value as TenantTicket['status'])}
                className="w-full border rounded-xl py-2.5 px-3 text-sm outline-none font-medium"
                style={{ backgroundColor: '#FEFAEF', borderColor: 'rgba(254,214,9,0.3)', color: '#1A1A1A' }}
              >
                {ownerTicketStatuses.map((s) => (
                  <option key={s} value={s}>{getStatusLabel(s)}</option>
                ))}
              </select>
              {statusValue === 'closed' ? (
                <textarea
                  value={closingMessage}
                  onChange={(e) => setClosingMessage(e.target.value)}
                  placeholder="Optional closing note visible to the tenant."
                  className="w-full border rounded-xl py-2.5 px-3 text-sm outline-none h-20 resize-none"
                  style={{ backgroundColor: '#FEFAEF', borderColor: 'rgba(254,214,9,0.3)', color: '#1A1A1A' }}
                />
              ) : null}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#FEFAEF]"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#6B7280' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusBusy}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#FED609', color: '#1A1A1A' }}
                >
                  {statusBusy ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>

      {/* View History Modal */}
      <Modal isOpen={modalType === 'view'} onClose={closeModal} title={thread ? `#${thread.ticket.id.slice(0, 8).toUpperCase()} — ${thread.ticket.subject}` : 'Ticket History'} size="md">
        {threadLoading ? (
          <LoadingState message="Loading conversation..." rows={3} />
        ) : threadError ? (
          <ErrorState message={threadError} />
        ) : thread ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {thread.messages.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: '#6B7280' }}>No messages yet.</p>
            ) : null}
            {thread.messages.map((message) => {
              const isOwner = message.sender_role === 'owner'
              const isTenant = message.sender_role === 'tenant'
              return (
                <div key={message.id} className={`flex flex-col gap-1 ${isOwner ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-semibold" style={{ color: '#1A1A1A' }}>
                      {message.sender_display_name}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={
                        isOwner
                          ? { backgroundColor: 'rgba(254,214,9,0.2)', color: '#92700A' }
                          : isTenant
                          ? { backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563EB' }
                          : { backgroundColor: 'rgba(0,0,0,0.06)', color: '#6B7280' }
                      }
                    >
                      {isOwner ? 'Owner' : isTenant ? 'Tenant' : 'System'}
                    </span>
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                      {formatDateTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      isOwner
                        ? { backgroundColor: '#FED609', color: '#1A1A1A', borderBottomRightRadius: '4px' }
                        : { backgroundColor: '#F3F4F6', color: '#1A1A1A', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {message.message}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

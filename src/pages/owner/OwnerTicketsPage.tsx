import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
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

const URGENT_KEYWORDS = [
  'flood', 'flooding', 'gas leak', 'no electricity', 'power cut',
  'burst pipe', 'fire', 'no water', 'break-in', 'security breach', 'emergency',
]

function isUrgent(ticket: TenantTicket): boolean {
  const text = `${ticket.subject} ${(ticket as { message?: string }).message ?? ''}`.toLowerCase()
  if (URGENT_KEYWORDS.some((kw) => text.includes(kw))) return true
  if (ticket.ai_category === 'maintenance' && (ticket.ai_confidence ?? 0) >= 0.85) return true
  return false
}

const TICKETS_PER_PAGE = 8

type FilterStatus = 'all' | TenantTicket['status']
type ModalType = 'reply' | 'view' | null

function getStatusBadgeClasses(status: TenantTicket['status']): string {
  switch (status) {
    case 'open':
      return 'bg-[#4E79FF]/15 text-[#4E79FF] border border-[#4E79FF]/30'
    case 'in_progress':
      return 'bg-[#4E79FF]/15 text-[#4E79FF] border border-[#4E79FF]/30'
    case 'resolved':
      return 'bg-[#32C382]/15 text-[#32C382] border border-[#32C382]/30'
    case 'closed':
      return 'bg-white/8 text-[#8D8D96] border border-[#272839]'
    default:
      return 'bg-white/8 text-[#8D8D96] border border-[#272839]'
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
  const [draftingReply, setDraftingReply] = useState(false)
  const [replyIsAiDraft, setReplyIsAiDraft] = useState(false)

  const [busyStatusIds, setBusyStatusIds] = useState<Set<string>>(new Set())

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
    setReplyIsAiDraft(false)
    setThreadError(null)
  }

  const handleDraftReply = async () => {
    if (!token || !thread) return
    try {
      setDraftingReply(true)
      const t = thread.ticket
      const updates = thread.messages
        .filter((m) => m.sender_role !== 'system')
        .map((m) => ({ timestamp: m.created_at, author: m.sender_display_name, message: m.message }))
      const result = await api.draftOwnerTicketReply(token, {
        ticket_id: t.id,
        subject: t.subject,
        message: (t as { message?: string }).message ?? t.subject,
        updates,
        tenant_name: (t as { tenants?: { full_name?: string } }).tenants?.full_name,
        property_name: (t as { tenants?: { properties?: { property_name?: string } } }).tenants?.properties?.property_name,
      })
      if (result.ok && result.draft) {
        setReplyMessage(result.draft.draft)
        setReplyIsAiDraft(true)
      }
    } catch {
      // silently fail — button disappears for unconfigured AI
    } finally {
      setDraftingReply(false)
    }
  }

  const closeModal = () => {
    setModalType(null)
    setThread(null)
    setActiveTicketId(null)
  }

  const handleReplySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleInlineStatusChange = useCallback(async (ticketId: string, newStatus: TenantTicket['status']) => {
    if (!token) return
    setBusyStatusIds((prev) => new Set(prev).add(ticketId))
    try {
      await api.updateOwnerTicket(token, ticketId, { status: newStatus })
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t))
    } catch {
      // silently ignore — list will stay unchanged
    } finally {
      setBusyStatusIds((prev) => { const next = new Set(prev); next.delete(ticketId); return next })
    }
  }, [token])

 
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
    return tickets
      .filter((t) => {
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus
        const matchesSearch =
          searchQuery.trim() === '' ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        const aUrg = isUrgent(a)
        const bUrg = isUrgent(b)
        if (aUrg && !bUrg) return -1
        if (!aUrg && bUrg) return 1
        return 0
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
    <div className="min-h-screen" style={{ backgroundColor: '#06070B', color: '#FFFFFF' }}>
      {/* Header */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: 'Sora, sans-serif', color: '#FFFFFF' }}>
              Support Tickets
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#8D8D96', fontFamily: 'Manrope, sans-serif' }}>
              Manage and track property maintenance and tenant inquiries.
            </p>
          </div>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#8D8D96' }} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="pl-10 pr-4 py-2.5 bg-[#101114] border rounded-xl outline-none w-full text-sm focus:ring-2"
            style={{ borderColor: 'rgba(78,121,255,0.2)', fontFamily: 'Manrope, sans-serif' }}
          />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
            <div className="bg-[#101114] p-6 rounded-xl shadow-sm border group hover:border-[rgba(78,121,255,0.3)] transition-all" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>Total Tickets</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#FFFFFF' }}>{statsTotal}</h3>
                <Ticket className="h-6 w-6 group-hover:scale-110 transition-transform" style={{ color: '#4E79FF' }} />
              </div>
            </div>
            <div className="bg-[#101114] p-6 rounded-xl shadow-sm border-l-4 hover:border-r hover:border-t hover:border-b hover:border-[rgba(78,121,255,0.3)] transition-all group" style={{ borderLeftColor: '#4E79FF' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>Open</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#4E79FF' }}>{statsOpen}</h3>
                <Circle className="h-6 w-6 group-hover:scale-110 transition-transform fill-current" style={{ color: '#4E79FF' }} />
              </div>
            </div>
            <div className="bg-[#101114] p-6 rounded-xl shadow-sm border group hover:border-[rgba(78,121,255,0.3)] transition-all" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>In Progress</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-[#4E79FF]" style={{ fontFamily: 'Sora, sans-serif' }}>{statsInProgress}</h3>
                <RefreshCw className="h-6 w-6 text-[#4E79FF] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="bg-[#101114] p-6 rounded-xl shadow-sm border group hover:border-[rgba(78,121,255,0.3)] transition-all" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>Resolved</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-[#32C382]" style={{ fontFamily: 'Sora, sans-serif' }}>{statsResolved}</h3>
                <CheckCircle className="h-6 w-6 text-[#32C382] group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterPills.map((pill) => {
              const isActive = filterStatus === pill.value
              return (
                <button
                  key={pill.value}
                  onClick={() => handleFilterChange(pill.value)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 font-['DM_Sans'] ${
                    isActive
                      ? 'bg-[#4E79FF] text-white shadow-md shadow-[#4E79FF]/20'
                      : 'bg-[#141519] border border-[#272839] text-[#8D8D96] hover:border-[#4E79FF]/40 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Mobile ticket cards */}
          <div className="md:hidden space-y-3">
            {pagedTickets.length === 0 ? (
              <p className="text-center text-sm py-8 text-[#8D8D96]">No tickets match your current filters.</p>
            ) : null}
            {pagedTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl bg-[#101114] border border-[#272839] p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white font-['Sora'] truncate">{ticket.subject}</p>
                    <p className="text-xs text-[#8D8D96] mt-0.5 font-['DM_Sans']">#{ticket.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-[#8D8D96] mt-0.5">{formatDateTime(ticket.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isUrgent(ticket) ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        <AlertTriangle className="h-2.5 w-2.5" /> URGENT
                      </span>
                    ) : null}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openModal('reply', ticket.id)}
                    className="flex items-center gap-1 rounded-lg border border-[#4E79FF]/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4E79FF]/10 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Reply
                  </button>
                  <select
                    value={ticket.status}
                    disabled={busyStatusIds.has(ticket.id)}
                    onChange={(e) => void handleInlineStatusChange(ticket.id, e.target.value as TenantTicket['status'])}
                    className="rounded-lg border border-[#272839] bg-[#141519] px-2 py-1.5 text-xs font-semibold text-[#8D8D96] outline-none disabled:opacity-50"
                  >
                    {ownerTicketStatuses.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => openModal('view', ticket.id)}
                    className="flex items-center gap-1 rounded-lg bg-[#2251E3] px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" /> History
                  </button>
                </div>
              </div>
            ))}
            {/* Mobile pagination */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[#8D8D96]">Showing {pagedTickets.length} of {filteredTickets.length} tickets</p>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#272839] text-[#8D8D96] disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#272839] text-[#8D8D96] disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Tickets Table */}
          <div className="hidden md:block bg-[#101114] rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid rgba(78,121,255,0.12)' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ backgroundColor: '#141519', borderColor: 'rgba(78,121,255,0.2)' }}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif' }}>Ticket ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif' }}>Subject</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif' }}>Tenant / Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif' }}>Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#8D8D96' }}>
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
                        backgroundColor: isEven ? '#141519' : '#101114',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <td className="px-6 py-4 text-sm" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>
                        #{ticket.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm" style={{ color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}>
                            {ticket.subject}
                          </span>
                          {isUrgent(ticket) ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                              <AlertTriangle className="h-2.5 w-2.5" /> URGENT
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}>Tenant</div>
                        <div className="text-xs" style={{ color: '#8D8D96' }}>{formatDateTime(ticket.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={ticket.status}
                          disabled={busyStatusIds.has(ticket.id)}
                          onChange={(e) => void handleInlineStatusChange(ticket.id, e.target.value as TenantTicket['status'])}
                          className="rounded-lg border border-[#272839] bg-[#141519] px-2.5 py-1.5 text-xs font-semibold text-white outline-none disabled:opacity-50 cursor-pointer"
                        >
                          {ownerTicketStatuses.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openModal('reply', ticket.id)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#141519]"
                            style={{ color: '#FFFFFF', border: '1px solid rgba(78,121,255,0.3)' }}
                            title="Reply to tenant"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal('view', ticket.id)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{ backgroundColor: '#2251E3', color: '#FFFFFF' }}
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
            <div className="px-6 py-4 bg-[#101114] border-t flex items-center justify-between" style={{ borderColor: 'rgba(78,121,255,0.12)' }}>
              <p className="text-xs" style={{ color: '#8D8D96' }}>
                Showing {pagedTickets.length} of {filteredTickets.length} tickets
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
                  style={{ borderColor: '#272839', color: '#8D8D96' }}
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
                        ? { backgroundColor: '#4E79FF', color: '#FFFFFF' }
                        : { border: '1px solid rgba(78,121,255,0.2)', color: '#8D8D96', backgroundColor: 'transparent' }
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
                  style={{ borderColor: '#272839', color: '#8D8D96' }}
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
            <div className="rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'rgba(78,121,255,0.12)', color: '#4E79FF' }}>
              #{thread.ticket.id.slice(0, 8).toUpperCase()} — {thread.ticket.subject}
            </div>
            <button
              type="button"
              onClick={() => void handleDraftReply()}
              disabled={draftingReply}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 w-full justify-center"
              style={{ backgroundColor: 'rgba(78,121,255,0.12)', color: '#4E79FF', border: '1px solid rgba(78,121,255,0.3)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {draftingReply ? 'Drafting…' : '✦ Draft with AI'}
            </button>
            <TicketReplyComposer
              title=""
              description="Replies are added to the permanent ticket history and shared with the tenant."
              value={replyMessage}
              onChange={(v) => { setReplyMessage(v); setReplyIsAiDraft(false) }}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send Reply"
              placeholder="Write a clear next step, update, or resolution note."
            />
            {replyIsAiDraft ? (
              <p className="text-[11px] text-center" style={{ color: '#8D8D96' }}>
                AI draft — review before sending
              </p>
            ) : null}
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
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {thread.messages.filter((m) => m.sender_role !== 'system').length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: '#8D8D96' }}>No messages yet.</p>
            ) : null}
            {thread.messages.filter((m) => m.sender_role !== 'system').map((message) => {
              const isOwner = message.sender_role === 'owner'
              const isTenant = message.sender_role === 'tenant'
              return (
                <div key={message.id} className={`flex flex-col gap-1.5 ${isOwner ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 px-1 ${isOwner ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[11px] font-bold" style={{ color: '#FFFFFF' }}>
                      {message.sender_display_name}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={
                        isOwner
                          ? { backgroundColor: 'rgba(78,121,255,0.2)', color: '#4E79FF' }
                          : isTenant
                          ? { backgroundColor: 'rgba(50,195,130,0.15)', color: '#32C382' }
                          : { backgroundColor: 'rgba(141,141,150,0.15)', color: '#8D8D96' }
                      }
                    >
                      {isOwner ? 'Owner' : isTenant ? 'Tenant' : 'System'}
                    </span>
                    <span className="text-[10px]" style={{ color: '#8D8D96' }}>
                      {formatDateTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-['Manrope']"
                    style={
                      isOwner
                        ? { backgroundColor: '#4E79FF', color: '#FFFFFF', borderBottomRightRadius: '4px' }
                        : { backgroundColor: '#1C1E27', color: '#E5E7EB', border: '1px solid #272839', borderBottomLeftRadius: '4px' }
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


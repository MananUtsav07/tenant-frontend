import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  ArrowUpRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  TicketX,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { TicketThreadTimeline } from '../../components/tickets/TicketThreadTimeline'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const ownerTicketStatuses: TenantTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']

const TICKETS_PER_PAGE = 8

type FilterStatus = 'all' | TenantTicket['status']


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
    case 'open':
      return 'Open'
    case 'in_progress':
      return 'In Progress'
    case 'resolved':
      return 'Resolved'
    case 'closed':
      return 'Closed'
    default:
      return status
  }
}

export function OwnerTicketsPage() {
  const { token } = useOwnerAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTicketParam = searchParams.get('ticket')

  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(selectedTicketParam)

  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)

  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)

  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)

  const [statusValue, setStatusValue] = useState<TenantTicket['status']>('open')
  const [closingMessage, setClosingMessage] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  // UI state
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

  useEffect(() => {
    if (tickets.length === 0) {
      setSelectedTicketId(null)
      setThread(null)
      return
    }
    if (selectedTicketParam && tickets.some((t) => t.id === selectedTicketParam)) {
      if (selectedTicketId !== selectedTicketParam) setSelectedTicketId(selectedTicketParam)
      return
    }
    if (!selectedTicketId || !tickets.some((t) => t.id === selectedTicketId)) {
      const nextId = tickets[0].id
      setSelectedTicketId(nextId)
      setSearchParams({ ticket: nextId }, { replace: true })
    }
  }, [selectedTicketId, selectedTicketParam, setSearchParams, tickets])

  const loadThread = useCallback(
    async (ticketId: string) => {
      if (!token) return
      try {
        setThreadLoading(true)
        setThreadError(null)
        setAiSummary(null)
        const response = await api.getOwnerTicketDetail(token, ticketId)
        setThread(response.thread)
        setStatusValue(response.thread.ticket.status)
        setClosingMessage('')
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket conversation')
      } finally {
        setThreadLoading(false)
      }
    },
    [token],
  )

  const handleAiSummarize = async () => {
    if (!token || !thread) return
    try {
      setAiSummaryLoading(true)
      const updates = thread.messages
        .filter((m) => m.message_type !== 'initial_message')
        .map((m) => ({ timestamp: m.created_at, author: m.sender_display_name, message: m.message }))
      const response = await api.summarizeOwnerTicket(token, {
        ticket_id: thread.ticket.id,
        subject: thread.ticket.subject,
        message: thread.ticket.message,
        updates,
      })
      if (response.ok && response.summary) {
        setAiSummary(response.summary.summary)
      }
    } catch {
      // Non-critical — silently fail
    } finally {
      setAiSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedTicketId) return
    void loadThread(selectedTicketId)
  }, [selectedTicketId, loadThread])

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) return
    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyOwnerTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
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
    } catch (statusError) {
      setThreadError(statusError instanceof Error ? statusError.message : 'Failed to update ticket status')
    } finally {
      setStatusBusy(false)
    }
  }

  const ticketSummary = useMemo(() => {
    if (!thread) return null
    const tenant = thread.ticket.tenants
    const property = tenant?.properties
    return {
      tenantLabel: tenant ? `${tenant.full_name} (${tenant.tenant_access_id})` : 'Tenant unavailable',
      tenantName: tenant?.full_name ?? 'Unknown Tenant',
      propertyLabel: property?.property_name ?? 'Property unavailable',
      unitLabel: property?.unit_number ?? '-',
    }
  }, [thread])

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setSearchParams({ ticket: ticketId })
  }

  // Derived stats
  const statsTotal = tickets.length
  const statsOpen = tickets.filter((t) => t.status === 'open').length
  const statsInProgress = tickets.filter((t) => t.status === 'in_progress').length
  const statsResolved = tickets.filter((t) => t.status === 'resolved').length

  // Filtered + paginated tickets
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
          <h1
            className="font-bold text-3xl tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}
          >
            Support Tickets
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280', fontFamily: 'Manrope, sans-serif' }}>
            Manage and track property maintenance and tenant inquiries.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: '#6B7280' }}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none w-64 text-sm focus:ring-2"
              style={{
                borderColor: 'rgba(254,214,9,0.2)',
                fontFamily: 'Manrope, sans-serif',
              }}
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-semibold transition-colors hover:bg-[#FFFAE2]"
            style={{ borderColor: 'rgba(254,214,9,0.2)', color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
          >
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </header>

      {/* Error */}
      {error ? <ErrorState message={error} /> : null}

      {/* Loading */}
      {loading ? <LoadingState message="Loading owner tickets..." rows={5} /> : null}

      {/* Empty */}
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* Total */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all"
              style={{ borderColor: 'rgba(254,214,9,0.05)' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
              >
                Total Tickets
              </p>
              <div className="flex items-end justify-between">
                <h3
                  className="text-3xl font-bold"
                  style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}
                >
                  {statsTotal}
                </h3>
                <Ticket
                  className="h-6 w-6 group-hover:scale-110 transition-transform"
                  style={{ color: '#FED609' }}
                />
              </div>
            </div>

            {/* Open */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:border-r hover:border-t hover:border-b hover:border-[rgba(254,214,9,0.3)] transition-all group"
              style={{ borderLeftColor: '#FED609' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
              >
                Open
              </p>
              <div className="flex items-end justify-between">
                <h3
                  className="text-3xl font-bold"
                  style={{ fontFamily: 'Sora, sans-serif', color: '#FED609' }}
                >
                  {statsOpen}
                </h3>
                <Circle
                  className="h-6 w-6 group-hover:scale-110 transition-transform fill-current"
                  style={{ color: '#FED609' }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all"
              style={{ borderColor: 'rgba(254,214,9,0.05)' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
              >
                In Progress
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-blue-500" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {statsInProgress}
                </h3>
                <RefreshCw className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            {/* Resolved */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border group hover:border-[rgba(254,214,9,0.3)] transition-all"
              style={{ borderColor: 'rgba(254,214,9,0.05)' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
              >
                Resolved
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-green-500" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {statsResolved}
                </h3>
                <CheckCircle className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Main layout: table + detail panel */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tickets List */}
            <div className="flex-grow space-y-6 min-w-0">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
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
                          : {
                              backgroundColor: '#ffffff',
                              border: '1px solid rgba(254,214,9,0.2)',
                              color: '#6B7280',
                            }
                      }
                    >
                      {pill.label}
                    </button>
                  )
                })}
              </div>

              {/* Tickets Table */}
              <div
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                style={{ border: '1px solid rgba(254,214,9,0.1)' }}
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ backgroundColor: '#FFFAE2', borderColor: 'rgba(254,214,9,0.2)' }}
                    >
                      <th
                        className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Ticket ID
                      </th>
                      <th
                        className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Subject
                      </th>
                      <th
                        className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Tenant / Property
                      </th>
                      <th
                        className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center"
                        style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Status
                      </th>
                      <th
                        className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right"
                        style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ borderColor: 'rgba(254,214,9,0.05)' }}>
                    {pagedTickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#6B7280' }}>
                          No tickets match your current filters.
                        </td>
                      </tr>
                    ) : null}
                    {pagedTickets.map((ticket, index) => {
                      const isSelected = selectedTicketId === ticket.id
                      const isEven = index % 2 === 1

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket.id)}
                          className="transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(254,214,9,0.04)'
                              : isEven
                              ? '#FEFAEF'
                              : '#ffffff',
                            borderLeft: isSelected ? '4px solid #FED609' : '4px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                'rgba(255,250,226,0.5)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.backgroundColor = isEven
                                ? '#FEFAEF'
                                : '#ffffff'
                          }}
                        >
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            #{ticket.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="font-medium text-sm"
                              style={{ color: '#1A1A1A', fontFamily: 'Manrope, sans-serif' }}
                            >
                              {ticket.subject}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="text-sm font-medium"
                              style={{ color: '#1A1A1A', fontFamily: 'Manrope, sans-serif' }}
                            >
                              Tenant
                            </div>
                            <div className="text-xs" style={{ color: '#6B7280' }}>
                              {formatDateTime(ticket.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(ticket.status)}`}
                            >
                              {getStatusLabel(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#FED609' }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLElement).style.backgroundColor =
                                  'rgba(254,214,9,0.1)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectTicket(ticket.id)
                              }}
                              aria-label="View ticket"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div
                  className="px-6 py-4 bg-white border-t flex items-center justify-between"
                  style={{ borderColor: 'rgba(254,214,9,0.1)' }}
                >
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
                            : {
                                border: '1px solid rgba(254,214,9,0.2)',
                                color: '#6B7280',
                                backgroundColor: 'transparent',
                              }
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
            </div>

            {/* Ticket Detail Side Panel */}
            <aside className="w-full lg:w-96 shrink-0">
              {threadError ? <ErrorState message={threadError} /> : null}
              {threadLoading ? <LoadingState message="Loading ticket thread..." rows={4} /> : null}

              {!threadLoading && thread ? (
                <div
                  className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8"
                  style={{ border: '1px solid rgba(254,214,9,0.2)' }}
                >
                  {/* Detail Header */}
                  <div
                    className="p-6 border-b"
                    style={{ backgroundColor: '#FFFAE2', borderColor: 'rgba(254,214,9,0.2)' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className="px-2 py-1 rounded-md text-[10px] font-bold"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(254,214,9,0.3)',
                          color: '#1A1A1A',
                        }}
                      >
                        TICKET #{thread.ticket.id.slice(0, 8).toUpperCase()}
                      </span>
                      <button
                        className="p-1 rounded-full transition-colors"
                        onClick={() => {
                          setSelectedTicketId(null)
                          setThread(null)
                        }}
                        style={{ color: '#6B7280' }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(254,214,9,0.2)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <h2
                      className="font-bold text-xl leading-tight"
                      style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A' }}
                    >
                      {thread.ticket.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <StatusBadge status={thread.ticket.status} />
                      <Button
                        to={`${ROUTES.ownerMaintenance}?ticket=${thread.ticket.id}`}
                        variant="outline"
                        size="sm"
                        iconRight={<ArrowUpRight className="h-3 w-3" />}
                      >
                        Maintenance
                      </Button>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  <div
                    className="p-6 border-b"
                    style={{
                      backgroundColor: 'rgba(254,214,9,0.05)',
                      borderColor: 'rgba(254,214,9,0.1)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" style={{ color: '#FED609' }} />
                        <h3
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          AI Summary
                        </h3>
                      </div>
                      {!aiSummary && (
                        <button
                          type="button"
                          onClick={() => void handleAiSummarize()}
                          disabled={aiSummaryLoading}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#FED609', color: '#1A1A1A' }}
                        >
                          <Sparkles className="h-3 w-3" />
                          {aiSummaryLoading ? 'Generating...' : 'Summarize'}
                        </button>
                      )}
                    </div>
                    {thread.ticket.ai_category && (
                      <div className="mb-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: 'rgba(254,214,9,0.2)', color: '#92700A', border: '1px solid rgba(254,214,9,0.4)' }}
                        >
                          {thread.ticket.ai_category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    {aiSummaryLoading && (
                      <p className="text-xs italic" style={{ color: '#6B7280' }}>Generating summary...</p>
                    )}
                    {aiSummary && (
                      <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>{aiSummary}</p>
                    )}
                    {!aiSummaryLoading && !aiSummary && (
                      <p className="text-xs italic" style={{ color: '#6B7280' }}>
                        Click Summarize to get an AI overview of this ticket thread.
                      </p>
                    )}
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 space-y-6 max-h-[520px] overflow-y-auto">
                    {/* Tenant Info */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border-2 text-sm font-bold shrink-0"
                        style={{
                          backgroundColor: 'rgba(254,214,9,0.15)',
                          borderColor: 'rgba(254,214,9,0.3)',
                          color: '#1A1A1A',
                        }}
                      >
                        {ticketSummary?.tenantName.charAt(0).toUpperCase() ?? 'T'}
                      </div>
                      <div>
                        <h4
                          className="text-sm font-bold"
                          style={{ color: '#1A1A1A', fontFamily: 'Manrope, sans-serif' }}
                        >
                          {ticketSummary?.tenantLabel}
                        </h4>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {ticketSummary?.propertyLabel}
                          {ticketSummary?.unitLabel !== '-'
                            ? ` · Unit ${ticketSummary?.unitLabel}`
                            : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-bold">
                            Verified Tenant
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4
                        className="text-xs font-bold uppercase tracking-wider mb-4"
                        style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Status Timeline
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-2.5 h-2.5 rounded-full ring-4"
                              style={{
                                backgroundColor: '#FED609',
                              }}
                            />
                            <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: 'rgba(254,214,9,0.2)' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                              Ticket Created
                            </p>
                            <p className="text-[10px]" style={{ color: '#6B7280' }}>
                              {formatDateTime(thread.ticket.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FED609' }} />
                            <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: 'rgba(254,214,9,0.2)' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                              AI Classified &amp; Assigned
                            </p>
                            <p className="text-[10px]" style={{ color: '#6B7280' }}>
                              {formatDateTime(thread.ticket.updated_at)}
                            </p>
                          </div>
                        </div>
                        {thread.ticket.status !== 'resolved' && thread.ticket.status !== 'closed' ? (
                          <div className="flex gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium italic" style={{ color: '#6B7280' }}>
                              Awaiting resolution...
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-green-600">
                              {thread.ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conversation Thread */}
                    <div>
                      <h4
                        className="text-xs font-bold uppercase tracking-wider mb-4"
                        style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Conversation
                      </h4>
                      <TicketThreadTimeline messages={thread.messages} />
                    </div>

                    {/* Quick Update Form */}
                    {thread.ticket.status !== 'closed' ? (
                      <div className="pt-4 border-t" style={{ borderColor: 'rgba(254,214,9,0.1)' }}>
                        <h4
                          className="text-xs font-bold uppercase tracking-wider mb-3"
                          style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          Update Ticket
                        </h4>

                        <form onSubmit={handleStatusSubmit} className="space-y-3">
                          <select
                            value={statusValue}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              setStatusValue(e.target.value as TenantTicket['status'])
                            }
                            className="w-full border rounded-lg py-2 px-3 text-xs outline-none font-medium"
                            style={{
                              backgroundColor: '#FEFAEF',
                              borderColor: 'rgba(254,214,9,0.2)',
                              color: '#1A1A1A',
                            }}
                          >
                            {ownerTicketStatuses.map((s) => (
                              <option key={s} value={s}>
                                {getStatusLabel(s)}
                              </option>
                            ))}
                          </select>

                          {statusValue === 'closed' ? (
                            <textarea
                              value={closingMessage}
                              onChange={(e) => setClosingMessage(e.target.value)}
                              placeholder="Optional closing note visible to the tenant."
                              className="w-full border rounded-lg py-2 px-3 text-xs outline-none h-20 resize-none"
                              style={{
                                backgroundColor: '#FEFAEF',
                                borderColor: 'rgba(254,214,9,0.2)',
                                color: '#1A1A1A',
                              }}
                            />
                          ) : null}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={statusBusy}
                              className="flex-1 font-bold py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
                              style={{ backgroundColor: '#FED609', color: '#1A1A1A' }}
                            >
                              {statusBusy ? 'Saving...' : 'Update Ticket'}
                            </button>
                          </div>
                        </form>

                        {/* Reply form */}
                        <div className="mt-6">
                          <TicketReplyComposer
                            title="Reply to tenant"
                            description="Replies are added to the permanent ticket history and shared with the tenant."
                            value={replyMessage}
                            onChange={setReplyMessage}
                            onSubmit={handleReplySubmit}
                            busy={replyBusy}
                            submitLabel="Send reply"
                            placeholder="Write a clear next step, update, or resolution note."
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="pt-4 border-t rounded-lg p-4"
                        style={{
                          borderColor: 'rgba(254,214,9,0.1)',
                          backgroundColor: 'rgba(254,214,9,0.03)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4" style={{ color: '#6B7280' }} />
                          <h4
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            Ticket is Closed
                          </h4>
                        </div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          This ticket is closed. Reopen it by updating the status above if you need to
                          continue the thread.
                        </p>
                        <form onSubmit={handleStatusSubmit} className="mt-3">
                          <select
                            value={statusValue}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              setStatusValue(e.target.value as TenantTicket['status'])
                            }
                            className="w-full border rounded-lg py-2 px-3 text-xs outline-none font-medium mb-2"
                            style={{
                              backgroundColor: '#FEFAEF',
                              borderColor: 'rgba(254,214,9,0.2)',
                              color: '#1A1A1A',
                            }}
                          >
                            {ownerTicketStatuses.map((s) => (
                              <option key={s} value={s}>
                                {getStatusLabel(s)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={statusBusy}
                            className="w-full font-bold py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
                            style={{ backgroundColor: '#FED609', color: '#1A1A1A' }}
                          >
                            {statusBusy ? 'Saving...' : 'Reopen / Update Status'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Placeholder when no ticket selected */}
              {!threadLoading && !thread && !threadError ? (
                <div
                  className="bg-white rounded-xl shadow-sm p-8 text-center"
                  style={{ border: '1px solid rgba(254,214,9,0.1)' }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(254,214,9,0.1)' }}
                  >
                    <MessageSquare className="h-7 w-7" style={{ color: '#FED609' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    Select a ticket to view details
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    Click any row in the table to open the thread.
                  </p>
                </div>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </div>
  )
}

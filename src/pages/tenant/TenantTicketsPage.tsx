import {
  CalendarDays,
  ChevronRight,
  Filter,
  Plus,
  Search,
  TicketX,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { MaintenanceWorkflowTenantPanel } from '../../components/tickets/MaintenanceWorkflowTenantPanel'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { TicketThreadTimeline } from '../../components/tickets/TicketThreadTimeline'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDate, formatDateTime } from '../../utils/date'

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
type SortOption = 'newest' | 'oldest'

type Priority = 'low' | 'medium' | 'high'

function statusBadge(status: TenantTicket['status']) {
  switch (status) {
    case 'open':
      return (
        <span className="rounded-full border border-[#FED609]/30 bg-[#FED609]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">
          Open
        </span>
      )
    case 'in_progress':
      return (
        <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          In Progress
        </span>
      )
    case 'resolved':
      return (
        <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
          Resolved
        </span>
      )
    case 'closed':
      return (
        <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
          Closed
        </span>
      )
  }
}

function ticketRowOpacity(status: TenantTicket['status']): string {
  if (status === 'closed') return 'opacity-60'
  if (status === 'resolved') return 'opacity-80'
  return ''
}

export function TenantTicketsPage() {
  const { token } = useTenantAuth()

  // List state
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter / sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [search, setSearch] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<Priority>('low')
  const [busy, setBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Thread state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)

  const loadTickets = useCallback(async () => {
    if (!token) return
    try {
      setError(null)
      const response = await api.getTenantTickets(token)
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
    if (!selectedTicketId || !tickets.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  const loadThread = useCallback(
    async (ticketId: string) => {
      if (!token) return
      try {
        setThreadLoading(true)
        setThreadError(null)
        const response = await api.getTenantTicketDetail(token, ticketId)
        setThread(response.thread)
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket conversation')
      } finally {
        setThreadLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!selectedTicketId) return
    void loadThread(selectedTicketId)
  }, [selectedTicketId, loadThread])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    try {
      setBusy(true)
      setCreateError(null)
      const response = await api.createTenantTicket(token, { subject, message })
      setSubject('')
      setMessage('')
      setPriority('low')
      setShowModal(false)
      await loadTickets()
      setSelectedTicketId(response.ticket.id)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Failed to create ticket')
    } finally {
      setBusy(false)
    }
  }

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) return
    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyTenantTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
    } catch (replyError) {
      setThreadError(replyError instanceof Error ? replyError.message : 'Failed to send reply')
    } finally {
      setReplyBusy(false)
    }
  }

  const canReply = thread?.ticket.status !== 'closed'

  const ticketMeta = useMemo(() => {
    if (!thread) return null
    return {
      openedAt: formatDateTime(thread.ticket.created_at),
      status: thread.ticket.status,
    }
  }, [thread])

  const filteredTickets = useMemo(() => {
    let list = [...tickets]
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.subject.toLowerCase().includes(q) || t.message.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sort === 'newest' ? db - da : da - db
    })
    return list
  }, [tickets, statusFilter, search, sort])

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
  ]

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[#6B7280] font-['DM_Sans']">Track and manage your property requests</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FED609] px-6 py-3 font-['DM_Sans'] font-bold text-[#1A1A1A] shadow-lg shadow-[#FED609]/20 transition-all hover:bg-[#FFD70B] active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Create New Ticket
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-2 shadow-sm md:flex-row md:items-center">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto rounded-xl bg-[#FEFAEF] p-1 w-full md:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#FED609] font-bold text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs md:ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-none bg-[#FEFAEF] py-2 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#FED609]"
          />
        </div>

        {/* Sort */}
        <div className="relative md:w-52">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="w-full appearance-none rounded-xl border-none bg-[#FEFAEF] py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#FED609]"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="oldest">Sort by: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error / Loading */}
      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading ticket history..." rows={4} /> : null}

      {/* Empty state */}
      {!loading && filteredTickets.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-16 shadow-sm border border-[rgba(0,0,0,0.06)]">
          <TicketX className="h-10 w-10 text-[#6B7280]" />
          <div className="text-center">
            <p className="font-bold text-[#1A1A1A] font-['Sora']">No tickets found</p>
            <p className="mt-1 text-sm text-[#6B7280] font-['Manrope']">
              {statusFilter !== 'all' ? 'Try a different filter or create a new ticket.' : 'Submit your first support ticket.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#FED609] px-5 py-2.5 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-[#FFD70B] active:scale-95 font-['DM_Sans']"
          >
            <Plus className="h-4 w-4" />
            Create New Ticket
          </button>
        </div>
      ) : null}

      {/* Ticket List */}
      {!loading && filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTicketId(ticket.id) }}
              className={`group flex cursor-pointer flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/30 md:flex-row md:items-center ${
                selectedTicketId === ticket.id ? 'border-[#FED609]/40 ring-1 ring-[#FED609]/20' : 'border-transparent'
              } ${ticketRowOpacity(ticket.status)}`}
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  {statusBadge(ticket.status)}
                  <span className="text-xs font-medium text-[#6B7280] font-['DM_Sans']">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h3 className="mb-1 font-['Sora'] text-lg font-bold transition-colors group-hover:text-[#FED609]">
                  {ticket.subject}
                </h3>
                <p className="line-clamp-1 text-sm text-[#6B7280] font-['Manrope']">{ticket.message}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-[#FEFAEF] pt-4 text-sm md:flex-nowrap md:border-t-0 md:pt-0">
                <div className="flex items-center gap-2 rounded-lg bg-[#FEFAEF] px-3 py-1.5">
                  <CalendarDays className="h-4 w-4 text-[#FED609]" />
                  <span className="whitespace-nowrap font-medium font-['Manrope']">{formatDate(ticket.created_at)}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedTicketId(ticket.id) }}
                  className="rounded-lg p-2 transition-colors hover:bg-[#FEFAEF]"
                  aria-label="View ticket"
                >
                  <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Thread section */}
      {threadError ? <ErrorState message={threadError} /> : null}
      {threadLoading ? <LoadingState message="Loading ticket thread..." rows={4} /> : null}

      {!threadLoading && thread ? (
        <div className="space-y-4">
          {/* Thread header */}
          <div className="rounded-2xl bg-[#1A1A1A] p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#FED609]/70 font-['DM_Sans']">Selected Ticket</p>
                <h3 className="mt-3 font-['Sora'] text-2xl font-semibold text-white">{thread.ticket.subject}</h3>
                <p className="mt-2 text-sm text-white/60 font-['Manrope']">Opened: {ticketMeta?.openedAt}</p>
              </div>
              <span className="mt-1">
                {thread.ticket.status === 'open' ? (
                  <span className="rounded-full border border-[#FED609]/30 bg-[#FED609]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FED609]">Open</span>
                ) : thread.ticket.status === 'in_progress' ? (
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">In Progress</span>
                ) : thread.ticket.status === 'resolved' ? (
                  <span className="rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300">Resolved</span>
                ) : (
                  <span className="rounded-full border border-gray-600 bg-gray-700/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Closed</span>
                )}
              </span>
            </div>
          </div>

          {/* Conversation */}
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-7 border border-[rgba(0,0,0,0.06)]">
            <h3 className="font-['Sora'] text-xl font-semibold text-[#1A1A1A]">Conversation</h3>
            <p className="mt-1 text-sm text-[#6B7280] font-['Manrope']">
              The original ticket, owner replies, and closing notes all appear here in order.
            </p>
            <div className="mt-4">
              <TicketThreadTimeline messages={thread.messages} />
            </div>
          </div>

          {/* Maintenance workflow */}
          {token ? (
            <MaintenanceWorkflowTenantPanel
              token={token}
              ticketId={thread.ticket.id}
              onWorkflowChanged={async () => {
                await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
              }}
            />
          ) : null}

          {/* Reply or Closed notice */}
          {canReply ? (
            <TicketReplyComposer
              title="Reply to this ticket"
              description="Your reply is added to the permanent support history and sent to the property team."
              value={replyMessage}
              onChange={setReplyMessage}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send reply"
              placeholder="Add any update, clarification, or follow-up detail."
            />
          ) : (
            <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
              <h3 className="font-['Sora'] text-lg font-semibold text-[#1A1A1A]">Ticket closed</h3>
              <p className="mt-2 text-sm text-[#6B7280] font-['Manrope']">
                This ticket is closed. Review the thread above for the final owner response or closing note.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Create Ticket Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Create Support Ticket"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#FEFAEF] p-6">
              <h2 className="font-['Sora'] text-xl font-bold text-[#1A1A1A]">Create Support Ticket</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 transition-colors hover:bg-[#FEFAEF]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {createError ? (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 font-['Manrope']">{createError}</p>
              ) : null}

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-['DM_Sans'] font-bold text-[#1A1A1A]">Subject Title</label>
                <input
                  type="text"
                  placeholder="Briefly describe the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full rounded-xl border-none bg-[#FEFAEF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FED609] font-['Manrope']"
                />
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <label className="block text-sm font-['DM_Sans'] font-bold text-[#1A1A1A]">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-medium capitalize transition-all font-['DM_Sans'] ${
                        priority === p
                          ? 'border-2 border-[#FED609] bg-[#FED609]/10 text-[#1A1A1A] font-bold'
                          : 'border-2 border-transparent bg-[#FEFAEF] text-[#6B7280]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-['DM_Sans'] font-bold text-[#1A1A1A]">Description</label>
                <textarea
                  placeholder="Provide detailed information about your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border-none bg-[#FEFAEF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FED609] font-['Manrope']"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[rgba(0,0,0,0.08)] px-6 py-3 font-['DM_Sans'] font-bold text-[#6B7280] transition-colors hover:bg-[#FEFAEF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-xl bg-[#FED609] px-6 py-3 font-['DM_Sans'] font-bold text-[#1A1A1A] shadow-lg shadow-[#FED609]/20 transition-all hover:bg-[#FFD70B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

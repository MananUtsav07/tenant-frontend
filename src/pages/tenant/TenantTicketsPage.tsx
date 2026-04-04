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
        <span className="rounded-full border border-[#4E79FF]/30 bg-[#4E79FF]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4E79FF]">
          Open
        </span>
      )
    case 'in_progress':
      return (
        <span className="rounded-full border border-[#EBCF42]/30 bg-[#EBCF42]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EBCF42]">
          In Progress
        </span>
      )
    case 'resolved':
      return (
        <span className="rounded-full border border-[#32C382]/30 bg-[#32C382]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#32C382]">
          Resolved
        </span>
      )
    case 'closed':
      return (
        <span className="rounded-full border border-[#272839] bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8D8D96]">
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

  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<Priority>('low')
  const [busy, setBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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

  useEffect(() => { void loadTickets() }, [loadTickets])

  useEffect(() => {
    if (tickets.length === 0) { setSelectedTicketId(null); setThread(null); return }
    if (!selectedTicketId || !tickets.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  const loadThread = useCallback(async (ticketId: string) => {
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
  }, [token])

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
      setSubject(''); setMessage(''); setPriority('low'); setShowModal(false)
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
    return { openedAt: formatDateTime(thread.ticket.created_at), status: thread.ticket.status }
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
    <div className="space-y-6 p-6 w-full bg-[#06070B] min-h-screen text-white">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-[#8D8D96] font-['DM_Sans']">Track and manage your property requests</p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E79FF] px-6 py-3 font-['DM_Sans'] font-bold text-white shadow-lg shadow-[#4E79FF]/20 transition-all hover:bg-[#3E68EE] active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Create New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl bg-[#101114] p-2 border border-[#272839] md:flex-row md:items-center">
        <div className="flex overflow-x-auto rounded-xl bg-[#06070B] p-1 w-full md:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#4E79FF] font-bold text-white shadow-sm'
                  : 'text-[#8D8D96] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs md:ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8D96]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#272839] bg-[#06070B] py-2 pl-10 pr-4 text-sm text-white placeholder-[#8D8D96] outline-none focus:ring-2 focus:ring-[#4E79FF]"
          />
        </div>

        <div className="relative md:w-52">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8D96]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="w-full appearance-none rounded-xl border border-[#272839] bg-[#06070B] py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-[#4E79FF]"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="oldest">Sort by: Oldest First</option>
          </select>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading ticket history..." rows={4} /> : null}

      {/* Empty state */}
      {!loading && filteredTickets.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#101114] py-16 border border-[#272839]">
          <TicketX className="h-10 w-10 text-[#8D8D96]" />
          <div className="text-center">
            <p className="font-bold text-white font-['Sora']">No tickets found</p>
            <p className="mt-1 text-sm text-[#8D8D96] font-['Manrope']">
              {statusFilter !== 'all' ? 'Try a different filter or create a new ticket.' : 'Submit your first support ticket.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#4E79FF] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#3E68EE] active:scale-95 font-['DM_Sans']"
          >
            <Plus className="h-4 w-4" />
            Create New Ticket
          </button>
        </div>
      ) : null}

      {/* Ticket List */}
      {!loading && filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTicketId(ticket.id) }}
              className={`group flex cursor-pointer flex-col gap-4 rounded-2xl border bg-[#101114] p-5 transition-all hover:border-[#4E79FF]/40 md:flex-row md:items-center ${
                selectedTicketId === ticket.id ? 'border-[#4E79FF]/50 ring-1 ring-[#4E79FF]/20' : 'border-[#272839]'
              } ${ticketRowOpacity(ticket.status)}`}
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  {statusBadge(ticket.status)}
                  <span className="text-xs font-medium text-[#8D8D96] font-['DM_Sans']">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h3 className="mb-1 font-['Sora'] text-base font-bold text-white transition-colors group-hover:text-[#4E79FF]">
                  {ticket.subject}
                </h3>
                <p className="line-clamp-1 text-sm text-[#8D8D96] font-['Manrope']">{ticket.message}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[#272839] pt-3 text-sm md:flex-nowrap md:border-t-0 md:pt-0">
                <div className="flex items-center gap-2 rounded-lg bg-[#141519] px-3 py-1.5">
                  <CalendarDays className="h-4 w-4 text-[#4E79FF]" />
                  <span className="whitespace-nowrap font-medium text-[#8D8D96] font-['Manrope']">{formatDate(ticket.created_at)}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedTicketId(ticket.id) }}
                  className="rounded-lg p-2 transition-colors hover:bg-[#141519]"
                  aria-label="View ticket"
                >
                  <ChevronRight className="h-5 w-5 text-[#8D8D96]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {threadError ? <ErrorState message={threadError} /> : null}
      {threadLoading ? <LoadingState message="Loading ticket thread..." rows={4} /> : null}

      {!threadLoading && thread ? (
        <div className="space-y-4">
          {/* Thread header */}
          <div className="rounded-2xl bg-[#101114] border border-[#272839] p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4E79FF]/70 font-['DM_Sans']">Selected Ticket</p>
                <h3 className="mt-3 font-['Sora'] text-2xl font-semibold text-white">{thread.ticket.subject}</h3>
                <p className="mt-2 text-sm text-[#8D8D96] font-['Manrope']">Opened: {ticketMeta?.openedAt}</p>
              </div>
              <span className="mt-1">
                {thread.ticket.status === 'open' ? (
                  <span className="rounded-full border border-[#4E79FF]/30 bg-[#4E79FF]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4E79FF]">Open</span>
                ) : thread.ticket.status === 'in_progress' ? (
                  <span className="rounded-full border border-[#EBCF42]/30 bg-[#EBCF42]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EBCF42]">In Progress</span>
                ) : thread.ticket.status === 'resolved' ? (
                  <span className="rounded-full border border-[#32C382]/30 bg-[#32C382]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#32C382]">Resolved</span>
                ) : (
                  <span className="rounded-full border border-[#272839] bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8D8D96]">Closed</span>
                )}
              </span>
            </div>
          </div>

          {/* Conversation */}
          <div className="rounded-2xl bg-[#101114] border border-[#272839] p-6 sm:p-7">
            <h3 className="font-['Sora'] text-xl font-semibold text-white">Conversation</h3>
            <p className="mt-1 text-sm text-[#8D8D96] font-['Manrope']">
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
            <div className="rounded-2xl border border-[#272839] bg-[#101114] p-6">
              <h3 className="font-['Sora'] text-lg font-semibold text-white">Ticket closed</h3>
              <p className="mt-2 text-sm text-[#8D8D96] font-['Manrope']">
                This ticket is closed. Review the thread above for the final owner response or closing note.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Create Ticket Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Create Support Ticket"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-[#101114] border border-[#272839] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#272839] p-6">
              <h2 className="font-['Sora'] text-xl font-bold text-white">Create Support Ticket</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 transition-colors hover:bg-[#141519]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-[#8D8D96]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {createError ? (
                <p className="rounded-xl bg-[#F25461]/10 border border-[#F25461]/20 px-4 py-2 text-sm text-[#F25461] font-['Manrope']">{createError}</p>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-['DM_Sans'] font-bold text-white">Subject Title</label>
                <input
                  type="text"
                  placeholder="Briefly describe the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm text-white placeholder-[#8D8D96] outline-none focus:ring-2 focus:ring-[#4E79FF] font-['Manrope']"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-['DM_Sans'] font-bold text-white">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-medium capitalize transition-all font-['DM_Sans'] ${
                        priority === p
                          ? 'border-2 border-[#4E79FF] bg-[#4E79FF]/10 text-white font-bold'
                          : 'border-2 border-[#272839] bg-[#06070B] text-[#8D8D96] hover:border-[#4E79FF]/40'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-['DM_Sans'] font-bold text-white">Description</label>
                <textarea
                  placeholder="Provide detailed information about your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm text-white placeholder-[#8D8D96] outline-none focus:ring-2 focus:ring-[#4E79FF] font-['Manrope']"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[#272839] px-6 py-3 font-['DM_Sans'] font-bold text-[#8D8D96] transition-colors hover:bg-[#141519]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-xl bg-[#4E79FF] px-6 py-3 font-['DM_Sans'] font-bold text-white shadow-lg shadow-[#4E79FF]/20 transition-all hover:bg-[#3E68EE] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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

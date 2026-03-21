import clsx from 'clsx'
import { MessageSquareMore, ShieldCheck, UserRound } from 'lucide-react'

import type { SupportTicketMessage } from '../../types/api'
import { formatDateTime } from '../../utils/date'

function roleLabel(message: SupportTicketMessage) {
  switch (message.sender_role) {
    case 'owner':
      return 'Owner'
    case 'tenant':
      return 'Tenant'
    case 'admin':
      return 'Admin'
    default:
      return 'System'
  }
}

function roleIcon(message: SupportTicketMessage) {
  switch (message.sender_role) {
    case 'admin':
      return <ShieldCheck className="h-4 w-4" />
    case 'tenant':
      return <UserRound className="h-4 w-4" />
    default:
      return <MessageSquareMore className="h-4 w-4" />
  }
}

function roleBadgeClass(message: SupportTicketMessage) {
  if (message.sender_role === 'tenant') {
    return 'border-[rgba(140,154,182,0.22)] bg-[rgba(140,154,182,0.1)] text-[#d8deea]'
  }

  if (message.sender_role === 'admin') {
    return 'border-[rgba(151,105,34,0.22)] bg-[rgba(151,105,34,0.1)] text-[#e8c689]'
  }

  if (message.message_type === 'closing_note') {
    return 'border-[rgba(139,208,181,0.22)] bg-[rgba(139,208,181,0.1)] text-[#cfeede]'
  }

  if (message.sender_role === 'system') {
    return 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]'
  }

  return 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]'
}

function timelineNodeClass(message: SupportTicketMessage) {
  if (message.message_type === 'closing_note') {
    return 'border-[rgba(139,208,181,0.26)] bg-[rgba(139,208,181,0.12)] text-[#cfeede] shadow-[0_0_0_8px_rgba(139,208,181,0.06)]'
  }

  if (message.sender_role === 'tenant') {
    return 'border-[rgba(140,154,182,0.26)] bg-[rgba(140,154,182,0.12)] text-[#d8deea] shadow-[0_0_0_8px_rgba(140,154,182,0.05)]'
  }

  if (message.sender_role === 'admin') {
    return 'border-[rgba(151,105,34,0.26)] bg-[rgba(151,105,34,0.12)] text-[#e8c689] shadow-[0_0_0_8px_rgba(151,105,34,0.05)]'
  }

  return 'border-[rgba(240,163,35,0.28)] bg-[rgba(240,163,35,0.12)] text-[#f3d49a] shadow-[0_0_0_8px_rgba(240,163,35,0.08)]'
}

function messageTypeLabel(message: SupportTicketMessage) {
  if (message.message_type === 'initial_message') {
    return 'Opened ticket'
  }

  if (message.message_type === 'closing_note') {
    return 'Closing note'
  }

  if (message.message_type === 'system') {
    return 'System'
  }

  return 'Reply'
}

export function TicketThreadTimeline({ messages }: { messages: SupportTicketMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-[rgba(83,88,100,0.34)] bg-[linear-gradient(180deg,rgba(16,21,34,0.82),rgba(10,14,24,0.92))] px-5 py-8 text-center">
        <p className="text-sm font-medium text-[var(--ph-text)]">No thread activity yet</p>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Replies and closing notes will appear here in a structured operations timeline.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-4 pl-5 before:absolute before:bottom-2 before:left-[0.62rem] before:top-2 before:w-px before:bg-[linear-gradient(180deg,rgba(240,163,35,0.22),rgba(103,115,148,0.08),rgba(240,163,35,0.1))]">
      {messages.map((message) => (
        <div key={message.id} className="relative pl-5">
          <span
            className={clsx(
              'absolute left-[-0.12rem] top-5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
              timelineNodeClass(message),
            )}
          >
            {roleIcon(message)}
          </span>

          <article
            className={clsx(
              'rounded-xl border p-4 shadow-[0_20px_46px_-38px_rgba(0,0,0,0.76)] sm:p-5',
              message.message_type === 'closing_note'
                ? 'border-[rgba(139,208,181,0.18)] bg-[linear-gradient(180deg,rgba(17,39,31,0.88),rgba(9,24,20,0.96))]'
                : message.message_type === 'initial_message'
                  ? 'border-[rgba(240,163,35,0.2)] bg-[linear-gradient(180deg,rgba(26,24,18,0.94),rgba(14,18,28,1))]'
                  : 'border-[rgba(83,88,100,0.34)] bg-[linear-gradient(180deg,rgba(20,26,40,0.96),rgba(12,17,28,1))]',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                      roleBadgeClass(message),
                    )}
                  >
                    {roleLabel(message)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
                    {messageTypeLabel(message)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--ph-text)]">{message.sender_display_name}</p>
              </div>
              <p className="text-xs text-[var(--ph-text-muted)]">{formatDateTime(message.created_at)}</p>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ph-text-soft)]">{message.message}</p>
          </article>
        </div>
      ))}
    </div>
  )
}

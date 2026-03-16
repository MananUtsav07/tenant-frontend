import { Send } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '../common/Button'
import { FormTextarea } from '../common/FormInput'
import { dashboardFormPanelClassName } from '../common/formTheme'

export function TicketReplyComposer({
  title,
  description,
  value,
  onChange,
  onSubmit,
  busy,
  disabled,
  submitLabel,
  placeholder,
}: {
  title: string
  description: string
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  busy?: boolean
  disabled?: boolean
  submitLabel: string
  placeholder?: string
}) {
  return (
    <form onSubmit={onSubmit} className={`${dashboardFormPanelClassName} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Thread reply</p>
          <h3 className="ph-title mt-3 text-lg font-semibold text-[var(--ph-text)]">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
        </div>
        <span className="rounded-full border border-[rgba(83,88,100,0.3)] bg-white/[0.025] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f3d49a]">
          Audited history
        </span>
      </div>

      <FormTextarea
        label="Message"
        hideLabel
        name="ticket_reply_message"
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Write your response'}
        required
        disabled={disabled || busy}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-xs leading-relaxed text-[var(--ph-text-muted)]">
          Replies stay attached to the ticket timeline for owners, tenants, and admins with access.
        </p>
        <Button
          type="submit"
          disabled={disabled || busy || value.trim().length === 0}
          iconLeft={<Send className="h-4 w-4" />}
        >
          {busy ? 'Sending...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { Activity, Building2, MessageSquare, Users } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SummaryCard } from '../../components/common/SummaryCard'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type { AdminDashboardSummary, AdminSystemHealth } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminDashboardPage() {
  const { token } = useAdminAuth()
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [health, setHealth] = useState<AdminSystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return
      }

      try {
        setError(null)
        const [summaryResponse, healthResponse] = await Promise.all([
          api.getAdminDashboardSummary(token),
          api.getAdminSystemHealth(token),
        ])
        setSummary(summaryResponse.summary)
        setHealth(healthResponse.health)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="ph-page-header">
            <p className="ph-page-eyebrow">Admin Observatory</p>
            <h2 className="ph-page-heading">Platform overview</h2>
            <p className="ph-page-description max-w-2xl text-sm">
              Monitor organizations, adoption, contact flow, analytics activity, and system health from one secure observatory.
            </p>
          </div>
          {health ? (
            <span className="rounded-full border border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
              {health.status}
            </span>
          ) : null}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading platform summary..." rows={5} /> : null}

      {!loading && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Organizations" value={summary.total_organizations} icon={<Building2 className="h-4 w-4" />} />
            <SummaryCard label="Total Owners" value={summary.total_owners} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Total Residents" value={summary.total_tenants} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Total Properties" value={summary.total_properties} icon={<Building2 className="h-4 w-4" />} />
            <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<MessageSquare className="h-4 w-4" />} />
            <SummaryCard label="Events (7d)" value={summary.events_last_7_days} icon={<Activity className="h-4 w-4" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="ph-surface-card rounded-xl p-5 sm:p-6">
              <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Recent contact messages</h3>
              {summary.recent_contact_messages.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ph-text-muted)]">No contact messages received recently.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {summary.recent_contact_messages.map((message) => (
                    <li key={message.id} className="rounded-lg border border-[rgba(83,88,100,0.3)] bg-white/[0.025] p-4">
                      <p className="text-sm font-medium text-[var(--ph-text)]">{message.name}</p>
                      <p className="text-xs text-[var(--ph-text-muted)]">{message.email}</p>
                      <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{message.message}</p>
                      <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{formatDateTime(message.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="ph-surface-card rounded-xl p-5 sm:p-6">
              <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Recent registrations</h3>
              {summary.recent_registrations.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ph-text-muted)]">No recent registrations found.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {summary.recent_registrations.map((entry) => (
                    <li key={`${entry.user_type}-${entry.id}`} className="rounded-lg border border-[rgba(83,88,100,0.3)] bg-white/[0.025] p-4">
                      <p className="text-sm font-medium text-[var(--ph-text)]">{entry.label}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#f1cb85]">{entry.user_type}</p>
                      <p className="text-xs text-[var(--ph-text-muted)]">{entry.email ?? 'No email'}</p>
                      <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{formatDateTime(entry.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Top analytics events (7 days)</h3>
            {summary.top_events.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--ph-text-muted)]">No analytics events recorded in the last 7 days.</p>
            ) : (
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {summary.top_events.map((event) => (
                  <li key={event.event_name} className="rounded-lg border border-[rgba(83,88,100,0.3)] bg-white/[0.025] p-4">
                    <p className="text-sm font-medium text-[var(--ph-text)]">{event.event_name}</p>
                    <p className="text-xs text-[var(--ph-text-muted)]">{event.count} events</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      ) : null}

      {!loading && !summary ? (
        <EmptyState title="No admin summary available" description="Platform summary data will appear here." />
      ) : null}

      {!loading && health ? (
        <article className="ph-surface-card rounded-xl p-5 sm:p-6">
          <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">System health</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <p className="text-sm text-[var(--ph-text-soft)]">Status: {health.status}</p>
            <p className="text-sm text-[var(--ph-text-soft)]">Uptime: {health.uptime_seconds}s</p>
            <p className="text-sm text-[var(--ph-text-soft)]">DB Latency: {health.database.latency_ms}ms</p>
            <p className="text-sm text-[var(--ph-text-soft)]">Node: {health.node_version}</p>
          </div>
          <p className="mt-3 text-xs text-[var(--ph-text-muted)]">Generated: {formatDateTime(health.generated_at)}</p>
        </article>
      ) : null}
    </section>
  )
}

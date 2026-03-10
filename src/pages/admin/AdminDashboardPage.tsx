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
        const [summaryResponse, healthResponse] = await Promise.all([api.getAdminDashboardSummary(token), api.getAdminSystemHealth(token)])
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
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Platform Dashboard</h2>
        <p className="text-sm text-slate-400">Global platform overview across owners, tenants, and support activity.</p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading platform summary..." rows={5} /> : null}

      {!loading && summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Organizations" value={summary.total_organizations} icon={<Building2 className="h-4 w-4" />} />
          <SummaryCard label="Total Owners" value={summary.total_owners} icon={<Users className="h-4 w-4" />} />
          <SummaryCard label="Total Tenants" value={summary.total_tenants} icon={<Users className="h-4 w-4" />} />
          <SummaryCard label="Total Properties" value={summary.total_properties} icon={<Building2 className="h-4 w-4" />} />
          <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<MessageSquare className="h-4 w-4" />} />
          <SummaryCard label="Events (7d)" value={summary.events_last_7_days} icon={<Activity className="h-4 w-4" />} />
        </div>
      ) : null}

      {!loading && !summary ? (
        <EmptyState title="No admin summary available" description="Platform summary data will appear here." />
      ) : null}

      {!loading && summary ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-900">Recent Contact Messages</h3>
            {summary.recent_contact_messages.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No contact messages received recently.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {summary.recent_contact_messages.map((message) => (
                  <li key={message.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">{message.name}</p>
                    <p className="text-xs text-slate-400">{message.email}</p>
                    <p className="mt-1 text-sm text-slate-600">{message.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(message.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-900">Recent Registrations</h3>
            {summary.recent_registrations.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No recent registrations found.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {summary.recent_registrations.map((entry) => (
                  <li key={`${entry.user_type}-${entry.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                    <p className="text-xs uppercase tracking-wide text-blue-600">{entry.user_type}</p>
                    <p className="text-xs text-slate-400">{entry.email ?? 'No email'}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      ) : null}

      {!loading && summary ? (
        <article className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Top Analytics Events (7 days)</h3>
          {summary.top_events.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No analytics events recorded in the last 7 days.</p>
          ) : (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {summary.top_events.map((event) => (
                <li key={event.event_name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{event.event_name}</p>
                  <p className="text-xs text-slate-400">{event.count} events</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      ) : null}

      {!loading && health ? (
        <article className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <p className="text-sm text-slate-600">Status: {health.status}</p>
            <p className="text-sm text-slate-600">Uptime: {health.uptime_seconds}s</p>
            <p className="text-sm text-slate-600">DB Latency: {health.database.latency_ms}ms</p>
            <p className="text-sm text-slate-600">Node: {health.node_version}</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Generated: {formatDateTime(health.generated_at)}</p>
        </article>
      ) : null}
    </section>
  )
}




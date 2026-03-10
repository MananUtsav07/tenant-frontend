import { useCallback, useEffect, useState } from 'react'
import { Bell, Clock3, LifeBuoy, TriangleAlert, Users } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SummaryCard } from '../../components/common/SummaryCard'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { OwnerSummary } from '../../types/api'

export function OwnerDashboardPage() {
  const { token } = useOwnerAuth()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const loadSummary = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerSummary(token)
      setSummary(response.summary)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  const handleProcessReminders = async () => {
    if (!token) {
      return
    }

    try {
      setProcessing(true)
      await api.processOwnerReminders(token)
      await loadSummary()
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : 'Failed to process reminders')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Owner Dashboard</h2>
          <p className="text-sm text-slate-400">Quick metrics for your portfolio operations.</p>
        </div>
        <Button
          type="button"
          onClick={() => void handleProcessReminders()}
          disabled={processing}
          variant="outline"
          iconLeft={<Clock3 className="h-4 w-4" />}
          className="border-slate-300 bg-white text-slate-700"
        >
          {processing ? 'Processing...' : 'Process reminders'}
        </Button>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading dashboard summary..." rows={5} /> : null}

      {!loading && summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Active Tenants" value={summary.active_tenants} icon={<Users className="h-4 w-4" />} />
          <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<LifeBuoy className="h-4 w-4" />} />
          <SummaryCard label="Overdue Rent" value={summary.overdue_rent} icon={<TriangleAlert className="h-4 w-4" />} />
          <SummaryCard label="Reminders Pending" value={summary.reminders_pending} icon={<Clock3 className="h-4 w-4" />} />
          <SummaryCard
            label="Unread Notifications"
            value={summary.unread_notifications}
            icon={<Bell className="h-4 w-4" />}
          />
        </div>
      ) : null}

      {!loading && !summary && !error ? (
        <EmptyState
          title="No summary data"
          description="Start by adding properties and tenants to generate dashboard metrics."
          icon={<TriangleAlert className="h-5 w-5" />}
          actionLabel="Manage Properties"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}
    </section>
  )
}


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, X } from 'lucide-react'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { AdminOrganizationRow, AdminPlan, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const PLAN_COLORS: Record<string, string> = {
  trial:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
  starter:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  standard: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  plus:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  beyond:   'bg-[rgba(240,163,35,0.15)] text-[#f1cb85] border-[rgba(240,163,35,0.3)]',
}

function PlanBadge({ planCode }: { planCode: string | null | undefined }) {
  const code = planCode ?? 'trial'
  const cls = PLAN_COLORS[code] ?? PLAN_COLORS.trial
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {code}
    </span>
  )
}

type ChangePlanModalProps = {
  org: AdminOrganizationRow
  plans: AdminPlan[]
  onClose: () => void
  onSaved: (orgId: string, newPlanCode: string) => void
  token: string
}

function ChangePlanModal({ org, plans, onClose, onSaved, token }: ChangePlanModalProps) {
  const currentPlan = org.plan_code ?? 'trial'
  const [selected, setSelected] = useState(currentPlan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (selected === currentPlan) { onClose(); return }
    setSaving(true)
    setError(null)
    try {
      await api.patchAdminOrganizationPlan(token, org.id, selected)
      onSaved(org.id, selected)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(83,88,100,0.4)] bg-[#16181d] p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Change Plan</h3>
            <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{org.name} · {org.slug}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--ph-text-muted)] hover:bg-white/[0.06] hover:text-[var(--ph-text)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {plans.map((plan) => (
            <button
              key={plan.plan_code}
              onClick={() => setSelected(plan.plan_code)}
              className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                selected === plan.plan_code
                  ? 'border-[#FED609] bg-[rgba(254,214,9,0.08)]'
                  : 'border-[rgba(83,88,100,0.35)] bg-white/[0.025] hover:bg-white/[0.05]'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${selected === plan.plan_code ? 'text-[#FED609]' : 'text-[var(--ph-text)]'}`}>
                  {plan.plan_name}
                </p>
                <p className="text-xs text-[var(--ph-text-muted)] mt-0.5 uppercase tracking-wide">{plan.plan_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--ph-text)]">
                  {plan.monthly_price === 0 ? 'Free' : `$${(plan.monthly_price / 100).toFixed(0)}/mo`}
                </p>
                {plan.plan_code === currentPlan && (
                  <p className="text-xs text-[var(--ph-text-muted)] mt-0.5">Current</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[rgba(83,88,100,0.4)] py-2.5 text-sm text-[var(--ph-text-muted)] hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#FED609] py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#FFD70B] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Apply Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminOrganizationsPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminOrganizationRow[]>([])
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changePlanOrg, setChangePlanOrg] = useState<AdminOrganizationRow | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return

      try {
        setLoading(true)
        setError(null)
        const [response, plansResponse] = await Promise.all([
          api.getAdminOrganizations(token, {
            page: pagination.page,
            page_size: pagination.page_size,
            search,
            sort_by: sortBy,
            sort_order: sortOrder,
          }),
          api.getAdminPlans(token),
        ])
        setItems(response.items)
        setPagination(response.pagination)
        setPlans(plansResponse.plans)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load organizations')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder])

  const handlePlanSaved = (orgId: string, newPlanCode: string) => {
    setItems((prev) => prev.map((org) => org.id === orgId ? { ...org, plan_code: newPlanCode } : org))
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Organizations</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Tenant organizations onboarded to the platform.</p>
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortBy={sortBy}
        onSortByChange={(value) => {
          setSortBy(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => {
          setSortOrder(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortOptions={[
          { value: 'created_at', label: 'Created' },
          { value: 'name', label: 'Name' },
          { value: 'slug', label: 'Slug' },
          { value: 'plan_code', label: 'Plan' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading organizations..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No organizations found" description="No organizations match your current filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Organization', 'Plan', 'Owners', 'Properties', 'Created', '']}>
            {items.map((organization) => (
              <tr key={organization.id}>
                <td className="px-4 py-3">
                  <Link to={ROUTES.adminOrganizationDetail.replace(':id', organization.id)} className="inline-flex hover:opacity-90">
                    <OrganizationBadge name={organization.name} slug={organization.slug} />
                  </Link>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{organization.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <PlanBadge planCode={organization.plan_code} />
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">{organization.counts.owners}</td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">{organization.counts.properties}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(organization.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setChangePlanOrg(organization)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(83,88,100,0.35)] px-2.5 py-1.5 text-xs font-medium text-[var(--ph-text-muted)] hover:border-[#FED609] hover:text-[#FED609] transition-colors"
                  >
                    <CreditCard className="h-3 w-3" />
                    Plan
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
          />
        </>
      ) : null}

      {changePlanOrg && token ? (
        <ChangePlanModal
          org={changePlanOrg}
          plans={plans}
          token={token}
          onClose={() => setChangePlanOrg(null)}
          onSaved={handlePlanSaved}
        />
      ) : null}
    </section>
  )
}

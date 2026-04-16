import { useEffect, useState } from 'react'
import { CreditCard, X } from 'lucide-react'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type { AdminOwnerRow, AdminOrganizationRow, AdminPlan, PaginationMeta } from '../../types/api'
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
  owner: AdminOwnerRow
  plans: AdminPlan[]
  onClose: () => void
  onSaved: (organizationId: string, newPlanCode: string) => void
  token: string
}

function ChangePlanModal({ owner, plans, onClose, onSaved, token }: ChangePlanModalProps) {
  const currentPlan = owner.organizations?.plan_code ?? 'trial'
  const [selected, setSelected] = useState(currentPlan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (selected === currentPlan) { onClose(); return }
    setSaving(true)
    setError(null)
    try {
      await api.patchAdminOrganizationPlan(token, owner.organization_id, selected)
      onSaved(owner.organization_id, selected)
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
            <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{owner.full_name || owner.email} · {owner.organizations?.name}</p>
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
                  {plan.monthly_price === 0 ? 'Free' : `₹${(plan.monthly_price / 100).toLocaleString('en-IN')}/mo`}
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

export function AdminOwnersPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminOwnerRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [organizationId, setOrganizationId] = useState('')
  const [planCode, setPlanCode] = useState('')
  const [organizationOptions, setOrganizationOptions] = useState<AdminOrganizationRow[]>([])
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changePlanOwner, setChangePlanOwner] = useState<AdminOwnerRow | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return

      try {
        setError(null)
        setLoading(true)
        const [response, organizationsResponse, plansResponse] = await Promise.all([
          api.getAdminOwners(token, {
            page: pagination.page,
            page_size: pagination.page_size,
            search,
            sort_by: sortBy,
            sort_order: sortOrder,
            organization_id: organizationId || undefined,
            plan_code: planCode || undefined,
          }),
          api.getAdminOrganizations(token, { page: 1, page_size: 100, sort_by: 'name', sort_order: 'asc' }),
          api.getAdminPlans(token),
        ])
        setItems(response.items)
        setPagination(response.pagination)
        setOrganizationOptions(organizationsResponse.items)
        setPlans(plansResponse.plans)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load owners')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder, organizationId, planCode])

  const handlePlanSaved = (organizationId: string, newPlanCode: string) => {
    setItems((prev) =>
      prev.map((owner) =>
        owner.organization_id === organizationId && owner.organizations
          ? { ...owner, organizations: { ...owner.organizations, plan_code: newPlanCode } }
          : owner,
      ),
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Owners</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Manage and audit owner accounts across organizations.</p>
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
        organizationId={organizationId}
        onOrganizationIdChange={(value) => {
          setOrganizationId(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        organizationOptions={organizationOptions.map((organization) => ({
          value: organization.id,
          label: organization.name,
        }))}
        sortOptions={[
          { value: 'created_at', label: 'Created' },
          { value: 'email', label: 'Email' },
          { value: 'full_name', label: 'Full Name' },
          { value: 'company_name', label: 'Company' },
        ]}
      />

      {/* Plan filter */}
      {plans.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPlanCode(''); setPagination((c) => ({ ...c, page: 1 })) }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              planCode === ''
                ? 'border-[#FED609] bg-[rgba(254,214,9,0.12)] text-[#FED609]'
                : 'border-[rgba(83,88,100,0.35)] text-[var(--ph-text-muted)] hover:border-[rgba(83,88,100,0.6)]'
            }`}
          >
            All Plans
          </button>
          {plans.map((plan) => (
            <button
              key={plan.plan_code}
              onClick={() => { setPlanCode(plan.plan_code); setPagination((c) => ({ ...c, page: 1 })) }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all ${
                planCode === plan.plan_code
                  ? 'border-[#FED609] bg-[rgba(254,214,9,0.12)] text-[#FED609]'
                  : 'border-[rgba(83,88,100,0.35)] text-[var(--ph-text-muted)] hover:border-[rgba(83,88,100,0.6)]'
              }`}
            >
              {plan.plan_name}
            </button>
          ))}
        </div>
      )}

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading owners..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No owners found" description="Try adjusting your search, sort, or filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Owner', 'Plan', 'Support Email', 'Created', '']}>
            {items.map((owner) => (
              <tr key={owner.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{owner.full_name || 'Unnamed owner'}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{owner.email}</p>
                </td>
                <td className="px-4 py-3">
                  <PlanBadge planCode={owner.organizations?.plan_code} />
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">{owner.support_email || '-'}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(owner.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setChangePlanOwner(owner)}
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

      {changePlanOwner && token ? (
        <ChangePlanModal
          owner={changePlanOwner}
          plans={plans}
          token={token}
          onClose={() => setChangePlanOwner(null)}
          onSaved={handlePlanSaved}
        />
      ) : null}
    </section>
  )
}

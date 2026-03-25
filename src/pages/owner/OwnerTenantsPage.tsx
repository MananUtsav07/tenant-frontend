import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Building2, Download, Pencil, Trash2, UserRoundPlus, Users } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Modal } from '../../components/common/Modal'
import { dashboardInfoPanelClassName } from '../../components/common/formTheme'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { Broker, Property, Tenant } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime, getCurrencyMarker } from '../../utils/date'
import { exportToCsv } from '../../utils/export'

function getNextDueDate(dayOfMonth: number, now = new Date()): Date {
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()
  const daysInCurrentMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate()
  const safeDayCurrentMonth = Math.max(1, Math.min(dayOfMonth, daysInCurrentMonth))
  const currentCandidate = new Date(Date.UTC(currentYear, currentMonth, safeDayCurrentMonth, 9, 0, 0, 0))

  if (currentCandidate >= now) {
    return currentCandidate
  }

  const nextMonthDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1, 9, 0, 0, 0))
  const nextYear = nextMonthDate.getUTCFullYear()
  const nextMonth = nextMonthDate.getUTCMonth()
  const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate()
  const safeDayNextMonth = Math.max(1, Math.min(dayOfMonth, daysInNextMonth))
  return new Date(Date.UTC(nextYear, nextMonth, safeDayNextMonth, 9, 0, 0, 0))
}

function buildEmptyTenantForm(defaultPropertyId = '') {
  return {
    property_id: defaultPropertyId,
    broker_id: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    lease_start_date: '',
    lease_end_date: '',
    monthly_rent: '',
    payment_due_day: '1',
    payment_status: 'pending' as Tenant['payment_status'],
    status: 'active' as Tenant['status'],
  }
}

function sanitizeRentInput(value: string, currencyMarker: string): string {
  const withoutMarker = value.replace(currencyMarker, '')
  const numeric = withoutMarker.replace(/[^\d.]/g, '')
  const [wholePart, ...decimalParts] = numeric.split('.')
  const decimalPart = decimalParts.join('').slice(0, 2)

  if (!wholePart && !decimalPart) {
    return ''
  }

  return decimalPart.length > 0 ? `${wholePart || '0'}.${decimalPart}` : wholePart
}

export function OwnerTenantsPage() {
  const { token, owner } = useOwnerAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [form, setForm] = useState(buildEmptyTenantForm)
  const ownerCurrencyCode = owner?.organization?.currency_code ?? 'INR'
  const ownerCurrencyMarker = getCurrencyMarker(ownerCurrencyCode)

  const loadData = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const [tenantResponse, propertyResponse, brokerResponse] = await Promise.all([
        api.getOwnerTenants(token),
        api.getOwnerProperties(token),
        api.getOwnerBrokers(token),
      ])
      setTenants(tenantResponse.tenants)
      setProperties(propertyResponse.properties)
      setBrokers(brokerResponse.brokers.filter((broker) => broker.is_active))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (properties.length > 0 && !form.property_id) {
      setForm((current) => ({ ...current, property_id: properties[0].id }))
    }
  }, [properties, form.property_id])

  const resetForm = () => {
    setForm(buildEmptyTenantForm(properties[0]?.id ?? ''))
    setEditingTenantId(null)
    setShowTenantForm(false)
  }

  const handleCreateTenant = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    const trimmedFullName = form.full_name.trim()
    const trimmedEmail = form.email.trim()
    const trimmedPhone = form.phone.trim()
    const trimmedPassword = form.password.trim()
    const monthlyRent = Number(form.monthly_rent)
    const dueDay = Number(form.payment_due_day)

    if (!form.property_id) {
      setError('Select a property before creating a tenant')
      return
    }

    if (!trimmedFullName) {
      setError('Tenant full name is required')
      return
    }

    if (!editingTenantId && trimmedPassword.length < 8) {
      setError('Tenant password must be at least 8 characters')
      return
    }

    if (form.monthly_rent.trim().length === 0) {
      setError('Monthly rent is required')
      return
    }

    if (Number.isNaN(monthlyRent) || monthlyRent < 0) {
      setError('Monthly rent must be a valid non-negative number')
      return
    }

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      setError('Due date must be an integer between 1 and 31')
      return
    }

    try {
      setBusy(true)
      setError(null)

      if (editingTenantId) {
        await api.updateOwnerTenant(token, editingTenantId, {
          property_id: form.property_id,
          broker_id: form.broker_id || null,
          full_name: trimmedFullName,
          email: trimmedEmail || null,
          phone: trimmedPhone || null,
          lease_start_date: form.lease_start_date || null,
          lease_end_date: form.lease_end_date || null,
          monthly_rent: monthlyRent,
          payment_due_day: dueDay,
          payment_status: form.payment_status,
          status: form.status,
          ...(trimmedPassword ? { password: trimmedPassword } : {}),
        })
      } else {
        await api.createOwnerTenant(token, {
          property_id: form.property_id,
          broker_id: form.broker_id || undefined,
          full_name: trimmedFullName,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          password: trimmedPassword,
          lease_start_date: form.lease_start_date || undefined,
          lease_end_date: form.lease_end_date || undefined,
          monthly_rent: monthlyRent,
          payment_due_day: dueDay,
          payment_status: form.payment_status,
          status: form.status,
        })
      }

      resetForm()
      await loadData()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create tenant')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (tenantId: string) => {
    if (!token) {
      return
    }

    try {
      setBusy(true)
      await api.deleteOwnerTenant(token, tenantId)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete tenant')
    } finally {
      setBusy(false)
    }
  }

  const beginEdit = (tenant: Tenant) => {
    setShowTenantForm(true)
    setEditingTenantId(tenant.id)
    setForm({
      property_id: tenant.property_id,
      broker_id: tenant.broker_id ?? '',
      full_name: tenant.full_name,
      email: tenant.email ?? '',
      phone: tenant.phone ?? '',
      password: '',
      lease_start_date: tenant.lease_start_date ?? '',
      lease_end_date: tenant.lease_end_date ?? '',
      monthly_rent: String(tenant.monthly_rent),
      payment_due_day: String(tenant.payment_due_day),
      payment_status: tenant.payment_status,
      status: tenant.status,
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Tenants</h2>
          <p className="text-sm text-[#6B7280]">Create tenant access IDs and manage occupancy.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.06)] bg-[#FFFAE2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#92700A]">
          <Users className="h-3.5 w-3.5 text-[#FED609]" />
          {tenants.length} total
        </span>
      </div>

      {!showTenantForm && properties.length > 0 ? (
        <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Create Tenant</h3>
              <p className="text-sm text-[#6B7280]">Click below to open the full tenant form.</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setShowTenantForm(true)
                setEditingTenantId(null)
                setForm(buildEmptyTenantForm(properties[0]?.id ?? ''))
              }}
              variant="secondary"
              size="sm"
              iconLeft={<UserRoundPlus className="h-4 w-4" />}
            >
              Add Tenant
            </Button>
          ) : null}
        </div>
      ) : null}

      {showTenantForm ? (
        <form
          onSubmit={handleCreateTenant}
          autoComplete="off"
          className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm"
        >
        <input
          type="text"
          name="prevent_username"
          autoComplete="username"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, width: 1, height: 1 }}
        />
        <input
          type="password"
          name="prevent_current_password"
          autoComplete="current-password"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, width: 1, height: 1 }}
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#4B5563]">Property</span>
            <select
              name="tenant_property_id"
              autoComplete="off"
              className="tf-field"
              value={form.property_id}
              onChange={(event) => setForm((current) => ({ ...current, property_id: event.target.value }))}
              required
            >
              <option value="" disabled>
                Select property
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.property_name}
                </option>
              ))}
            </select>
          </label>

          <FormInput
            label="Full Name"
            name="tenant_full_name"
            autoComplete="off"
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            required
          />
          <FormInput
            label="Email"
            type="email"
            name="tenant_contact_email"
            autoComplete="new-password"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <FormInput
            label="Phone"
            name="tenant_phone"
            autoComplete="off"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <FormInput
            label={editingTenantId ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            name="tenant_access_password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required={!editingTenantId}
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#4B5563]">Monthly Rent</span>
            <input
              type="text"
              inputMode="decimal"
              name="tenant_monthly_rent"
              className="tf-field"
              value={`${ownerCurrencyMarker}${form.monthly_rent}`}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  monthly_rent: sanitizeRentInput(event.target.value, ownerCurrencyMarker),
                }))
              }
              required
            />
          </label>
          <FormInput
            label="Due Date"
            type="number"
            name="tenant_due_day"
            min={1}
            max={31}
            value={form.payment_due_day}
            onChange={(event) => setForm((current) => ({ ...current, payment_due_day: event.target.value }))}
            required
          />
          <FormInput
            label="Lease Start"
            type="date"
            name="tenant_lease_start"
            value={form.lease_start_date}
            onChange={(event) => setForm((current) => ({ ...current, lease_start_date: event.target.value }))}
          />
          <FormInput
            label="Lease End"
            type="date"
            name="tenant_lease_end"
            value={form.lease_end_date}
            onChange={(event) => setForm((current) => ({ ...current, lease_end_date: event.target.value }))}
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#4B5563]">Payment Status</span>
            <select
              name="tenant_payment_status"
              className="tf-field"
              value={form.payment_status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  payment_status: event.target.value as Tenant['payment_status'],
                }))
              }
              required
            >
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="overdue">overdue</option>
              <option value="partial">partial</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#4B5563]">Tenant Status</span>
            <select
              name="tenant_status"
              className="tf-field"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as Tenant['status'],
                }))
              }
              required
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="terminated">terminated</option>
            </select>
          </label>
        </div>

          <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={busy || properties.length === 0}
            variant="secondary"
            iconLeft={editingTenantId ? <Pencil className="h-4 w-4" /> : <UserRoundPlus className="h-4 w-4" />}
          >
            {editingTenantId ? 'Save Tenant' : 'Create Tenant'}
          </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="border-[rgba(0,0,0,0.06)] bg-white text-[#4B5563]"
            >
              {editingTenantId ? 'Cancel Edit' : 'Close Form'}
            </Button>
          </div>
        </form>
      </Modal>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant records..." rows={4} /> : null}

      {!loading && properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Create at least one property before adding tenants."
          icon={<Building2 className="h-5 w-5" />}
          actionLabel="Create Property"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}

      {!loading && properties.length > 0 && tenants.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Use the form above to create the first tenant account."
          icon={<Users className="h-5 w-5" />}
          actionLabel="Add Tenant"
          onAction={() => setShowTenantForm(true)}
        />
      ) : null}

      {!loading && tenants.length > 0 ? (
        <DataTable headers={['Name', 'Broker', 'Access ID', 'Rent', 'Due Date', 'Lease', 'Status', 'Created', 'Actions']}>
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-[#1A1A1A]">{tenant.full_name}</p>
                <p className="text-xs text-[#6B7280]">{tenant.email || 'No email'}</p>
              </td>
              <td className="px-4 py-3 text-[#1A1A1A]">{tenant.tenant_access_id}</td>
              <td className="px-4 py-3 text-[#1A1A1A]">{formatCurrency(tenant.monthly_rent, ownerCurrencyCode)}</td>
              <td className="px-4 py-3 text-[#1A1A1A]">{formatDate(getNextDueDate(tenant.payment_due_day).toISOString())}</td>
              <td className="px-4 py-3 text-[#6B7280]">
                {formatDate(tenant.lease_start_date)} - {formatDate(tenant.lease_end_date)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={tenant.payment_status} />
              </td>
              <td className="px-4 py-3 text-[#6B7280]">{formatDateTime(tenant.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    to={`/owner/tenants/${tenant.id}`}
                    variant="outline"
                    size="sm"
                    className="border-[rgba(0,0,0,0.06)] bg-white text-[#4B5563]"
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    onClick={() => beginEdit(tenant)}
                    variant="outline"
                    size="sm"
                    className="border-[rgba(0,0,0,0.06)] bg-white text-[#4B5563]"
                    iconLeft={<Pencil className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleDelete(tenant.id)}
                    variant="outline"
                    size="sm"
                    className="border-[rgba(244,163,163,0.28)] bg-[rgba(120,28,28,0.14)] text-red-200 hover:bg-[rgba(120,28,28,0.2)]"
                    iconLeft={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : null}

      {!loading && properties.length > 0 && tenants.length > 0 ? (
        <p className="text-xs text-[#6B7280]">
          Tip: leave password blank while editing to keep the tenant's current password.
        </p>
      ) : null}
    </section>
  )
}

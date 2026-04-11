import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  UserRoundPlus,
  Users,
} from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { Broker, Property, Tenant } from '../../types/api'
import { formatDate, getCurrencyMarker } from '../../utils/date'

/** Convert YYYY-MM-DD → DD/MM/YYYY for display in text inputs */
function isoToDDMMYYYY(iso: string): string {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

/** Convert DD/MM/YYYY → YYYY-MM-DD for API submission. Returns '' if not a complete valid date. */
function ddmmyyyyToISO(display: string): string {
  if (!display) return ''
  const parts = display.split('/')
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return ''
}

const RENT_CURRENCY_OPTIONS = [
  { code: 'INR', label: 'Rupees (INR)' },
  { code: 'USD', label: 'Dollar (USD)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
] as const

function buildEmptyTenantForm(defaultPropertyId = '', currencyCode = 'INR') {
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
    currency_code: currencyCode,
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

function getPaymentStatusStyle(status: Tenant['payment_status']) {
  switch (status) {
    case 'paid':
      return { badge: 'bg-[#32C382]/15 text-[#32C382] border-[#32C382]/30', dot: 'bg-[#32C382]' }
    case 'overdue':
      return { badge: 'bg-red-100 text-red-700 border-[#F25461]/30', dot: 'bg-[#F25461]/150' }
    case 'partial':
      return { badge: 'bg-[#EBCF42]/15 text-[#EBCF42] border-[#EBCF42]/30', dot: 'bg-[#EBCF42]' }
    case 'pending':
    default:
      return { badge: 'bg-[#EBCF42]/15 text-[#EBCF42] border-[#EBCF42]/30', dot: 'bg-[#EBCF42]' }
  }
}


export function OwnerTenantsPage() {
  const { token, owner } = useOwnerAuth()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [form, setForm] = useState(() => buildEmptyTenantForm('', owner?.organization?.currency_code ?? 'INR'))
  const [filterPropertyId, setFilterPropertyId] = useState('')
  const [tenantPendingDelete, setTenantPendingDelete] = useState<Tenant | null>(null)
  const [showOccupiedWarning, setShowOccupiedWarning] = useState(false)
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)
  const currencyMenuRef = useRef<HTMLDivElement | null>(null)
  const ownerCurrencyCode = owner?.organization?.currency_code ?? 'INR'
  const selectedRentCurrencyCode = form.currency_code || ownerCurrencyCode
  const selectedRentCurrencyMarker = getCurrencyMarker(selectedRentCurrencyCode)

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
      setBrokers(brokerResponse.brokers)
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

  useEffect(() => {
    if (!showCurrencyMenu) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [showCurrencyMenu])

  const resetForm = () => {
    setForm(buildEmptyTenantForm(properties[0]?.id ?? '', ownerCurrencyCode))
    setEditingTenantId(null)
    setShowTenantForm(false)
    setFormError(null)
    setShowCurrencyMenu(false)
  }

  const doSaveTenant = async () => {
    if (!token) return

    const trimmedFullName = form.full_name.trim()
    const trimmedEmail = form.email.trim()
    const trimmedPhone = form.phone.trim()
    const trimmedPassword = form.password.trim()
    const monthlyRent = Number(form.monthly_rent)
    const dueDay = Number(form.payment_due_day)

    try {
      setBusy(true)
      setError(null)
      setFormError(null)

      if (editingTenantId) {
        await api.updateOwnerTenant(token, editingTenantId, {
          property_id: form.property_id,
          broker_id: form.broker_id || null,
          full_name: trimmedFullName,
          email: trimmedEmail || null,
          phone: trimmedPhone || null,
          lease_start_date: ddmmyyyyToISO(form.lease_start_date) || null,
          lease_end_date: ddmmyyyyToISO(form.lease_end_date) || null,
          monthly_rent: monthlyRent,
          payment_due_day: dueDay,
          payment_status: form.payment_status,
          status: form.status,
        })
      } else {
        await api.createOwnerTenant(token, {
          property_id: form.property_id,
          broker_id: form.broker_id || undefined,
          full_name: trimmedFullName,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          password: trimmedPassword,
          lease_start_date: ddmmyyyyToISO(form.lease_start_date) || undefined,
          lease_end_date: ddmmyyyyToISO(form.lease_end_date) || undefined,
          monthly_rent: monthlyRent,
          payment_due_day: dueDay,
          payment_status: form.payment_status,
          status: form.status,
        })
      }

      resetForm()
      await loadData()
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : 'Failed to save tenant')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateTenant = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    const trimmedFullName = form.full_name.trim()
    const trimmedEmail = form.email.trim()
    const trimmedPassword = form.password.trim()
    const monthlyRent = Number(form.monthly_rent)
    const dueDay = Number(form.payment_due_day)

    if (!form.property_id) {
      setFormError('Select a property before creating a tenant')
      return
    }

    if (!trimmedFullName) {
      setFormError('Tenant full name is required')
      return
    }

    if (!trimmedEmail) {
      setFormError('Tenant email is required to send login credentials')
      return
    }

    if (!editingTenantId && trimmedPassword.length < 8) {
      setFormError('Tenant password must be at least 8 characters')
      return
    }

    if (form.monthly_rent.trim().length === 0 || Number.isNaN(monthlyRent) || monthlyRent < 1) {
      setFormError('Monthly rent is required and must be greater than 0')
      return
    }

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      setFormError('Due date must be an integer between 1 and 31')
      return
    }

    // Warn if adding a new tenant to an already occupied property
    if (!editingTenantId) {
      const selectedProperty = properties.find((p) => p.id === form.property_id)
      if (selectedProperty?.occupancy_status === 'occupied') {
        setShowOccupiedWarning(true)
        return
      }
    }

    await doSaveTenant()
  }

  const requestDelete = (tenant: Tenant) => {
    setError(null)
    setTenantPendingDelete(tenant)
  }

  const handleDelete = async () => {
    if (!token || !tenantPendingDelete) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.deleteOwnerTenant(token, tenantPendingDelete.id)
      setTenantPendingDelete(null)
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
    setFormError(null)
    setShowCurrencyMenu(false)
    setForm({
      property_id: tenant.property_id,
      broker_id: tenant.broker_id ?? '',
      full_name: tenant.full_name,
      email: tenant.email ?? '',
      phone: tenant.phone ?? '',
      password: '',
      lease_start_date: isoToDDMMYYYY(tenant.lease_start_date ? tenant.lease_start_date.slice(0, 10) : ''),
      lease_end_date: isoToDDMMYYYY(tenant.lease_end_date ? tenant.lease_end_date.slice(0, 10) : ''),
      monthly_rent: String(tenant.monthly_rent),
      payment_due_day: String(tenant.payment_due_day),
      payment_status: tenant.payment_status,
      status: tenant.status,
      currency_code: ownerCurrencyCode,
    })
  }

  const filteredTenants = filterPropertyId
    ? tenants.filter((t) => t.property_id === filterPropertyId)
    : tenants

  const getPropertyName = (propertyId: string) => {
    return properties.find((p) => p.id === propertyId)?.property_name ?? '-'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-[#06070B] text-white">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-['Sora'] text-white">Tenants</h2>
          <p className="text-[#8D8D96] mt-1 font-['Manrope'] text-sm">
            Manage your residents and lease agreements across all properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter by Property */}
          <div className="relative">
            <select
              className="appearance-none bg-[#101114] border border-[#272839] rounded-xl px-4 py-2.5 pr-9 text-sm font-medium focus:ring-2 focus:ring-[#4E79FF] focus:border-[#4E79FF] outline-none cursor-pointer text-white font-['DM_Sans'] shadow-sm"
              value={filterPropertyId}
              onChange={(e) => setFilterPropertyId(e.target.value)}
            >
              <option value="">Filter by Property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.property_name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-[#8D8D96] rotate-90" />
          </div>

          {/* Add Tenant Button */}
          <button
            type="button"
            onClick={() => {
              setShowTenantForm(true)
              setEditingTenantId(null)
              setForm(buildEmptyTenantForm(properties[0]?.id ?? '', ownerCurrencyCode))
              setFormError(null)
              setShowCurrencyMenu(false)
            }}
                        className="bg-[#4E79FF] hover:bg-[#3E68EE] text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-['DM_Sans'] text-sm"
          >
            <UserRoundPlus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#101114] rounded-2xl border border-[#272839] shadow-sm p-5 hover:border-[#4E79FF]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Total Tenants</p>
          <p className="text-3xl font-bold font-['Sora'] text-white mt-1.5">{tenants.length}</p>
        </div>
        <div className="bg-[#101114] rounded-2xl border border-[#272839] shadow-sm p-5 hover:border-[#4E79FF]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Paid</p>
          <p className="text-3xl font-bold font-['Sora'] text-green-600 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'paid').length}
          </p>
        </div>
        <div className="bg-[#101114] rounded-2xl border border-[#272839] shadow-sm p-5 hover:border-[#4E79FF]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Pending</p>
          <p className="text-3xl font-bold font-['Sora'] text-orange-500 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'pending').length}
          </p>
        </div>
        <div className="bg-[#101114] rounded-2xl border border-[#272839] shadow-sm p-5 hover:border-[#4E79FF]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Overdue</p>
          <p className="text-3xl font-bold font-['Sora'] text-red-600 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && !showTenantForm && !tenantPendingDelete ? <ErrorState message={error} /> : null}

      {/* Loading */}
      {loading ? <LoadingState message="Loading tenant records..." rows={4} /> : null}

      {/* No Properties */}
      {!loading && properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Create at least one property before adding tenants."
          icon={<Building2 className="h-5 w-5" />}
          actionLabel="Create Property"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}

      {/* No Tenants */}
      {!loading && properties.length > 0 && tenants.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Click 'Add Tenant' to create the first tenant account."
          icon={<Users className="h-5 w-5" />}
          actionLabel="Add Tenant"
          onAction={() => setShowTenantForm(true)}
        />
      ) : null}

      {/* Table + Detail Panel layout */}
      {!loading && filteredTenants.length > 0 ? (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredTenants.map((tenant) => {
              const payStyle = getPaymentStatusStyle(tenant.payment_status)
              return (
                <div
                  key={tenant.id}
                  className="rounded-xl bg-[#101114] border border-[#272839] p-4 space-y-3"
                >
                  {/* Name + payment badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-white font-['Sora'] truncate">{tenant.full_name}</p>
                      <p className="text-xs text-[#8D8D96] truncate mt-0.5">{tenant.email ?? 'No email'}</p>
                      {tenant.brokers ? (
                        <p className="text-[11px] text-[#A08A57] mt-0.5 truncate">
                          Broker: {tenant.brokers.full_name}
                        </p>
                      ) : null}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border shrink-0 ${payStyle.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${payStyle.dot}`} />
                      {tenant.payment_status}
                    </span>
                  </div>

                  {/* Property + lease */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8D8D96]">
                    <span>🏠 {getPropertyName(tenant.property_id)}</span>
                    {tenant.lease_end_date && <span>📅 Ends {formatDate(tenant.lease_end_date)}</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.ownerTenantDetail.replace(':id', tenant.id))}
                      className="flex items-center gap-1 rounded-lg border border-[#4E79FF]/40 bg-[#4E79FF]/10 px-3 py-1.5 text-xs font-semibold text-[#4E79FF] hover:bg-[#4E79FF]/20 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => beginEdit(tenant)}
                      className="flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-3 py-1.5 text-xs font-semibold text-[#8D8D96] hover:border-[#4E79FF]/50 hover:text-[#4E79FF] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(tenant)}
                      className="flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-3 py-1.5 text-xs font-semibold text-[#8D8D96] hover:border-[#F25461]/40 hover:text-[#F25461] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[#101114] rounded-2xl shadow-sm border border-[#272839] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#4E79FF] text-white">
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider">Tenant Name</th>
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider">Property</th>
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider hidden md:table-cell">Unit</th>
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider hidden lg:table-cell">Lease End</th>
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider">Payment</th>
                    <th className="px-5 py-4 font-bold font-['DM_Sans'] text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-['Manrope']">
                  {filteredTenants.map((tenant, index) => {
                    const payStyle = getPaymentStatusStyle(tenant.payment_status)
                    return (
                      <tr
                        key={tenant.id}
                        className={`border-b border-[#272839] transition-colors ${
                          index % 2 === 0
                            ? 'bg-[#06070B]/30 hover:bg-[#141519]/60'
                            : 'bg-[#101114] hover:bg-[#141519]/60'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white truncate max-w-[140px]">{tenant.full_name}</p>
                          <p className="text-xs text-[#8D8D96] truncate">{tenant.email ?? 'No email'}</p>
                          {tenant.brokers ? (
                            <p className="text-[11px] text-[#A08A57] font-medium truncate mt-0.5">
                              <span className="text-[#8D8D96] font-semibold">Broker:</span>{' '}
                              {tenant.brokers.full_name}{tenant.brokers.agency_name ? ` · ${tenant.brokers.agency_name}` : ''}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-[#8D8D96] truncate max-w-[120px]">{getPropertyName(tenant.property_id)}</td>
                        <td className="px-5 py-4 text-[#8D8D96] hidden md:table-cell">{'—'}</td>
                        <td className="px-5 py-4 text-[#8D8D96] hidden lg:table-cell">{formatDate(tenant.lease_end_date)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${payStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${payStyle.dot}`} />
                            {tenant.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title="View tenant"
                              onClick={() => navigate(ROUTES.ownerTenantDetail.replace(':id', tenant.id))}
                              className="p-1.5 hover:bg-[#4E79FF]/20 rounded-lg transition-colors text-[#4E79FF]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit tenant"
                              onClick={() => beginEdit(tenant)}
                              className="p-1.5 hover:bg-[#4E79FF]/20 rounded-lg transition-colors text-white"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete tenant"
                              onClick={() => requestDelete(tenant)}
                              disabled={busy}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-[#F25461] disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-5 py-4 bg-[#101114] border-t border-[#272839] flex justify-between items-center">
              <span className="text-xs text-[#8D8D96] font-['DM_Sans']">
                Showing {filteredTenants.length} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#272839] text-[#8D8D96] hover:bg-[#2251E3] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2251E3] text-white font-bold text-sm"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#272839] text-[#8D8D96] hover:bg-[#2251E3] hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}


      {/* Tenant Form Modal */}
      {showTenantForm ? (
        <Modal
          isOpen={showTenantForm}
          onClose={resetForm}
          title={editingTenantId ? 'Edit Tenant' : 'Create Tenant'}
          size="lg"
        >
          <form onSubmit={handleCreateTenant} autoComplete="off" className="space-y-4">
            {formError ? (
              <div className="rounded-xl border border-[#F25461]/30 bg-[#F25461]/15 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            ) : null}

            {/* Hidden autocomplete traps */}
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
                <span className="text-sm font-medium text-[#C0C0C5]">Property</span>
                <select
                  name="tenant_property_id"
                  autoComplete="off"
                  className="tf-field bg-[#101114] text-white border-[#272839]"
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

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#C0C0C5]">Broker</span>
                <select
                  name="tenant_broker_id"
                  autoComplete="off"
                  className="tf-field bg-[#101114] text-white border-[#272839]"
                  value={form.broker_id}
                  onChange={(event) => setForm((current) => ({ ...current, broker_id: event.target.value }))}
                >
                  <option value="">No broker assigned</option>
                  {brokers.filter((b) => b.is_active).map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.full_name}{broker.agency_name ? ` — ${broker.agency_name}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#C0C0C5]">
                  Full Name <span className="text-red-400">*</span>
                </span>
                <input
                  type="text"
                  name="tenant_full_name"
                  autoComplete="off"
                  className="tf-field bg-[#101114] text-white border-[#272839]"
                  value={form.full_name}
                  onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                  required
                />
              </label>
              <FormInput
                label="Email"
                type="email"
                name="tenant_contact_email"
                autoComplete="new-password"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
              <FormInput
                label="Phone (WhatsApp)"
                name="tenant_phone"
                autoComplete="off"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                hint="Used for WhatsApp rent reminders"
              />
              {!editingTenantId ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#C0C0C5]">
                    Password <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="password"
                    name="tenant_access_password"
                    autoComplete="new-password"
                    className="tf-field bg-[#101114] text-white border-[#272839]"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                </label>
              ) : null}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#C0C0C5]">
                  Monthly Rent <span className="text-red-400">*</span>
                </span>
                <div className="flex items-center gap-2">
                  <div ref={currencyMenuRef} className="relative w-[96px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCurrencyMenu((current) => !current)}
                      className={`flex h-[52px] w-full items-center justify-between rounded-xl border bg-[#101114] px-3 text-sm font-medium text-white outline-none transition-all duration-150 ${
                        showCurrencyMenu
                          ? 'border-[#4E79FF] shadow-[0_0_0_3px_rgba(78,121,255,0.2)]'
                          : 'border-[#272839] hover:border-[#4E79FF]/50'
                      }`}
                    >
                      <span>{selectedRentCurrencyCode}</span>
                      <ChevronDown className={`h-4 w-4 text-[#8D8D96] transition-transform duration-150 ${showCurrencyMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showCurrencyMenu ? (
                      <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-[168px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#101114] shadow-[0_8px_24px_rgba(26,26,26,0.1)]">
                        {RENT_CURRENCY_OPTIONS.map((option) => {
                          const isSelected = option.code === selectedRentCurrencyCode
                          const currencyName = option.label.replace(/ \(.*\)$/, '')

                          return (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => {
                                setForm((current) => ({
                                  ...current,
                                  currency_code: option.code,
                                }))
                                setShowCurrencyMenu(false)
                              }}
                              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                isSelected
                                  ? 'bg-[#141519] text-white'
                                  : 'text-[#C0C0C5] hover:bg-[#06070B]'
                              }`}
                            >
                              <span className="font-semibold text-white">{option.code}</span>
                              <span className="truncate text-xs text-[#8D8D96]">{currencyName}</span>
                              {isSelected ? <span className="ml-auto shrink-0 text-xs font-bold text-[#4E79FF]">✓</span> : null}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex h-[52px] min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-[#272839] bg-[#101114] transition-all duration-150 hover:border-[#4E79FF]/50 focus-within:border-[#4E79FF] focus-within:shadow-[0_0_0_3px_rgba(78,121,255,0.2)]">
                    <div className="flex h-full min-w-13 items-center justify-center border-r border-[#E5E7EB] bg-[#141519] px-3 text-sm font-semibold text-[#8D8D96]">
                      {selectedRentCurrencyMarker}
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="tenant_monthly_rent"
                      className="w-full border-0 bg-transparent px-4 py-3 text-sm text-white caret-[#1A1A1A] outline-none focus:outline-none focus-visible:outline-none"
                      style={{ outline: 'none' }}
                      value={form.monthly_rent}
                      placeholder="0000"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          monthly_rent: sanitizeRentInput(event.target.value, selectedRentCurrencyMarker),
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#C0C0C5]">
                  Due Date <span className="text-red-400">*</span>
                </span>
                <input
                  type="number"
                  name="tenant_due_day"
                  min={1}
                  max={31}
                  className="tf-field bg-[#101114] text-white border-[#272839]"
                  value={form.payment_due_day}
                  onChange={(event) => setForm((current) => ({ ...current, payment_due_day: event.target.value }))}
                  required
                />
              </label>
              <FormInput
                label="Lease Start"
                type="text"
                name="tenant_lease_start"
                placeholder="DD/MM/YYYY"
                value={form.lease_start_date}
                onChange={(event) => setForm((current) => ({ ...current, lease_start_date: event.target.value }))}
              />
              <FormInput
                label="Lease End"
                type="text"
                name="tenant_lease_end"
                placeholder="DD/MM/YYYY"
                value={form.lease_end_date}
                onChange={(event) => setForm((current) => ({ ...current, lease_end_date: event.target.value }))}
              />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#C0C0C5]">Payment Status</span>
                <select
                  name="tenant_payment_status"
                  className="tf-field bg-[#101114] text-white border-[#272839]"
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

            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={busy || properties.length === 0}
                variant="primary"
                iconLeft={editingTenantId ? <Pencil className="h-4 w-4" /> : <UserRoundPlus className="h-4 w-4" />}
              >
                {editingTenantId ? 'Save Tenant' : 'Create Tenant'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="border-[#272839] bg-[#101114] text-[#C0C0C5] hover:bg-white/4"
              >
                {editingTenantId ? 'Cancel Edit' : 'Close Form'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {showOccupiedWarning ? (
        <Modal
          isOpen
          onClose={() => setShowOccupiedWarning(false)}
          title="Property Already Occupied"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15">
              <Building2 className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-sm text-[#C0C0C5]">
              The selected property already has an <span className="font-semibold text-white">active tenant</span>. Are you sure you want to add another tenant to this property?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowOccupiedWarning(false)}
                className="flex-1 rounded-xl border border-[#272839] px-4 py-2.5 text-sm font-medium text-[#8D8D96] transition-colors hover:bg-[#06070B] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOccupiedWarning(false)
                  void doSaveTenant()
                }}
                disabled={busy}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {tenantPendingDelete ? (
        <Modal
          isOpen
          onClose={() => setTenantPendingDelete(null)}
          title="Delete Tenant"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F25461]/15">
              <Trash2 className="h-5 w-5 text-[#F25461]" />
            </div>
            {error ? (
              <div className="rounded-xl border border-[#F25461]/30 bg-[#F25461]/15 px-4 py-3 text-sm text-red-600 text-left">
                {error}
              </div>
            ) : null}
            <p className="text-sm text-[#C0C0C5]">
              <span className="font-semibold text-white">{tenantPendingDelete.full_name}</span> will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTenantPendingDelete(null)}
                className="flex-1 rounded-xl border border-[#272839] px-4 py-2.5 text-sm font-medium text-[#8D8D96] transition-colors hover:bg-[#06070B] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={busy}
                className="flex-1 rounded-xl bg-[#F25461]/150 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {busy ? 'Deleting...' : 'Delete Tenant'}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}



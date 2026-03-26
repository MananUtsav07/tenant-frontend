import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
import { formatCurrency, formatDate, getCurrencyMarker } from '../../utils/date'

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

function getPaymentStatusStyle(status: Tenant['payment_status']) {
  switch (status) {
    case 'paid':
      return { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
    case 'overdue':
      return { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
    case 'partial':
      return { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' }
    case 'pending':
    default:
      return { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' }
  }
}

function getTenantStatusStyle(status: Tenant['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'terminated':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

// Tenant Detail Side Panel
type TenantDetailPanelProps = {
  tenant: Tenant
  propertyName: string
  currencyCode: string
  onClose: () => void
  onEdit: (tenant: Tenant) => void
  onDelete: (tenantId: string) => void
  busy: boolean
}

function TenantDetailPanel({ tenant, propertyName, currencyCode, onClose, onEdit, onDelete, busy }: TenantDetailPanelProps) {
  const payStyle = getPaymentStatusStyle(tenant.payment_status)
  const initials = tenant.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 32 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-lg border border-[#FED609]/15 overflow-hidden sticky top-6"
      >
        {/* Gold accent top */}
        <div className="h-1 bg-[#FED609] w-full" />

        {/* Header */}
        <div className="p-5 border-b border-[#FED609]/10 bg-[#FFFAE2]/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-['DM_Sans']">
              Tenant Details
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#FED609]/20 hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FED609]/20 border-2 border-[#FED609]/30 flex items-center justify-center text-sm font-bold text-[#1A1A1A] font-['Sora'] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-['Sora'] font-bold text-base text-[#1A1A1A] truncate">{tenant.full_name}</h3>
              <p className="text-xs text-[#6B7280] font-['Manrope'] truncate">{tenant.email ?? 'No email'}</p>
            </div>
          </div>
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${payStyle.badge}`}>
              {tenant.payment_status}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getTenantStatusStyle(tenant.status)}`}>
              {tenant.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Property / Unit */}
          <div>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 font-['DM_Sans']">Property / Unit</p>
            <p className="text-sm font-semibold text-[#1A1A1A] font-['Manrope']">{propertyName}</p>
          </div>

          {/* Rent & Due */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEFAEF] rounded-xl p-3 border border-[#FED609]/10">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 font-['DM_Sans']">Monthly Rent</p>
              <p className="text-base font-bold text-[#1A1A1A] font-['Sora']">
                {formatCurrency(tenant.monthly_rent, currencyCode)}
              </p>
            </div>
            <div className="bg-[#FEFAEF] rounded-xl p-3 border border-[#FED609]/10">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 font-['DM_Sans']">Next Due</p>
              <p className="text-sm font-bold text-[#1A1A1A] font-['Sora']">
                {formatDate(getNextDueDate(tenant.payment_due_day).toISOString())}
              </p>
            </div>
          </div>

          {/* Lease period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-0.5 font-['DM_Sans']">Lease Start</p>
              <p className="text-sm text-[#1A1A1A] font-['Manrope']">{formatDate(tenant.lease_start_date) || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-0.5 font-['DM_Sans']">Lease End</p>
              <p className="text-sm text-[#1A1A1A] font-['Manrope']">{formatDate(tenant.lease_end_date) || '—'}</p>
            </div>
          </div>

          {/* Contact */}
          {tenant.phone ? (
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-0.5 font-['DM_Sans']">Phone</p>
              <p className="text-sm text-[#1A1A1A] font-['Manrope']">{tenant.phone}</p>
            </div>
          ) : null}

          {/* Access ID */}
          <div>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-0.5 font-['DM_Sans']">Access ID</p>
            <p className="text-sm font-mono text-[#1A1A1A] bg-[#FEFAEF] rounded-lg px-3 py-1.5 border border-neutral-100 inline-block">
              {tenant.tenant_access_id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-[#FED609]/10 space-y-2">
          {/* Messaging */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold text-xs transition-colors font-['DM_Sans'] border border-[#25D366]/20"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 font-bold text-xs transition-colors font-['DM_Sans'] border border-[#0088cc]/20"
            >
              <Send className="h-4 w-4" />
              Telegram
            </button>
          </div>
          {/* Edit / View */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(tenant)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold text-xs transition-colors font-['DM_Sans'] shadow-sm"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <Button
              to={`/owner/tenants/${tenant.id}`}
              variant="outline"
              size="sm"
              className="flex-1 justify-center rounded-xl border-neutral-200 text-[#1A1A1A] py-2.5 font-['DM_Sans']"
              iconLeft={<Eye className="h-3.5 w-3.5" />}
            >
              View
            </Button>
            <button
              type="button"
              onClick={() => void onDelete(tenant.id)}
              disabled={busy}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function OwnerTenantsPage() {
  const { token, owner } = useOwnerAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [_brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [form, setForm] = useState(buildEmptyTenantForm)
  const [filterPropertyId, setFilterPropertyId] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
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
      if (selectedTenant?.id === tenantId) setSelectedTenant(null)
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

  const filteredTenants = filterPropertyId
    ? tenants.filter((t) => t.property_id === filterPropertyId)
    : tenants

  const getPropertyName = (propertyId: string) => {
    return properties.find((p) => p.id === propertyId)?.property_name ?? '-'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-['Sora'] text-[#1A1A1A]">Tenants</h2>
          <p className="text-[#6B7280] mt-1 font-['Manrope'] text-sm">
            Manage your residents and lease agreements across Dubai properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter by Property */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-[#FED609]/15 rounded-xl px-4 py-2.5 pr-9 text-sm font-medium focus:ring-2 focus:ring-[#FED609] focus:border-[#FED609] outline-none cursor-pointer text-[#1A1A1A] font-['DM_Sans'] shadow-sm"
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
            <ChevronRight className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-[#6B7280] rotate-90" />
          </div>

          {/* Add Tenant Button */}
          <button
            type="button"
            onClick={() => {
              setShowTenantForm(true)
              setEditingTenantId(null)
              setForm(buildEmptyTenantForm(properties[0]?.id ?? ''))
            }}
            className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-['DM_Sans'] text-sm"
          >
            <UserRoundPlus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#FED609]/10 shadow-sm p-5 hover:border-[#FED609]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">Total Tenants</p>
          <p className="text-3xl font-bold font-['Sora'] text-[#1A1A1A] mt-1.5">{tenants.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#FED609]/10 shadow-sm p-5 hover:border-[#FED609]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">Paid</p>
          <p className="text-3xl font-bold font-['Sora'] text-green-600 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#FED609]/10 shadow-sm p-5 hover:border-[#FED609]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">Pending</p>
          <p className="text-3xl font-bold font-['Sora'] text-orange-500 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#FED609]/10 shadow-sm p-5 hover:border-[#FED609]/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">Overdue</p>
          <p className="text-3xl font-bold font-['Sora'] text-red-600 mt-1.5">
            {tenants.filter((t) => t.payment_status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error ? <ErrorState message={error} /> : null}

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
        <div className={`flex gap-6 ${selectedTenant ? 'items-start' : ''}`}>
          {/* Tenants Table */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-[#FED609]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FED609] text-[#1A1A1A]">
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
                    const isSelected = selectedTenant?.id === tenant.id
                    return (
                      <tr
                        key={tenant.id}
                        onClick={() => setSelectedTenant(isSelected ? null : tenant)}
                        className={`border-b border-[#FED609]/5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#FFFAE2] border-l-2 border-l-[#FED609]'
                            : index % 2 === 0
                            ? 'bg-[#FEFAEF]/30 hover:bg-[#FFFAE2]/60'
                            : 'bg-white hover:bg-[#FFFAE2]/60'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#1A1A1A] truncate max-w-[140px]">{tenant.full_name}</p>
                          <p className="text-xs text-[#6B7280] truncate">{tenant.email ?? 'No email'}</p>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280] truncate max-w-[120px]">{getPropertyName(tenant.property_id)}</td>
                        <td className="px-5 py-4 text-[#6B7280] hidden md:table-cell">
                          {'—'}
                        </td>
                        <td className="px-5 py-4 text-[#6B7280] hidden lg:table-cell">{formatDate(tenant.lease_end_date)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${payStyle.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${payStyle.dot}`} />
                            {tenant.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              title="Send WhatsApp"
                              className="p-1.5 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Send Telegram"
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-500"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit tenant"
                              onClick={() => beginEdit(tenant)}
                              className="p-1.5 hover:bg-[#FED609]/20 rounded-lg transition-colors text-[#1A1A1A]"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete tenant"
                              onClick={() => void handleDelete(tenant.id)}
                              disabled={busy}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-500 disabled:opacity-40"
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
            <div className="px-5 py-4 bg-white border-t border-[#FED609]/10 flex justify-between items-center">
              <span className="text-xs text-[#6B7280] font-['DM_Sans']">
                Showing {filteredTenants.length} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#FED609]/15 text-[#6B7280] hover:bg-[#FED609] hover:text-[#1A1A1A] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FED609] text-[#1A1A1A] font-bold text-sm"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#FED609]/15 text-[#6B7280] hover:bg-[#FED609] hover:text-[#1A1A1A] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tenant Detail Panel */}
          {selectedTenant ? (
            <div className="w-80 shrink-0">
              <TenantDetailPanel
                tenant={selectedTenant}
                propertyName={getPropertyName(selectedTenant.property_id)}
                currencyCode={ownerCurrencyCode}
                onClose={() => setSelectedTenant(null)}
                onEdit={beginEdit}
                onDelete={handleDelete}
                busy={busy}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Tip */}
      {!loading && properties.length > 0 && tenants.length > 0 ? (
        <p className="text-xs text-[#6B7280] font-['DM_Sans']">
          Tip: click any row to view tenant details. Leave password blank while editing to keep the current password.
        </p>
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
      ) : null}
    </div>
  )
}

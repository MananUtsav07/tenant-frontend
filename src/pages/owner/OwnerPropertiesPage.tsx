import { motion } from 'framer-motion'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { Modal } from '../../components/common/Modal'
import { api } from '../../services/api'
import type { Property } from '../../types/api'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

function getStatusConfig(status: Property['occupancy_status']) {
  switch (status) {
    case 'occupied':
      return {
        label: 'Active',
        badgeClass: 'bg-[#FED609] text-[#1A1A1A]',
        borderClass: 'border-l-4 border-[#FED609]',
        unitBadgeClass: 'bg-[#FFFAE2] text-[#D4A800] border border-[#FED609]/20',
      }
    case 'vacant':
    case 'pre_vacant':
    case 'relisting_in_progress':
      return {
        label: 'Vacant',
        badgeClass: 'bg-neutral-200 text-neutral-600',
        borderClass: 'border-l-4 border-neutral-300',
        unitBadgeClass: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
      }
    default:
      return {
        label: 'Active',
        badgeClass: 'bg-[#FED609] text-[#1A1A1A]',
        borderClass: 'border-l-4 border-[#FED609]',
        unitBadgeClass: 'bg-[#FFFAE2] text-[#D4A800] border border-[#FED609]/20',
      }
  }
}

// Modal / Slide-over for Add/Edit Property
type PropertyFormProps = {
  form: { property_name: string; address: string; unit_number: string }
  editingPropertyId: string | null
  busy: boolean
  error: string | null
  onSubmit: (event: FormEvent) => void
  onChange: (field: string, value: string) => void
  onCancel: () => void
}

function PropertyFormModal({ form, editingPropertyId, busy, error, onSubmit, onChange, onCancel }: PropertyFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
      >
        {/* Gold top accent */}
        <div className="h-1.5 bg-[#FED609] w-full" />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-['Sora'] font-bold text-xl text-[#1A1A1A]">
                {editingPropertyId ? 'Edit Property' : 'Add New Property'}
              </h3>
              <p className="text-[#6B7280] text-sm mt-0.5">
                {editingPropertyId ? 'Update the details below.' : 'Fill in the details to list your property.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#FFFAE2] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                Property Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.property_name}
                onChange={(e) => onChange('property_name', e.target.value)}
                required
                autoComplete="off"
                placeholder="e.g. Skyview Penthouse"
                className="w-full rounded-xl border border-neutral-200 bg-[#FEFAEF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FED609] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => onChange('address', e.target.value)}
                required
                autoComplete="off"
                placeholder="e.g. Downtown, Building A"
                className="w-full rounded-xl border border-neutral-200 bg-[#FEFAEF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FED609] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                Unit Number <span className="text-[#6B7280] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.unit_number}
                onChange={(e) => onChange('unit_number', e.target.value)}
                autoComplete="off"
                placeholder="e.g. Unit 4402"
                className="w-full rounded-xl border border-neutral-200 bg-[#FEFAEF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FED609] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editingPropertyId ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    {busy ? 'Saving…' : 'Save Changes'}
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    {busy ? 'Creating…' : 'Add Property'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl border border-neutral-200 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FEFAEF] font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Delete confirmation modal
type DeleteConfirmProps = {
  propertyName: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ propertyName, busy, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <Modal isOpen onClose={onCancel} title="Delete Property" size="sm">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-sm text-[#4B5563]">
          <span className="font-semibold text-[#1A1A1A]">{propertyName}</span> will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#FEFAEF] hover:text-[#1A1A1A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {busy ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Single property card matching updated Stitch design
type PropertyCardProps = {
  property: Property
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
}

function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const { borderClass, unitBadgeClass } = getStatusConfig(property.occupancy_status)

  return (
    <motion.div
      variants={revealUp}
      className={`flex h-full flex-col rounded-[28px] border border-[#F1E4B8] bg-white p-6 shadow-[0_16px_45px_rgba(26,26,26,0.08)] ${borderClass}`}
    >
      <div className="flex h-full flex-col">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-['Sora'] text-2xl font-bold leading-tight text-[#1A1A1A]">
                {property.property_name}
              </h3>
              <p className="mt-3 flex items-center gap-2 font-['Manrope'] text-sm text-[#6B7280]">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#A08A57]" />
                <span className="truncate">{property.address}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(property)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E19D] bg-[#FFF9E7] text-[#1A1A1A]"
                title="Edit property"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(property)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500"
                title="Delete property"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {property.unit_number ? (
              <span className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${unitBadgeClass}`}>
                {property.unit_number}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton card for loading state
function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[28px] border border-[#F1E4B8] bg-white p-6 shadow-[0_16px_45px_rgba(26,26,26,0.08)] animate-pulse">
      <div className="flex flex-1 flex-col justify-between gap-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-2/3 rounded bg-neutral-100" />
              <div className="mt-3 h-4 w-3/4 rounded bg-neutral-100" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-full bg-neutral-100" />
              <div className="h-10 w-10 rounded-full bg-neutral-100" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <div className="h-10 w-24 rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function OwnerPropertiesPage() {
  const { token } = useOwnerAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    property_name: '',
    address: '',
    unit_number: '',
  })

  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Delete confirmation state
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  // Filter / search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const loadProperties = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerProperties(token)
      setProperties(response.properties)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadProperties()
  }, [loadProperties])

  const resetForm = () => {
    setForm({ property_name: '', address: '', unit_number: '' })
    setEditingPropertyId(null)
    setShowForm(false)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      setBusy(true)
      setError(null)

      if (editingPropertyId) {
        await api.updateOwnerProperty(token, editingPropertyId, {
          property_name: form.property_name,
          address: form.address,
          unit_number: form.unit_number || null,
        })
      } else {
        await api.createOwnerProperty(token, {
          property_name: form.property_name,
          address: form.address,
          unit_number: form.unit_number || undefined,
        })
      }

      resetForm()
      await loadProperties()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save property')
    } finally {
      setBusy(false)
    }
  }

  const beginEdit = (property: Property) => {
    setEditingPropertyId(property.id)
    setForm({
      property_name: property.property_name,
      address: property.address,
      unit_number: property.unit_number ?? '',
    })
    setShowForm(true)
    setError(null)
  }

  const beginDelete = (property: Property) => {
    setDeletingProperty(property)
  }

  const handleDelete = async () => {
    if (!token || !deletingProperty) {
      return
    }

    try {
      setBusy(true)
      await api.deleteOwnerProperty(token, deletingProperty.id)
      setDeletingProperty(null)
      await loadProperties()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete property')
      setDeletingProperty(null)
    } finally {
      setBusy(false)
    }
  }

  // Derive unique location fragments for filter
  const locationOptions = Array.from(
    new Set(properties.map((p) => p.address.split(',')[0]?.trim()).filter(Boolean))
  )

  // Filtered properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (p.occupancy_status === 'occupied' || !p.occupancy_status)) ||
      (statusFilter === 'vacant' &&
        (p.occupancy_status === 'vacant' ||
          p.occupancy_status === 'pre_vacant' ||
          p.occupancy_status === 'relisting_in_progress'))

    const matchesLocation =
      locationFilter === 'all' ||
      p.address.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesLocation
  })

  return (
    <div className="min-h-full bg-[#FEFAEF]">
      <div className="pt-6 pb-12 px-6 w-full">

        {/* Page Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="font-['Sora'] font-bold text-3xl text-[#1A1A1A] tracking-tight">Properties</h2>
              <p className="text-[#6B7280] font-['Manrope'] text-sm mt-1">
                Manage your real estate portfolio and track performance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 font-['DM_Sans']"
            >
              <PlusCircle className="h-5 w-5" />
              Add Property
            </button>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-4 border border-[#FFFAE2]"
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties or addresses..."
                className="w-full bg-[#FEFAEF] border border-neutral-100 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#FED609] focus:outline-none transition-all font-['Manrope']"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 bg-[#FEFAEF] px-4 py-2 rounded-lg border border-neutral-100 min-w-[200px]">
              <Filter className="h-4 w-4 text-[#6B7280] flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer w-full text-[#1A1A1A] outline-none font-['DM_Sans']"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="vacant">Vacant</option>
              </select>
            </div>

            {/* Location filter */}
            {locationOptions.length > 0 ? (
              <div className="flex items-center gap-2 bg-[#FEFAEF] px-4 py-2 rounded-lg border border-neutral-100 min-w-[200px]">
                <MapPin className="h-4 w-4 text-[#6B7280] flex-shrink-0" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer w-full text-[#1A1A1A] outline-none font-['DM_Sans']"
                >
                  <option value="all">Location: All Areas</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            ) : null}

          </motion.div>
        </div>

        {/* Error state */}
        {error && !showForm ? (
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="mb-6 rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            {error}
          </motion.div>
        ) : null}

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {/* Empty state */}
        {!loading && properties.length === 0 ? (
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#FFFAE2] flex items-center justify-center mb-6 border border-[#FED609]/20">
              <Building2 className="h-9 w-9 text-[#FED609]" />
            </div>
            <h3 className="font-['Sora'] font-bold text-xl text-[#1A1A1A] mb-2">No properties yet</h3>
            <p className="text-[#6B7280] text-sm max-w-xs mb-8 font-['Manrope']">
              Create your first property to onboard tenants and start tracking rent and support.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 font-['DM_Sans']"
            >
              <PlusCircle className="h-5 w-5" />
              Add Your First Property
            </button>
          </motion.div>
        ) : null}

        {/* No search results */}
        {!loading && properties.length > 0 && filteredProperties.length === 0 ? (
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Search className="h-10 w-10 text-[#6B7280] mb-4" />
            <h3 className="font-['Sora'] font-bold text-lg text-[#1A1A1A] mb-1">No results found</h3>
            <p className="text-[#6B7280] text-sm font-['Manrope']">Try adjusting your search or filters.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setLocationFilter('all') }}
              className="mt-4 text-[#D4A800] font-semibold text-sm hover:underline font-['DM_Sans']"
            >
              Clear filters
            </button>
          </motion.div>
        ) : null}

        {/* Property Grid */}
        {!loading && filteredProperties.length > 0 ? (
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            viewport={viewportOnce}
            className="grid grid-cols-1 gap-6 2xl:grid-cols-2"
          >
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={beginEdit}
                onDelete={beginDelete}
              />
            ))}
          </motion.div>
        ) : null}

        {/* Pagination */}
        {!loading && filteredProperties.length >= 9 ? (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#FFFAE2] hover:text-[#1A1A1A] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FED609] text-[#1A1A1A] font-bold shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] font-medium hover:bg-[#FFFAE2] transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] font-medium hover:bg-[#FFFAE2] transition-colors"
            >
              3
            </button>
            <span className="mx-1 text-[#6B7280]">...</span>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] font-medium hover:bg-[#FFFAE2] transition-colors"
            >
              {Math.ceil(filteredProperties.length / 9)}
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#FFFAE2] hover:text-[#1A1A1A] transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Add / Edit Property Modal */}
      {showForm ? (
        <PropertyFormModal
          form={form}
          editingPropertyId={editingPropertyId}
          busy={busy}
          error={error}
          onSubmit={(e) => void handleSubmit(e)}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onCancel={resetForm}
        />
      ) : null}

      {/* Delete Confirmation Modal */}
      {deletingProperty ? (
        <DeleteConfirmModal
          propertyName={deletingProperty.property_name}
          busy={busy}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeletingProperty(null)}
        />
      ) : null}
    </div>
  )
}

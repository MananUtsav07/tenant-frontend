import { motion } from 'framer-motion'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
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
        badgeClass: 'bg-[#32C382]/15 text-[#32C382]',
        borderClass: 'border-l-4 border-[#32C382]',
        unitBadgeClass: 'bg-[#141519] text-[#4E79FF] border border-[#4E79FF]/25',
      }
    case 'vacant':
    case 'pre_vacant':
    case 'relisting_in_progress':
      return {
        label: 'Vacant',
        badgeClass: 'bg-white/8 text-[#8D8D96]',
        borderClass: 'border-l-4 border-[#272839]',
        unitBadgeClass: 'bg-white/8 text-[#8D8D96] border border-[#272839]',
      }
    default:
      return {
        label: 'Vacant',
        badgeClass: 'bg-white/8 text-[#8D8D96]',
        borderClass: 'border-l-4 border-[#272839]',
        unitBadgeClass: 'bg-white/8 text-[#8D8D96] border border-[#272839]',
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
        className="relative w-full max-w-lg bg-[#101114] rounded-2xl shadow-2xl border border-[#272839] overflow-hidden"
      >
        {/* Gold top accent */}
        <div className="h-1.5 bg-[#4E79FF] w-full" />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-['Sora'] font-bold text-xl text-white">
                {editingPropertyId ? 'Edit Property' : 'Add New Property'}
              </h3>
              <p className="text-[#8D8D96] text-sm mt-0.5">
                {editingPropertyId ? 'Update the details below.' : 'Fill in the details to list your property.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8D8D96] hover:bg-white/4 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl bg-[#F25461]/15 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 font-['DM_Sans']">
                Property Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.property_name}
                onChange={(e) => onChange('property_name', e.target.value)}
                required
                autoComplete="off"
                placeholder="e.g. Skyview Penthouse"
                className="w-full rounded-xl border border-[#272839] bg-[#141519] px-4 py-3 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:ring-2 focus:ring-[#4E79FF] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 font-['DM_Sans']">
                Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => onChange('address', e.target.value)}
                required
                autoComplete="off"
                placeholder="e.g. Downtown, Building A"
                className="w-full rounded-xl border border-[#272839] bg-[#141519] px-4 py-3 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:ring-2 focus:ring-[#4E79FF] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 font-['DM_Sans']">
                Unit Number <span className="text-[#8D8D96] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.unit_number}
                onChange={(e) => onChange('unit_number', e.target.value)}
                autoComplete="off"
                placeholder="e.g. Unit 4402"
                className="w-full rounded-xl border border-[#272839] bg-[#141519] px-4 py-3 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:ring-2 focus:ring-[#4E79FF] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-[#4E79FF] hover:bg-[#3E68EE] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="px-5 py-3 rounded-xl border border-[#272839] text-[#8D8D96] hover:text-white hover:bg-[#06070B] font-medium text-sm transition-colors"
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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F25461]/15">
          <Trash2 className="h-5 w-5 text-[#F25461]" />
        </div>
        <p className="text-sm text-[#C0C0C5]">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{propertyName}</span>?
          This action cannot be undone.
        </p>
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          This will fail if tenants are still assigned to this property. Terminate or reassign them first.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#272839] px-4 py-2.5 text-sm font-medium text-[#8D8D96] transition-colors hover:bg-[#06070B] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete Property'}
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
      className={`flex flex-col rounded-2xl border border-[#272839] bg-[#101114] p-5 shadow-[0_16px_45px_rgba(26,26,26,0.08)] ${borderClass}`}
    >
      {/* Top row: name + action buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-['Sora'] text-lg font-bold leading-tight text-white truncate">
            {property.property_name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 font-['Manrope'] text-sm text-[#8D8D96]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A08A57]" />
            <span className="truncate">{property.address}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(property)}
            className="group flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-2.5 py-1.5 text-[#8D8D96] transition-all hover:border-[#4E79FF]/50 hover:bg-[#4E79FF]/10 hover:text-[#4E79FF] active:scale-95"
            title="Edit property"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold font-['DM_Sans']">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(property)}
            className="group flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-2.5 py-1.5 text-[#8D8D96] transition-all hover:border-[#F25461]/40 hover:bg-[#F25461]/10 hover:text-[#F25461] active:scale-95"
            title="Delete property"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold font-['DM_Sans']">Delete</span>
          </button>
        </div>
      </div>

      {/* Bottom row: unit badge + occupancy status */}
      {(property.unit_number || property.occupancy_status) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {property.unit_number ? (
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${unitBadgeClass}`}>
              {property.unit_number}
            </span>
          ) : null}
          {property.occupancy_status ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8D8D96]">
              {property.occupancy_status.replace(/_/g, ' ')}
            </span>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}

// Skeleton card for loading state
function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[28px] border border-[#272839] bg-[#101114] p-6 shadow-[0_16px_45px_rgba(26,26,26,0.08)] animate-pulse">
      <div className="flex flex-1 flex-col justify-between gap-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-2/3 rounded bg-white/8" />
              <div className="mt-3 h-4 w-3/4 rounded bg-white/8" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-full bg-white/8" />
              <div className="h-10 w-10 rounded-full bg-white/8" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <div className="h-10 w-24 rounded-full bg-white/8" />
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

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
    } finally {
      setBusy(false)
    }
  }

  // Filtered properties
  const filteredProperties = properties.filter((p) =>
    searchQuery === '' ||
    p.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-full bg-[#06070B]">
      <div className="pt-6 pb-12 px-6 w-full">

        {/* Page Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h2 className="font-['Sora'] font-bold text-3xl text-white tracking-tight">Properties</h2>
              <p className="text-[#8D8D96] font-['Manrope'] text-sm mt-1">
                Manage your real estate portfolio and track performance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-[#4E79FF] hover:bg-[#3E68EE] text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 font-['DM_Sans'] text-sm w-full sm:w-auto justify-center shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
              Add Property
            </button>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="bg-[#101114] p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-4 border border-[#272839]"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8D96]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties or addresses..."
                className="w-full bg-[#06070B] border border-[#272839] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#8D8D96] focus:ring-2 focus:ring-[#4E79FF] focus:outline-none transition-all font-['Manrope']"
              />
            </div>

          </motion.div>
        </div>

        {/* Error state */}
        {error && !showForm ? (
          <motion.div
            variants={revealUp}
            initial="hidden"
            animate="show"
            className="mb-6 rounded-xl bg-[#F25461]/15 border border-red-100 px-5 py-4 text-sm text-red-600 flex items-center gap-3"
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
            <div className="w-20 h-20 rounded-2xl bg-[#141519] flex items-center justify-center mb-6 border border-[#4E79FF]/25">
              <Building2 className="h-9 w-9 text-[#4E79FF]" />
            </div>
            <h3 className="font-['Sora'] font-bold text-xl text-white mb-2">No properties yet</h3>
            <p className="text-[#8D8D96] text-sm max-w-xs mb-8 font-['Manrope']">
              Create your first property to onboard tenants and start tracking rent and support.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-[#4E79FF] hover:bg-[#3E68EE] text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 font-['DM_Sans']"
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
            <Search className="h-10 w-10 text-[#8D8D96] mb-4" />
            <h3 className="font-['Sora'] font-bold text-lg text-white mb-1">No results found</h3>
            <p className="text-[#8D8D96] text-sm font-['Manrope']">Try adjusting your search.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[#4E79FF] font-semibold text-sm hover:underline font-['DM_Sans']"
            >
              Clear search
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
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#8D8D96] hover:bg-white/4 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#2251E3] text-white font-bold shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium hover:bg-[#141519] transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium hover:bg-[#141519] transition-colors"
            >
              3
            </button>
            <span className="mx-1 text-[#8D8D96]">...</span>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium hover:bg-[#141519] transition-colors"
            >
              {Math.ceil(filteredProperties.length / 9)}
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#8D8D96] hover:bg-white/4 hover:text-white transition-colors"
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



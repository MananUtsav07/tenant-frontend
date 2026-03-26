import { motion } from 'framer-motion'
import {
  ArrowRight,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { Property } from '../../types/api'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

// Stitch design images for property cards (rotate through for real data)
const PROPERTY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuOh6Ghq5qV_ZHhNV_nlpsLMA0w20wiGhgZdjGy0LPWBgTLDj0f_fi7owZe-HD6iVEwQcC-sjmctxKOSL0ey2AtJdmwkrMTo0KoBhqAMQT4DbkL_Os7S34MLTC62UHRCb1OGK7TuEVziVXmN09fHRUD_3_4k1phiOqesjx5D5TQfneGUGWSJObn7dP03vt6bP2lr1PpMbvIaY7WJiK19aRJa1qgY19M3nhXJbnC5USfd5FIJsVOsxGlh2qRpvxMwYXmBlCZ5fuK_1q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7S2XZsu66OeHiAzcIKmfHOr3hP37QPcgJh8sr2MLvc3EouQFRk1yaJj8cIvd3Y4mNVX58gyAE6-xIA_H2hsffhGcJ5IHd-miEgxHnMxayGQ9cVuZXgMhbg3Q0ual2gwbW4objBu07-8bazTegy7GU7QKwBSZorJ-hOnZTy2TCC5SRfGGLEEM_CtfxDn3u9Kx_7MXUTaeMEx9J5RIwuwd8-zy80b_fM3Kr1H4zQCM20HgQ1WAw3aU0NDANGSKMm2N6-U9ZHhRYe8yM',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA08hlFZko0q43wOXDctQ0NL076gl4qRZBmxx_3qZlFpcsq0orONAE-1ml-w2zMb7GgO_6riT4SwqRYlHR_SJFWnD_xMTZ1cFQzdXQ6w_-8h1NPUC1U4oCVqrJspMDz-41BB7g5FOPQh04CbQ34-X0A-NpcOepffBzh-RUcOr9BDymq0PzlmLJzKmBLt8Nx4qCXGYRWux55EnZxkO19sIFVoVCnyaMagvHSSGqDB4ED5HBi-PozjfJU-LnLa2wFofE4Faf2hUjuX2IF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl1LE1DxVdZCWnTcnshShc82OO1bSH7-M5lNrUnPuc1aCNph21Tth6Ox_nzL3lAnWF43EkSJigOf8t9wYfLvKt21s5tZG0D8BebQBCHRACYzErBIwqeBXsU4PJgniJk9flnItgwvwrpss3cvjncQLR9in7ahp9EwAo_qQjaVjPPp-F_7-5E9LoZidbofezUdUg3aemAGcUYnaoxjGg0joxG_uJnhvKf06LuIuJU90p5J9je6xn9rB8_B84iZ9pRzjJqOS8uPTpSfdv',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjv_jFj40ez08ynQz_TvpmwwwRsEX7drkUjvLnj-FOK6ijAx1JNQPONLfjh7IcrPmCQyaWdPf5O8CbU-LitoaUqsXwuZXFcngjfu1IqrWrHYMhhEdWO6O1tPhGA3dNFOQqlXkElYoTG0OtadJBfnSXIz7JegLP2FNDEZWgQbw2ojAx0kuTfFQ48dytr_QUukRsYQtZ1Jmms4Yf0mXC7RjIBVzBAPKdeMSjyWwfxmZ_SGDq96v0BOQOQoUAlbBMjEKWBrangpqN1py8',
]

function getPropertyImage(index: number): string {
  return PROPERTY_IMAGES[index % PROPERTY_IMAGES.length]
}

function getStatusConfig(status: Property['occupancy_status']) {
  switch (status) {
    case 'occupied':
      return { label: 'Active', badgeClass: 'bg-[#FED609] text-[#1A1A1A]', borderClass: 'border-l-[#FED609]' }
    case 'vacant':
    case 'pre_vacant':
    case 'relisting_in_progress':
      return { label: 'Vacant', badgeClass: 'bg-neutral-200 text-neutral-600', borderClass: 'border-l-neutral-300' }
    default:
      return { label: 'Active', badgeClass: 'bg-[#FED609] text-[#1A1A1A]', borderClass: 'border-l-[#FED609]' }
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
                placeholder="e.g. Dubai Marina, Marina Gate 1"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-100 p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="font-['Sora'] font-bold text-lg text-[#1A1A1A] mb-2">Delete Property?</h3>
        <p className="text-[#6B7280] text-sm mb-6">
          <span className="font-semibold text-[#1A1A1A]">{propertyName}</span> will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FEFAEF] font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors active:scale-95 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Single property card matching Stitch design
type PropertyCardProps = {
  property: Property
  index: number
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
}

function PropertyCard({ property, index, onEdit, onDelete }: PropertyCardProps) {
  const { label, badgeClass, borderClass } = getStatusConfig(property.occupancy_status)
  const isVacant = label === 'Vacant'
  const imageUrl = getPropertyImage(index)

  return (
    <motion.div
      variants={revealUp}
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 ${borderClass} group overflow-hidden flex flex-col`}
    >
      {/* Card Image */}
      <div className="relative h-48 bg-[#FEFAEF] flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={property.property_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`${badgeClass} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
            {label}
          </span>
        </div>
        {/* Action buttons overlay */}
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={() => onEdit(property)}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#FED609] transition-all shadow-sm"
            title="Edit property"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(property)}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            title="Delete property"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-['Sora'] font-bold text-lg text-[#1A1A1A] group-hover:text-[#D4A800] transition-colors leading-tight">
            {property.property_name}
          </h3>
          {property.unit_number ? (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ml-2 ${
                isVacant
                  ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  : 'bg-[#FFFAE2] text-[#D4A800] border-[#FED609]/20'
              }`}
            >
              {property.unit_number}
            </span>
          ) : null}
        </div>

        <p className="text-[#6B7280] text-sm flex items-center gap-1 mb-4">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{property.address}</span>
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-auto py-4 border-t border-neutral-50">
          <div className="flex items-center gap-2">
            <Users className={`h-5 w-5 ${isVacant ? 'text-neutral-300' : 'text-[#FED609]'}`} />
            <span className={`text-sm font-bold ${isVacant ? 'text-neutral-400' : 'text-[#1A1A1A]'}`}>
              {isVacant ? '00 Tenants' : 'Active'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-[#FED609]" />
            <span className="text-sm font-bold text-[#1A1A1A]">Property</span>
          </div>
        </div>

        {/* View Details link */}
        <button
          type="button"
          onClick={() => onEdit(property)}
          className="mt-4 text-[#FED609] font-bold text-sm flex items-center justify-center gap-2 group/link hover:text-[#D4A800] transition-colors"
        >
          Edit Details
          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}

// Skeleton card for loading state
function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-neutral-100 overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-neutral-100" />
      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-5 bg-neutral-100 rounded w-2/3" />
          <div className="h-5 bg-neutral-100 rounded w-16" />
        </div>
        <div className="h-4 bg-neutral-100 rounded w-3/4" />
        <div className="h-px bg-neutral-50 mt-2" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 bg-neutral-100 rounded w-20" />
          <div className="h-4 bg-neutral-100 rounded w-16" />
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

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-full bg-[#FEFAEF]">
      {/* Page Content */}
      <div className="pt-6 pb-12 px-6 max-w-7xl mx-auto">

        {/* Page Header */}
        <motion.div
          variants={revealUp}
          initial="hidden"
          animate="show"
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="font-['Sora'] font-bold text-3xl text-[#1A1A1A] tracking-tight">Properties</h2>
            <p className="text-[#6B7280] font-['Manrope'] text-sm mt-1">
              Manage your Dubai real estate portfolio and track performance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
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
          className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-4 border border-[#FFFAE2] mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties or addresses..."
              className="w-full bg-[#FEFAEF] border border-neutral-100 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#FED609] focus:outline-none transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-[#FEFAEF] px-4 py-2.5 rounded-lg border border-neutral-100 min-w-[180px]">
            <Filter className="h-4 w-4 text-[#6B7280]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer w-full text-[#1A1A1A] outline-none"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>

          {/* Recent activity button */}
          <button
            type="button"
            className="ml-auto text-[#6B7280] hover:text-[#1A1A1A] flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <History className="h-4 w-4" />
            Recent Activity
          </button>
        </motion.div>

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

        {/* Loading state — skeleton grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
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
            <p className="text-[#6B7280] text-sm max-w-xs mb-8">
              Create your first property to onboard tenants and start tracking rent and support.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
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
            <p className="text-[#6B7280] text-sm">Try adjusting your search or filter.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
              className="mt-4 text-[#D4A800] font-semibold text-sm hover:underline"
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onEdit={beginEdit}
                onDelete={beginDelete}
              />
            ))}
          </motion.div>
        ) : null}

        {/* Pagination (shown only when there are enough properties) */}
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
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FED609] text-[#1A1A1A] font-bold"
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

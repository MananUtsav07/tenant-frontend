import { Building2, Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { Property } from '../../types/api'
import { formatDateTime } from '../../utils/date'
import { exportToCsv } from '../../utils/export'

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
  }

  const handleDelete = async (propertyId: string) => {
    if (!token) {
      return
    }

    try {
      setBusy(true)
      await api.deleteOwnerProperty(token, propertyId)
      await loadProperties()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete property')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="ph-page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="ph-page-header">
          <h2 className="ph-page-heading">Properties</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(83,88,100,0.3)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--ph-text-muted)]">
            <Building2 className="h-3.5 w-3.5 text-[var(--ph-accent)]" />
            {properties.length} total
          </span>
          {properties.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconLeft={<Download className="h-3.5 w-3.5" />}
              onClick={() =>
                exportToCsv(
                  'properties.csv',
                  ['Name', 'Address', 'Unit', 'Created'],
                  properties.map((p) => [p.property_name, p.address, p.unit_number ?? '', formatDateTime(p.created_at)]),
                )
              }
            >
              Export CSV
            </Button>
          ) : null}
          <Button type="button" onClick={() => setShowForm(true)} variant="secondary" size="sm" iconLeft={<Plus className="h-4 w-4" />}>
            Add Property
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showForm || !!editingPropertyId}
        onClose={() => { resetForm(); setShowForm(false) }}
        title={editingPropertyId ? 'Edit Property' : 'Add Property'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[var(--ph-text-muted)]">Keep the core property setup focused before tenants and workflows attach to it.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormInput
              label="Property Name"
              name="property_name"
              autoComplete="off"
              value={form.property_name}
              onChange={(event) => setForm((current) => ({ ...current, property_name: event.target.value }))}
              required
            />
            <FormInput
              label="Address"
              name="property_address"
              autoComplete="off"
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              required
            />
            <FormInput
              label="Unit Number"
              name="property_unit_number"
              autoComplete="off"
              value={form.unit_number}
              onChange={(event) => setForm((current) => ({ ...current, unit_number: event.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={busy}
              variant="secondary"
              iconLeft={editingPropertyId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            >
              {editingPropertyId ? 'Save Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </Modal>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading properties..." rows={4} /> : null}

      {!loading && properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Create your first property to onboard tenants and start tracking rent and support."
          icon={<Building2 className="h-5 w-5" />}
          actionLabel="Add Property"
          onAction={() => setShowForm(true)}
        />
      ) : null}

      {!loading && properties.length > 0 ? (
        <DataTable headers={['Property', 'Address', 'Created', 'Actions']}>
          {properties.map((property) => (
            <tr key={property.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-[var(--ph-text)]">{property.property_name}</p>
                <p className="text-xs text-[var(--ph-text-muted)]">{property.unit_number || 'No unit'}</p>
              </td>
              <td className="px-4 py-3 text-[var(--ph-text-soft)]">{property.address}</td>
              <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(property.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => beginEdit(property)}
                    variant="outline"
                    size="sm"
                    iconLeft={<Pencil className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleDelete(property.id)}
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


    </section>
  )
}

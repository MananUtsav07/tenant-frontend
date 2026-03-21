import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Briefcase, Pencil, Trash2, UserRoundPlus } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { Broker } from '../../types/api'
import { formatDateTime } from '../../utils/date'

function buildEmptyBrokerForm() {
  return {
    full_name: '',
    email: '',
    phone: '',
    agency_name: '',
    notes: '',
    is_active: true,
  }
}

export function OwnerBrokersPage() {
  const { token } = useOwnerAuth()
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBrokerId, setEditingBrokerId] = useState<string | null>(null)
  const [form, setForm] = useState(buildEmptyBrokerForm())

  const loadBrokers = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerBrokers(token)
      setBrokers(response.brokers)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load brokers')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadBrokers()
  }, [loadBrokers])

  const resetForm = () => {
    setForm(buildEmptyBrokerForm())
    setEditingBrokerId(null)
    setShowForm(false)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      agency_name: form.agency_name.trim() || undefined,
      notes: form.notes.trim() || undefined,
      is_active: form.is_active,
    }

    if (!payload.full_name) {
      setError('Broker name is required')
      return
    }
    if (!payload.email) {
      setError('Broker email is required')
      return
    }

    try {
      setBusy(true)
      setError(null)
      if (editingBrokerId) {
        await api.updateOwnerBroker(token, editingBrokerId, payload)
      } else {
        await api.createOwnerBroker(token, payload)
      }
      await loadBrokers()
      resetForm()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save broker')
    } finally {
      setBusy(false)
    }
  }

  const handleEdit = (broker: Broker) => {
    setEditingBrokerId(broker.id)
    setForm({
      full_name: broker.full_name,
      email: broker.email,
      phone: broker.phone ?? '',
      agency_name: broker.agency_name ?? '',
      notes: broker.notes ?? '',
      is_active: broker.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (brokerId: string) => {
    if (!token) {
      return
    }

    const confirmed = window.confirm('Delete this broker? Assigned tenants will be unassigned.')
    if (!confirmed) {
      return
    }

    try {
      setError(null)
      await api.deleteOwnerBroker(token, brokerId)
      await loadBrokers()
      if (editingBrokerId === brokerId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete broker')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
            <Briefcase className="h-6 w-6 text-[var(--ph-accent)]" />
            Brokers
          </h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
            Manage broker directory and assign brokers while creating or updating tenants.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setShowForm(true)}
        >
          <UserRoundPlus className="h-4 w-4" />
          Add Broker
        </Button>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading brokers..." rows={4} /> : null}

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingBrokerId ? 'Edit Broker' : 'Add Broker'}
        size="md"
      >
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="Broker Name"
              name="broker_full_name"
              value={form.full_name}
              onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
              required
            />
            <FormInput
              label="Email"
              type="email"
              name="broker_email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <FormInput
              label="Phone"
              name="broker_phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <FormInput
              label="Agency"
              name="broker_agency"
              value={form.agency_name}
              onChange={(event) => setForm((current) => ({ ...current, agency_name: event.target.value }))}
            />
          </div>
          <FormInput
            label="Notes"
            name="broker_notes"
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
          <label className="inline-flex items-center gap-2 text-sm text-[var(--ph-text-soft)]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Broker is active
          </label>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? 'Saving...' : editingBrokerId ? 'Save Broker' : 'Create Broker'}
            </Button>
          </div>
        </form>
      </Modal>

      {!loading && brokers.length === 0 ? (
        <EmptyState
          title="No brokers yet"
          description="Create your first broker and then assign them while adding tenants."
          icon={<Briefcase className="h-5 w-5" />}
        />
      ) : null}

      {!loading && brokers.length > 0 ? (
        <DataTable headers={['Broker', 'Contact', 'Agency', 'Status', 'Created', 'Actions']}>
          {brokers.map((broker) => (
            <tr key={broker.id} className="border-t border-[var(--ph-line)]">
              <td className="px-4 py-3">
                <p className="font-medium text-[var(--ph-text)]">{broker.full_name}</p>
                <p className="text-xs text-[var(--ph-text-muted)]">{broker.email}</p>
              </td>
              <td className="px-4 py-3 text-[var(--ph-text-soft)]">{broker.phone || '-'}</td>
              <td className="px-4 py-3 text-[var(--ph-text-soft)]">{broker.agency_name || '-'}</td>
              <td className="px-4 py-3 text-[var(--ph-text-soft)]">{broker.is_active ? 'Active' : 'Inactive'}</td>
              <td className="px-4 py-3 text-[var(--ph-text-soft)]">{formatDateTime(broker.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(broker)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(broker.id)}>
                    <Trash2 className="h-4 w-4 text-rose-400" />
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

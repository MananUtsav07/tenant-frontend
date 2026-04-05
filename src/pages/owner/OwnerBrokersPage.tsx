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
import type { Broker, Tenant } from '../../types/api'
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
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBrokerId, setEditingBrokerId] = useState<string | null>(null)
  const [brokerPendingDelete, setBrokerPendingDelete] = useState<Broker | null>(null)
  const [form, setForm] = useState(buildEmptyBrokerForm())

  const loadBrokers = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const [brokerResponse, tenantResponse] = await Promise.all([
        api.getOwnerBrokers(token),
        api.getOwnerTenants(token),
      ])
      setBrokers(brokerResponse.brokers)
      setTenants(tenantResponse.tenants)
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

  const handleDelete = async () => {
    if (!token || !brokerPendingDelete) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.deleteOwnerBroker(token, brokerPendingDelete.id)
      await loadBrokers()
      if (editingBrokerId === brokerPendingDelete.id) {
        resetForm()
      }
      setBrokerPendingDelete(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete broker')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6 min-h-screen bg-[#06070B] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-white">
            <Briefcase className="h-6 w-6 text-[#4E79FF]" />
            Brokers
          </h2>
          <p className="mt-2 text-sm text-[#8D8D96]">
            Manage broker directory and assign brokers while creating or updating tenants.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          iconLeft={<UserRoundPlus className="h-4 w-4" />}
          onClick={() => setShowForm(true)}
        >
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
          <label className="inline-flex items-center gap-2 text-sm text-[#C0C0C5]">
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
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {brokers.map((broker) => {
              const assignedTenants = tenants.filter((t) => t.broker_id === broker.id)
              return (
                <div key={broker.id} className="rounded-xl bg-[#101114] border border-[#272839] p-4 space-y-3">
                  {/* Name + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-white font-['Sora'] truncate">{broker.full_name}</p>
                      <p className="text-xs text-[#8D8D96] truncate mt-0.5">{broker.email}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(broker)}
                        className="flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-2.5 py-1.5 text-xs font-semibold text-[#8D8D96] hover:border-[#4E79FF]/50 hover:text-[#4E79FF] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrokerPendingDelete(broker)}
                        className="flex items-center gap-1 rounded-lg border border-[#272839] bg-[#141519] px-2.5 py-1.5 text-xs font-semibold text-[#8D8D96] hover:border-[#F25461]/40 hover:text-[#F25461] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8D8D96]">
                    {broker.phone && <span>📞 {broker.phone}</span>}
                    {broker.agency_name && <span>🏢 {broker.agency_name}</span>}
                    <span className={`font-semibold ${broker.is_active ? 'text-[#32C382]' : 'text-[#F25461]'}`}>
                      {broker.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Assigned tenants */}
                  {assignedTenants.length > 0 ? (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8D8D96] mb-1.5">Assigned Tenants</p>
                      <div className="flex flex-wrap gap-1">
                        {assignedTenants.map((t) => (
                          <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-[#141519] border border-[#4E79FF]/30 px-2 py-0.5 text-[10px] font-semibold text-[#4E79FF]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#4E79FF] shrink-0" />
                            {t.full_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8D8D96]">No tenants assigned</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <DataTable headers={['Broker', 'Contact', 'Agency', 'Status', 'Created', 'Actions']}>
              {brokers.map((broker) => {
                const assignedTenants = tenants.filter((t) => t.broker_id === broker.id)
                return (
                  <tr key={broker.id} className="border-t border-[#272839]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{broker.full_name}</p>
                      <p className="text-xs text-[#8D8D96]">{broker.email}</p>
                      {assignedTenants.length > 0 ? (
                        <div className="mt-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1">Assigned Tenants</p>
                          <div className="flex flex-wrap gap-1">
                            {assignedTenants.map((t) => (
                              <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-[#141519] border border-[#4E79FF]/30 px-2 py-0.5 text-[10px] font-semibold text-[#4E79FF]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#4E79FF] shrink-0" />
                                {t.full_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-[10px] text-[#9CA3AF]">No tenants assigned</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#C0C0C5]">{broker.phone || '-'}</td>
                    <td className="px-4 py-3 text-[#C0C0C5]">{broker.agency_name || '-'}</td>
                    <td className="px-4 py-3 text-[#C0C0C5]">{broker.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3 text-[#C0C0C5]">{formatDateTime(broker.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleEdit(broker)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D8D96] transition-colors hover:bg-white/4 hover:text-white">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setBrokerPendingDelete(broker)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#F25461] transition-colors hover:bg-[#F25461]/15">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </DataTable>
          </div>
        </>
      ) : null}

      {brokerPendingDelete ? (
        <Modal
          isOpen
          onClose={() => setBrokerPendingDelete(null)}
          title="Delete Broker"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F25461]/15">
              <Trash2 className="h-5 w-5 text-[#F25461]" />
            </div>
            {error ? (
              <div className="rounded-xl border border-[#F25461]/30 bg-[#F25461]/15 px-4 py-3 text-sm text-red-600 text-left">{error}</div>
            ) : null}
            <p className="text-sm text-[#C0C0C5]">
              <span className="font-semibold text-white">{brokerPendingDelete.full_name}</span> will be permanently removed. Assigned tenants will be unassigned. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBrokerPendingDelete(null)}
                className="flex-1 rounded-xl border border-[#272839] px-4 py-2.5 text-sm font-medium text-[#8D8D96] transition-colors hover:bg-[#141519] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete()}
                className="flex-1 rounded-xl bg-[#F25461]/150 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {busy ? 'Deleting...' : 'Delete Broker'}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}


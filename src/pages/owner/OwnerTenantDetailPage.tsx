import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Calendar, CreditCard, Eye, FileText, Hash, Home, Mail, Pencil, Phone, Trash2, Upload, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketTable } from '../../components/common/TicketTable'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TenantDocument, TenantTicket } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

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

type TenantDetailResponse = {
  tenant: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    tenant_access_id: string
    lease_start_date: string | null
    lease_end_date: string | null
    monthly_rent: number
    payment_due_day: number
    payment_status: string
    status: string
    properties?: {
      property_name: string
      address: string
      unit_number: string | null
    }
  }
  tickets: TenantTicket[]
  reminders: Array<{
    id: string
    reminder_type: string
    scheduled_for: string
    sent_at: string | null
    status: string
  }>
}

type DocumentFormState = {
  document_name: string
  document_type: TenantDocument['document_type']
  notes: string
}

const initialDocumentForm: DocumentFormState = {
  document_name: '',
  document_type: 'other',
  notes: '',
}

function formatDocumentType(type: TenantDocument['document_type']) {
  return type.replaceAll('_', ' ')
}

function formatBytes(value: number | null) {
  if (!value) return '-'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function InfoField({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-['DM_Sans'] text-[10px] font-semibold uppercase tracking-widest text-[#8D8D96]">{label}</p>
      <div className="flex items-center gap-2 font-['Manrope'] text-sm font-medium text-white">
        {icon ? <span className="shrink-0 text-[#4E79FF]">{icon}</span> : null}
        {value}
      </div>
    </div>
  )
}

export function OwnerTenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token, owner } = useOwnerAuth()
  const [detail, setDetail] = useState<TenantDetailResponse | null>(null)
  const [documents, setDocuments] = useState<TenantDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [documentMode, setDocumentMode] = useState<'create' | 'edit'>('create')
  const [documentBusy, setDocumentBusy] = useState(false)
  const [documentForm, setDocumentForm] = useState<DocumentFormState>(initialDocumentForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingDocument, setEditingDocument] = useState<TenantDocument | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadDocuments = useCallback(async () => {
    if (!token || !id) return
    const response = await api.getOwnerTenantDocuments(token, id)
    setDocuments(response.documents)
  }, [id, token])

  const loadDetail = useCallback(async () => {
    if (!token || !id) return
    try {
      setError(null)
      const [detailResponse, documentResponse] = await Promise.all([
        api.getOwnerTenantDetail(token, id),
        api.getOwnerTenantDocuments(token, id),
      ])
      setDetail({ tenant: detailResponse.tenant, tickets: detailResponse.tickets, reminders: detailResponse.reminders })
      setDocuments(documentResponse.documents)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const tenantContact = useMemo(
    () => ({ email: detail?.tenant.email || '-', phone: detail?.tenant.phone || '-' }),
    [detail],
  )

  const leaseRange = useMemo(() => {
    if (!detail) return '-'
    const start = detail.tenant.lease_start_date
    const end = detail.tenant.lease_end_date
    if (!start && !end) return '-'
    return `${formatDate(start)} -> ${formatDate(end)}`
  }, [detail])

  const resetDocumentModal = useCallback(() => {
    setDocumentModalOpen(false)
    setDocumentMode('create')
    setDocumentBusy(false)
    setDocumentError(null)
    setDocumentForm(initialDocumentForm)
    setSelectedFile(null)
    setEditingDocument(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openCreateDocumentModal = useCallback(() => {
    setDocumentMode('create')
    setDocumentError(null)
    setDocumentForm(initialDocumentForm)
    setSelectedFile(null)
    setEditingDocument(null)
    setDocumentModalOpen(true)
  }, [])

  const openEditDocumentModal = useCallback((document: TenantDocument) => {
    setDocumentMode('edit')
    setEditingDocument(document)
    setDocumentError(null)
    setDocumentForm({
      document_name: document.document_name,
      document_type: document.document_type,
      notes: document.notes ?? '',
    })
    setSelectedFile(null)
    setDocumentModalOpen(true)
  }, [])

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null)
  }, [])

  const uploadSelectedFile = useCallback(async () => {
    if (!token || !id || !selectedFile) {
      return null
    }

    const uploadResponse = await api.createOwnerTenantDocumentUploadUrl(token, id, {
      file_name: selectedFile.name,
      mime_type: selectedFile.type || 'application/octet-stream',
    })

    const result = await fetch(uploadResponse.upload.upload_url, {
      method: 'PUT',
      headers: uploadResponse.upload.headers,
      body: selectedFile,
    })

    if (!result.ok) {
      throw new Error('File upload to S3 failed')
    }

    return {
      file_name: selectedFile.name,
      storage_path: uploadResponse.upload.storage_path,
      public_url: uploadResponse.upload.public_url,
      mime_type: selectedFile.type || 'application/octet-stream',
      file_size_bytes: selectedFile.size,
    }
  }, [id, selectedFile, token])

  const handleDocumentSubmit = useCallback(async () => {
    if (!token || !id) return
    if (documentMode === 'create' && !selectedFile) {
      setDocumentError('Please choose a file to upload.')
      return
    }

    try {
      setDocumentBusy(true)
      setDocumentError(null)

      const uploadedFile = await uploadSelectedFile()

      if (documentMode === 'create') {
        await api.createOwnerTenantDocument(token, id, {
          document_name: documentForm.document_name.trim(),
          document_type: documentForm.document_type,
          file_name: uploadedFile?.file_name ?? '',
          storage_path: uploadedFile?.storage_path ?? null,
          public_url: uploadedFile?.public_url ?? null,
          mime_type: uploadedFile?.mime_type ?? null,
          file_size_bytes: uploadedFile?.file_size_bytes ?? null,
          notes: documentForm.notes.trim() || null,
        })
      } else if (editingDocument) {
        const patch: Parameters<typeof api.updateOwnerTenantDocument>[3] = {
          document_name: documentForm.document_name.trim(),
          document_type: documentForm.document_type,
          notes: documentForm.notes.trim() || null,
        }

        if (uploadedFile) {
          patch.file_name = uploadedFile.file_name
          patch.storage_path = uploadedFile.storage_path
          patch.public_url = uploadedFile.public_url
          patch.mime_type = uploadedFile.mime_type
          patch.file_size_bytes = uploadedFile.file_size_bytes
        }

        await api.updateOwnerTenantDocument(token, id, editingDocument.id, patch)
      }

      await loadDocuments()
      resetDocumentModal()
    } catch (submitError) {
      setDocumentError(submitError instanceof Error ? submitError.message : 'Failed to save document')
      setDocumentBusy(false)
    }
  }, [documentForm, documentMode, editingDocument, id, loadDocuments, resetDocumentModal, selectedFile, token, uploadSelectedFile])

  const handleDeleteDocument = useCallback(async (document: TenantDocument) => {
    if (!token || !id) return
    const confirmed = window.confirm(`Delete "${document.document_name}"?`)
    if (!confirmed) return

    try {
      setDocumentError(null)
      await api.deleteOwnerTenantDocument(token, id, document.id)
      await loadDocuments()
    } catch (deleteError) {
      setDocumentError(deleteError instanceof Error ? deleteError.message : 'Failed to delete document')
    }
  }, [id, loadDocuments, token])

  return (
    <div className="min-h-screen w-full space-y-6 bg-[#06070B] p-4 sm:p-6">
      <motion.div variants={revealUp} initial="hidden" animate="show" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Tenant Detail</h1>
          <p className="mt-1 font-['Manrope'] text-sm font-medium text-[#8D8D96]">
            Lease, ticket, reminder, and document details for this tenant.
          </p>
        </div>
        <Button
          to={ROUTES.ownerTenants}
          variant="outline"
          size="sm"
          iconLeft={<ArrowLeft className="h-4 w-4" />}
          className="self-start border-[#272839] bg-[#101114] text-[#8D8D96] hover:border-[#4E79FF]/40 hover:text-white sm:self-auto"
        >
          Back to tenants
        </Button>
      </motion.div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant detail..." rows={5} /> : null}

      {!loading && detail ? (
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-8">
          <motion.div
            variants={revealUp}
            whileInView="show"
            viewport={viewportOnce}
            className="rounded-xl border border-[#272839] bg-[#101114] p-4 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4E79FF]/15 text-[#4E79FF] sm:h-14 sm:w-14">
                  <User className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-['Sora'] text-lg font-bold text-white sm:text-2xl">{detail.tenant.full_name}</h2>
                  <p className="mt-0.5 font-['Manrope'] text-xs text-[#8D8D96] sm:text-sm">{detail.tenant.tenant_access_id}</p>
                </div>
              </div>
              <StatusBadge status={detail.tenant.payment_status} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <InfoField
                label="Monthly Rent"
                icon={<CreditCard className="h-4 w-4" />}
                value={formatCurrency(detail.tenant.monthly_rent, owner?.organization?.currency_code)}
              />
              <InfoField
                label="Next Due Date"
                icon={<Calendar className="h-4 w-4" />}
                value={formatDate(getNextDueDate(detail.tenant.payment_due_day).toISOString())}
              />
              <InfoField
                label="Lease Period"
                icon={<Calendar className="h-4 w-4" />}
                value={leaseRange}
              />
              <InfoField
                label="Property"
                icon={<Building2 className="h-4 w-4" />}
                value={detail.tenant.properties?.property_name || '-'}
              />
              <InfoField
                label="Unit"
                icon={<Hash className="h-4 w-4" />}
                value={detail.tenant.properties?.unit_number || '-'}
              />
              <InfoField
                label="Address"
                icon={<Home className="h-4 w-4" />}
                value={detail.tenant.properties?.address || '-'}
              />
              <div className="col-span-2 sm:col-span-1">
                <InfoField
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                  value={<span className="break-all">{tenantContact.email}</span>}
                />
              </div>
              <InfoField
                label="Phone"
                icon={<Phone className="h-4 w-4" />}
                value={tenantContact.phone}
              />
            </div>
          </motion.div>

          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-['Sora'] text-xl font-bold text-white">Tenant Documents</h3>
                <p className="mt-1 font-['Manrope'] text-sm text-[#8D8D96]">
                  Upload, replace, and manage files for this tenant.
                </p>
              </div>
              <Button type="button" size="sm" iconLeft={<Upload className="h-4 w-4" />} onClick={openCreateDocumentModal}>
                Upload document
              </Button>
            </div>

            {documentError ? <ErrorState message={documentError} /> : null}

            {documents.length === 0 ? (
              <EmptyState title="No documents yet" description="Upload lease files, notices, ID copies, or any tenant records here." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#272839] bg-[#101114]">
                <div className="divide-y divide-[#272839]">
                  {documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-[#4E79FF]/12 p-2 text-[#4E79FF]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-['Manrope'] text-sm font-semibold text-white">{document.document_name}</p>
                            <p className="mt-1 break-all text-xs text-[#8D8D96]">{document.file_name}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#B9BCC6]">
                              <span className="rounded-full border border-[#272839] px-2.5 py-1 capitalize">{formatDocumentType(document.document_type)}</span>
                              <span className="rounded-full border border-[#272839] px-2.5 py-1">{formatBytes(document.file_size_bytes)}</span>
                              <span className="rounded-full border border-[#272839] px-2.5 py-1">Updated {formatDateTime(document.updated_at)}</span>
                            </div>
                            {document.notes ? <p className="mt-2 text-sm text-[#D7DAE1]">{document.notes}</p> : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {document.access_url ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            iconLeft={<Eye className="h-4 w-4" />}
                            onClick={() => window.open(document.access_url ?? undefined, '_blank', 'noopener,noreferrer')}
                          >
                            View
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          iconLeft={<Pencil className="h-4 w-4" />}
                          onClick={() => openEditDocumentModal(document)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          iconLeft={<Trash2 className="h-4 w-4" />}
                          onClick={() => void handleDeleteDocument(document)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce}>
            <h3 className="mb-4 font-['Sora'] text-xl font-bold text-white">Support Tickets</h3>
            {detail.tickets.length === 0 ? (
              <EmptyState title="No tickets" description="Tenant has not raised any support tickets yet." />
            ) : (
              <TicketTable tickets={detail.tickets} />
            )}
          </motion.div>

          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce}>
            <h3 className="mb-4 font-['Sora'] text-xl font-bold text-white">Rent Reminders</h3>
            {detail.reminders.length === 0 ? (
              <EmptyState title="No reminders" description="Run reminder processing from owner dashboard." />
            ) : (
              <div className="overflow-hidden overflow-x-auto rounded-xl border border-[#272839] bg-[#101114]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#272839]">
                      {['Type', 'Scheduled For', 'Status', 'Sent At'].map((heading) => (
                        <th key={heading} className="px-5 py-3.5 text-left font-['DM_Sans'] text-[10px] font-semibold uppercase tracking-widest text-[#8D8D96]">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272839]">
                    {detail.reminders.map((reminder) => (
                      <tr key={reminder.id} className="transition-colors hover:bg-[#141519]">
                        <td className="px-5 py-4 font-['Manrope'] font-medium capitalize text-white">
                          {reminder.reminder_type.replaceAll('_', ' ')}
                        </td>
                        <td className="px-5 py-4 font-['Manrope'] text-[#8D8D96]">{formatDateTime(reminder.scheduled_for)}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={reminder.status} />
                        </td>
                        <td className="px-5 py-4 font-['Manrope'] text-[#8D8D96]">
                          {reminder.sent_at ? formatDateTime(reminder.sent_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}

      <Modal
        isOpen={documentModalOpen}
        onClose={resetDocumentModal}
        title={documentMode === 'create' ? 'Upload Tenant Document' : 'Edit Tenant Document'}
        size="md"
      >
        <div className="space-y-5">
          {documentError ? <ErrorState message={documentError} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8D8D96]">Document Name</span>
              <input
                value={documentForm.document_name}
                onChange={(event) => setDocumentForm((current) => ({ ...current, document_name: event.target.value }))}
                placeholder="Tenant ID copy"
                className="w-full rounded-xl border border-[#272839] bg-[#0D0E12] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4E79FF]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8D8D96]">Document Type</span>
              <select
                value={documentForm.document_type}
                onChange={(event) =>
                  setDocumentForm((current) => ({
                    ...current,
                    document_type: event.target.value as TenantDocument['document_type'],
                  }))
                }
                className="w-full rounded-xl border border-[#272839] bg-[#0D0E12] px-4 py-3 text-sm capitalize text-white outline-none transition focus:border-[#4E79FF]"
              >
                {(['lease_agreement', 'identification', 'payment_proof', 'kyc', 'notice', 'other'] as const).map((type) => (
                  <option key={type} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8D8D96]">
              {documentMode === 'create' ? 'Choose File' : 'Replace File'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-dashed border-[#272839] bg-[#0D0E12] px-4 py-3 text-sm text-[#D7DAE1] file:mr-4 file:rounded-full file:border-0 file:bg-[#4E79FF] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#3E68EE]"
            />
            {documentMode === 'edit' && editingDocument && !selectedFile ? (
              <p className="text-xs text-[#8D8D96]">Current file: {editingDocument.file_name}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8D8D96]">Notes</span>
            <textarea
              value={documentForm.notes}
              onChange={(event) => setDocumentForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              placeholder="Optional note about this document"
              className="w-full rounded-xl border border-[#272839] bg-[#0D0E12] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4E79FF]"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetDocumentModal} disabled={documentBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleDocumentSubmit()}
              disabled={documentBusy || documentForm.document_name.trim().length === 0}
              iconLeft={<Upload className="h-4 w-4" />}
            >
              {documentBusy ? 'Saving...' : documentMode === 'create' ? 'Upload document' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

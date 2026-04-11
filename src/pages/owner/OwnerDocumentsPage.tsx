import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Eye, FileText, Pencil, Search, Trash2, Upload, X } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { Tenant, TenantDocument, TenantDocumentWithTenant } from '../../types/api'
import { formatDate } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

const DOCUMENT_TYPE_LABELS: Record<TenantDocument['document_type'], string> = {
  lease_agreement: 'Lease Agreement',
  identification: 'Identification',
  payment_proof: 'Payment Proof',
  kyc: 'KYC',
  notice: 'Notice',
  other: 'Other',
}

const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS) as [TenantDocument['document_type'], string][]


type DocumentForm = {
  tenant_id: string
  document_name: string
  document_type: TenantDocument['document_type']
  notes: string
}

const initialDocumentForm: DocumentForm = {
  tenant_id: '',
  document_name: '',
  document_type: 'other',
  notes: '',
}

export function OwnerDocumentsPage() {
  const { token } = useOwnerAuth()

  const [documents, setDocuments] = useState<TenantDocumentWithTenant[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TenantDocument['document_type'] | ''>('')
  const [filterTenant, setFilterTenant] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingDoc, setEditingDoc] = useState<TenantDocumentWithTenant | null>(null)
  const [form, setForm] = useState<DocumentForm>(initialDocumentForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const [docsRes, tenantsRes] = await Promise.all([
        api.getOwnerAllDocuments(token),
        api.getOwnerTenants(token),
      ])
      setDocuments(docsRes.documents)
      setTenants(tenantsRes.tenants)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return documents.filter((d) => {
      if (filterType && d.document_type !== filterType) return false
      if (filterTenant && d.tenant_id !== filterTenant) return false
      if (q && !d.document_name.toLowerCase().includes(q) && !(d.tenant_name ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [documents, search, filterType, filterTenant])

  const resetModal = useCallback(() => {
    setModalOpen(false)
    setModalMode('create')
    setEditingDoc(null)
    setForm(initialDocumentForm)
    setSelectedFile(null)
    setFormError(null)
    setBusy(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const openCreate = useCallback(() => {
    setModalMode('create')
    setEditingDoc(null)
    setForm(initialDocumentForm)
    setSelectedFile(null)
    setFormError(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((doc: TenantDocumentWithTenant) => {
    setModalMode('edit')
    setEditingDoc(doc)
    setForm({
      tenant_id: doc.tenant_id,
      document_name: doc.document_name,
      document_type: doc.document_type,
      notes: doc.notes ?? '',
    })
    setSelectedFile(null)
    setFormError(null)
    setModalOpen(true)
  }, [])

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }, [])

  const uploadFile = useCallback(async (tenantId: string): Promise<{
    file_name: string
    storage_path: string | null
    public_url: string | null
    mime_type: string
    file_size_bytes: number
  } | null> => {
    if (!token || !selectedFile) return null

    const urlRes = await api.createOwnerTenantDocumentUploadUrl(token, tenantId, {
      file_name: selectedFile.name,
      mime_type: selectedFile.type || 'application/octet-stream',
    })

    const putRes = await fetch(urlRes.upload.upload_url, {
      method: 'PUT',
      headers: urlRes.upload.headers,
      body: selectedFile,
    })

    if (!putRes.ok) throw new Error('File upload to S3 failed')

    return {
      file_name: selectedFile.name,
      storage_path: urlRes.upload.storage_path,
      public_url: urlRes.upload.public_url,
      mime_type: selectedFile.type || 'application/octet-stream',
      file_size_bytes: selectedFile.size,
    }
  }, [token, selectedFile])

  const handleSubmit = useCallback(async () => {
    if (!token) return

    if (!form.document_name.trim()) {
      setFormError('Document name is required.')
      return
    }
    if (modalMode === 'create' && !form.tenant_id) {
      setFormError('Please select a tenant.')
      return
    }
    if (modalMode === 'create' && !selectedFile) {
      setFormError('Please choose a file to upload.')
      return
    }

    try {
      setBusy(true)
      setFormError(null)

      const uploaded = await uploadFile(modalMode === 'create' ? form.tenant_id : editingDoc!.tenant_id)

      if (modalMode === 'create') {
        await api.createOwnerTenantDocument(token, form.tenant_id, {
          document_name: form.document_name.trim(),
          document_type: form.document_type,
          file_name: uploaded?.file_name ?? '',
          storage_path: uploaded?.storage_path ?? null,
          public_url: uploaded?.public_url ?? null,
          mime_type: uploaded?.mime_type ?? null,
          file_size_bytes: uploaded?.file_size_bytes ?? null,
          notes: form.notes.trim() || null,
        })
      } else if (editingDoc) {
        const patch: Parameters<typeof api.updateOwnerTenantDocument>[3] = {
          document_name: form.document_name.trim(),
          document_type: form.document_type,
          notes: form.notes.trim() || null,
        }
        if (uploaded) {
          patch.file_name = uploaded.file_name
          patch.storage_path = uploaded.storage_path
          patch.public_url = uploaded.public_url
          patch.mime_type = uploaded.mime_type
          patch.file_size_bytes = uploaded.file_size_bytes
        }
        await api.updateOwnerTenantDocument(token, editingDoc.tenant_id, editingDoc.id, patch)
      }

      await loadData()
      resetModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save document')
      setBusy(false)
    }
  }, [token, form, modalMode, selectedFile, editingDoc, uploadFile, loadData, resetModal])

  const handleDelete = useCallback(async (doc: TenantDocumentWithTenant) => {
    if (!token) return
    if (!window.confirm(`Delete "${doc.document_name}"?`)) return
    try {
      await api.deleteOwnerTenantDocument(token, doc.tenant_id, doc.id)
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    }
  }, [token])

  return (
    <div className="min-h-screen w-full space-y-6 bg-[#06070B] p-4 sm:p-6">
      <motion.div variants={revealUp} initial="hidden" animate="show" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Documents</h1>
          <p className="mt-1 font-['Manrope'] text-sm font-medium text-[#8D8D96]">
            Manage all tenant documents in one place.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          iconLeft={<Upload className="h-4 w-4" />}
          onClick={openCreate}
          className="self-start sm:self-auto"
        >
          Upload Document
        </Button>
      </motion.div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading documents..." rows={5} /> : null}

      {!loading && (
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-4">
          {/* Filters */}
          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8D96]" />
              <input
                type="text"
                placeholder="Search by document name or tenant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#272839] bg-[#101114] py-2 pl-9 pr-4 font-['Manrope'] text-sm text-white placeholder-[#8D8D96] outline-none focus:border-[#4E79FF]/60"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D96] hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="rounded-lg border border-[#272839] bg-[#101114] px-3 py-2 font-['Manrope'] text-sm text-white outline-none focus:border-[#4E79FF]/60 sm:w-48"
            >
              <option value="">All tenants</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TenantDocument['document_type'] | '')}
              className="rounded-lg border border-[#272839] bg-[#101114] px-3 py-2 font-['Manrope'] text-sm text-white outline-none focus:border-[#4E79FF]/60 sm:w-44"
            >
              <option value="">All types</option>
              {DOCUMENT_TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </motion.div>

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No documents found"
              description={documents.length === 0 ? 'Upload your first tenant document to get started.' : 'No documents match the current filters.'}
            />
          ) : (
            <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce} className="overflow-x-auto rounded-xl border border-[#272839] bg-[#101114]">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#272839]">
                    {['Tenant', 'Document', 'Type', 'File', 'Uploaded', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-[#272839]/60 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-['Manrope'] text-white">
                        {doc.tenant_name ?? <span className="text-[#8D8D96]">—</span>}
                      </td>
                      <td className="px-4 py-3 font-['Manrope'] font-medium text-white">
                        {doc.document_name}
                        {doc.notes && (
                          <p className="mt-0.5 truncate max-w-[180px] text-xs text-[#8D8D96]">{doc.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-[#272839] bg-[#181920] px-2 py-0.5 font-['DM_Sans'] text-xs text-[#8D8D96]">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 font-['Manrope'] text-xs text-[#8D8D96]">
                        {doc.file_name}
                      </td>
                      <td className="px-4 py-3 font-['Manrope'] text-xs text-[#8D8D96]">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {doc.access_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              iconLeft={<Eye className="h-4 w-4" />}
                              onClick={() => window.open(doc.access_url ?? undefined, '_blank', 'noopener,noreferrer')}
                            >
                              View
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(doc)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#272839] bg-[#181920] text-[#8D8D96] transition hover:border-[#4E79FF]/40 hover:text-[#4E79FF]"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(doc)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#272839] bg-[#181920] text-[#8D8D96] transition hover:border-red-500/40 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-[#272839] font-['Manrope'] text-xs text-[#8D8D96]">
                {filtered.length} document{filtered.length !== 1 ? 's' : ''}{filtered.length !== documents.length ? ` (of ${documents.length} total)` : ''}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Upload / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={resetModal}
        title={modalMode === 'create' ? 'Upload Tenant Document' : 'Edit Document'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 font-['Manrope'] text-sm text-red-400">
              <X className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          {modalMode === 'create' && (
            <div>
              <label className="mb-1 block font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
                Tenant <span className="text-red-400">*</span>
              </label>
              <select
                value={form.tenant_id}
                onChange={(e) => setForm((f) => ({ ...f, tenant_id: e.target.value }))}
                className="w-full rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2 font-['Manrope'] text-sm text-white outline-none focus:border-[#4E79FF]/60"
              >
                <option value="">Select a tenant…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {modalMode === 'edit' && editingDoc && (
            <div className="rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2 font-['Manrope'] text-sm text-[#8D8D96]">
              Tenant: <span className="text-white">{editingDoc.tenant_name ?? editingDoc.tenant_id}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
              Document Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.document_name}
              onChange={(e) => setForm((f) => ({ ...f, document_name: e.target.value }))}
              placeholder="e.g. Passport Copy"
              className="w-full rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2 font-['Manrope'] text-sm text-white placeholder-[#8D8D96] outline-none focus:border-[#4E79FF]/60"
            />
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
              Document Type
            </label>
            <select
              value={form.document_type}
              onChange={(e) => setForm((f) => ({ ...f, document_type: e.target.value as TenantDocument['document_type'] }))}
              className="w-full rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2 font-['Manrope'] text-sm text-white outline-none focus:border-[#4E79FF]/60"
            >
              {DOCUMENT_TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
              Choose File {modalMode === 'create' && <span className="text-red-400">*</span>}
              {modalMode === 'edit' && <span className="ml-1 normal-case tracking-normal text-[#8D8D96]">(leave blank to keep existing)</span>}
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2">
              <label className="cursor-pointer rounded-md bg-[#4E79FF] px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-white transition hover:bg-[#4E79FF]/80">
                Choose File
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </label>
              <span className="truncate font-['Manrope'] text-xs text-[#8D8D96]">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#8D8D96]">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional note about this document"
              rows={3}
              className="w-full resize-none rounded-lg border border-[#272839] bg-[#0C0D10] px-3 py-2 font-['Manrope'] text-sm text-white placeholder-[#8D8D96] outline-none focus:border-[#4E79FF]/60"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={resetModal} disabled={busy}
              className="border-[#272839] bg-[#101114] text-[#8D8D96] hover:border-[#4E79FF]/40 hover:text-white">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => void handleSubmit()} disabled={busy}>
              {busy ? (modalMode === 'create' ? 'Uploading…' : 'Saving…') : (modalMode === 'create' ? 'Upload document' : 'Save changes')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

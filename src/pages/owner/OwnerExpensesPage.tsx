import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Calendar, Plus, Receipt, Tag, Trash2, TrendingDown, Wallet, X } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type Expense,
  type ExpenseCategory,
  type ExpenseSummary,
} from '../../types/api'
import { formatCurrency } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  insurance: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  legal: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  agency_fees: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  utilities: 'bg-green-500/15 text-green-400 border-green-500/30',
  furnishing: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  tax: 'bg-red-500/15 text-red-400 border-red-500/30',
  other: 'bg-white/8 text-[#8D8D96] border-[#272839]',
}

type ModalMode = 'add' | 'edit' | null

type FormState = {
  property_id: string
  category: ExpenseCategory
  description: string
  vendor_name: string
  invoice_ref: string
  amount: string
  incurred_on: string
}

const emptyForm: FormState = {
  property_id: '',
  category: 'other',
  description: '',
  vendor_name: '',
  invoice_ref: '',
  amount: '',
  incurred_on: new Date().toISOString().slice(0, 10),
}

function buildPropertyLabel(e: Expense): string {
  if (e.property_name && e.property_unit) return `${e.property_name} (${e.property_unit})`
  return e.property_name ?? e.property_address ?? 'Unknown Property'
}

type PropertyOption = { id: string; label: string }

export function OwnerExpensesPage() {
  const { token, owner } = useOwnerAuth()
  const currency = owner?.organization?.currency_code

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterProperty, setFilterProperty] = useState('')
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('')
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear())

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const loadData = useCallback(async () => {
    if (!token) return
    try {
      setError(null)
      setLoading(true)
      const [expRes, summaryRes, propRes] = await Promise.all([
        api.getOwnerExpenses(token, {
          property_id: filterProperty || undefined,
          category: filterCategory || undefined,
          year: filterYear,
        }),
        api.getOwnerExpenseSummary(token),
        api.getOwnerProperties(token),
      ])
      setExpenses(expRes.expenses)
      setSummary(summaryRes.summary)
      setProperties(
        propRes.properties.map((p) => ({
          id: p.id,
          label: p.unit_number ? `${p.property_name} (${p.unit_number})` : p.property_name,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [token, filterProperty, filterCategory, filterYear])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Derived totals for current filtered view
  const filteredTotal = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  )

  // --- Modal helpers ---
  function openAdd() {
    setForm({ ...emptyForm, property_id: properties[0]?.id ?? '' })
    setFormError(null)
    setModalMode('add')
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    setForm({
      property_id: expense.property_id,
      category: expense.category,
      description: expense.description,
      vendor_name: expense.vendor_name ?? '',
      invoice_ref: expense.invoice_ref ?? '',
      amount: String(expense.amount),
      incurred_on: expense.incurred_on,
    })
    setFormError(null)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditingExpense(null)
    setFormError(null)
  }

  async function handleSave() {
    if (!token) return
    setFormError(null)

    if (!form.property_id) return setFormError('Please select a property.')
    if (!form.description.trim()) return setFormError('Description is required.')
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return setFormError('Enter a valid positive amount.')
    if (!form.incurred_on) return setFormError('Date is required.')

    const payload = {
      property_id: form.property_id,
      category: form.category,
      description: form.description.trim(),
      vendor_name: form.vendor_name.trim() || undefined,
      invoice_ref: form.invoice_ref.trim() || undefined,
      amount,
      incurred_on: form.incurred_on,
    }

    try {
      setSaving(true)
      if (modalMode === 'add') {
        await api.createOwnerExpense(token, payload)
      } else if (modalMode === 'edit' && editingExpense) {
        await api.updateOwnerExpense(token, editingExpense.id, payload)
      }
      closeModal()
      await loadData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!token || !deletingId) return
    try {
      await api.deleteOwnerExpense(token, deletingId)
      setDeleteConfirm(false)
      setDeletingId(null)
      await loadData()
    } catch {
      // silent — keep modal open so user knows it failed
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i)

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-[Sora]">Expenses</h1>
          <p className="mt-0.5 text-sm text-[#8D8D96]">Track property costs, vendor bills, and deductible expenses</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-[#FED609] px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-[#FFD70B] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <motion.div variants={revealUp} className="rounded-xl border border-[#272839] bg-[#13141F] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-[#FED609]" />
              <span className="text-xs text-[#8D8D96]">This Month</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrency(summary.totalThisMonth, currency)}</p>
          </motion.div>

          <motion.div variants={revealUp} className="rounded-xl border border-[#272839] bg-[#13141F] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-[#4E79FF]" />
              <span className="text-xs text-[#8D8D96]">This Year</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrency(summary.totalThisYear, currency)}</p>
          </motion.div>

          <motion.div variants={revealUp} className="rounded-xl border border-[#272839] bg-[#13141F] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-[#32C382]" />
              <span className="text-xs text-[#8D8D96]">Filtered Total</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrency(filteredTotal, currency)}</p>
          </motion.div>

          <motion.div variants={revealUp} className="rounded-xl border border-[#272839] bg-[#13141F] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-[#8D8D96]">Top Category</span>
            </div>
            <p className="text-sm font-bold text-white">
              {Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0]
                ? EXPENSE_CATEGORY_LABELS[
                    Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0][0] as ExpenseCategory
                  ] ?? 'None'
                : '—'}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="rounded-lg border border-[#272839] bg-[#13141F] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FED609]/50"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="rounded-lg border border-[#272839] bg-[#13141F] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FED609]/50"
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
          className="rounded-lg border border-[#272839] bg-[#13141F] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FED609]/50"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        {(filterProperty || filterCategory) && (
          <button
            type="button"
            onClick={() => { setFilterProperty(''); setFilterCategory('') }}
            className="flex items-center gap-1.5 rounded-lg border border-[#272839] bg-[#13141F] px-3 py-2 text-sm text-[#8D8D96] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-[#8D8D96]" />}
          title="No expenses yet"
          description="Add your first expense to start tracking property costs."
          actionLabel="Add Expense"
          onAction={openAdd}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-[#272839] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0E0F19] text-[#8D8D96] text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Property</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Vendor</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1D2B]">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="bg-[#13141F] hover:bg-[#1C1D2B] transition-colors group"
                  >
                    <td className="px-4 py-3 text-[#8D8D96] whitespace-nowrap">{expense.incurred_on}</td>
                    <td className="px-4 py-3 text-white max-w-[160px] truncate">{buildPropertyLabel(expense)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                        {EXPENSE_CATEGORY_LABELS[expense.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white max-w-[200px] truncate">{expense.description}</td>
                    <td className="px-4 py-3 text-[#8D8D96] max-w-[120px] truncate">{expense.vendor_name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white whitespace-nowrap">
                      {formatCurrency(expense.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEdit(expense)}
                          className="rounded-md px-2 py-1 text-xs text-[#8D8D96] hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingId(expense.id); setDeleteConfirm(true) }}
                          className="rounded-md px-2 py-1 text-xs text-[#8D8D96] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="rounded-xl border border-[#272839] bg-[#13141F] p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{expense.description}</p>
                    <p className="text-xs text-[#8D8D96] mt-0.5">{buildPropertyLabel(expense)}</p>
                  </div>
                  <p className="text-sm font-bold text-white whitespace-nowrap">
                    {formatCurrency(expense.amount, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                    {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#8D8D96]">
                    <Calendar className="h-3 w-3" />
                    {expense.incurred_on}
                  </span>
                  {expense.vendor_name && (
                    <span className="text-xs text-[#8D8D96] truncate">{expense.vendor_name}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3 border-t border-[#1C1D2B] pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(expense)}
                    className="flex-1 rounded-lg border border-[#272839] py-1.5 text-xs font-medium text-[#8D8D96] hover:text-white hover:border-[#4E79FF]/40 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeletingId(expense.id); setDeleteConfirm(true) }}
                    className="rounded-lg border border-[#272839] px-3 py-1.5 text-xs font-medium text-[#8D8D96] hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <Modal
          isOpen={true}
          title={modalMode === 'add' ? 'Add Expense' : 'Edit Expense'}
          onClose={closeModal}
        >
          <div className="space-y-4">
            {/* Property */}
            <div>
              <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Property *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8D96]" />
                <select
                  value={form.property_id}
                  onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))}
                  className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED609]/50 appearance-none"
                >
                  <option value="">Select property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category + Date side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Category *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8D96]" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                    className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED609]/50 appearance-none"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8D96]" />
                  <input
                    type="date"
                    value={form.incurred_on}
                    onChange={(e) => setForm((f) => ({ ...f, incurred_on: e.target.value }))}
                    className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED609]/50"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Description *</label>
              <input
                type="text"
                placeholder="e.g. Annual gas safety certificate"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] px-3 py-2.5 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:border-[#FED609]/50"
              />
            </div>

            {/* Amount + Vendor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] px-3 py-2.5 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:border-[#FED609]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. British Gas"
                  value={form.vendor_name}
                  onChange={(e) => setForm((f) => ({ ...f, vendor_name: e.target.value }))}
                  className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] px-3 py-2.5 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:border-[#FED609]/50"
                />
              </div>
            </div>

            {/* Invoice Ref */}
            <div>
              <label className="block text-xs font-medium text-[#8D8D96] mb-1.5">Invoice / Reference No.</label>
              <input
                type="text"
                placeholder="Optional — useful for tax records"
                value={form.invoice_ref}
                onChange={(e) => setForm((f) => ({ ...f, invoice_ref: e.target.value }))}
                className="w-full rounded-lg border border-[#272839] bg-[#0E0F19] px-3 py-2.5 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:border-[#FED609]/50"
              />
            </div>

            {formError && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-lg border border-[#272839] py-2.5 text-sm font-medium text-[#8D8D96] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-[#FED609] py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#FFD70B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {saving ? 'Saving…' : modalMode === 'add' ? 'Add Expense' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal isOpen={true} title="Delete Expense" onClose={() => { setDeleteConfirm(false); setDeletingId(null) }}>
          <p className="text-sm text-[#8D8D96] mb-6">
            Are you sure you want to delete this expense? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setDeleteConfirm(false); setDeletingId(null) }}
              className="flex-1 rounded-lg border border-[#272839] py-2.5 text-sm font-medium text-[#8D8D96] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

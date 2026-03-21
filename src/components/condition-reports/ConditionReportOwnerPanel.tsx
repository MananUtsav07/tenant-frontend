import { Camera, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { FormInput } from '../common/FormInput'
import { LoadingState } from '../common/LoadingState'
import { dashboardFormPanelClassName, dashboardInfoPanelClassName } from '../common/formTheme'
import { api } from '../../services/api'
import type { ConditionReportDetail, OwnerConditionReportOverview } from '../../types/api'
import { formatDateTime } from '../../utils/date'
import {
  conditionReportChipClassName,
  conditionReportComparisonChipClassName,
  conditionReportConfirmationChipClassName,
  conditionReportTypeLabel,
  conditionReportWorkflowChipClassName,
} from './conditionReportUi'

type Props = {
  token: string
  tenantId: string
  tenantName?: string
}

export function ConditionReportOwnerPanel({ token, tenantId, tenantName }: Props) {
  const [overview, setOverview] = useState<OwnerConditionReportOverview | null>(null)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConditionReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createType, setCreateType] = useState<'move_in' | 'move_out'>('move_in')
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [roomDrafts, setRoomDrafts] = useState<Record<string, { condition_rating: string; condition_notes: string }>>({})
  const [mediaDraft, setMediaDraft] = useState({
    room_entry_id: '',
    media_url: '',
    caption: '',
  })
  const [confirmationNote, setConfirmationNote] = useState('')

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getOwnerTenantConditionReports(token, tenantId)
      setOverview(response.condition_reports)
      setSelectedReportId((current) => current ?? response.condition_reports.reports[0]?.id ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load condition reports')
    } finally {
      setLoading(false)
    }
  }, [tenantId, token])

  const loadDetail = useCallback(
    async (reportId: string) => {
      try {
        setDetailLoading(true)
        const response = await api.getOwnerConditionReport(token, reportId)
        setDetail(response.report)
        setRoomDrafts(
          Object.fromEntries(
            response.report.rooms.map((room) => [
              room.id,
              {
                condition_rating: room.condition_rating,
                condition_notes: room.condition_notes ?? '',
              },
            ]),
          ),
        )
        setMediaDraft((current) => ({
          ...current,
          room_entry_id: response.report.rooms[0]?.id ?? '',
        }))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load condition report detail')
      } finally {
        setDetailLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (selectedReportId) {
      void loadDetail(selectedReportId)
    } else {
      setDetail(null)
    }
  }, [loadDetail, selectedReportId])

  const summaryItems = useMemo(
    () =>
      overview
        ? [
            { label: 'Reports', value: overview.summary.total_reports },
            { label: 'Move-in', value: overview.summary.move_in_count },
            { label: 'Move-out', value: overview.summary.move_out_count },
            { label: 'Awaiting Tenant', value: overview.summary.awaiting_tenant_confirmation_count },
          ]
        : [],
    [overview],
  )

  const reloadAll = async (reportId?: string | null) => {
    await loadOverview()
    if (reportId) {
      await loadDetail(reportId)
      setSelectedReportId(reportId)
    }
  }

  const handleCreate = async () => {
    try {
      setBusyAction('create')
      const response = await api.createOwnerTenantConditionReport(token, tenantId, {
        report_type: createType,
      })
      await reloadAll(response.report.id)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to create condition report')
    } finally {
      setBusyAction(null)
    }
  }

  const handleSaveRoom = async (roomId: string) => {
    if (!detail) {
      return
    }

    try {
      setBusyAction(`room:${roomId}`)
      const draft = roomDrafts[roomId]
      const response = await api.updateOwnerConditionReportRoom(token, detail.id, roomId, {
        condition_rating: draft.condition_rating as 'not_reviewed' | 'good' | 'fair' | 'poor',
        condition_notes: draft.condition_notes || null,
      })
      setDetail(response.report)
      setRoomDrafts(
        Object.fromEntries(
          response.report.rooms.map((room) => [
            room.id,
            {
              condition_rating: room.condition_rating,
              condition_notes: room.condition_notes ?? '',
            },
          ]),
        ),
      )
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to save room entry')
    } finally {
      setBusyAction(null)
    }
  }

  const handleAddMedia = async () => {
    if (!detail || !mediaDraft.room_entry_id || !mediaDraft.media_url.trim()) {
      return
    }

    try {
      setBusyAction('media')
      const response = await api.addOwnerConditionReportMedia(token, detail.id, {
        room_entry_id: mediaDraft.room_entry_id,
        media_url: mediaDraft.media_url.trim(),
        caption: mediaDraft.caption.trim() || null,
      })
      setDetail(response.report)
      setMediaDraft((current) => ({ ...current, media_url: '', caption: '' }))
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to add media reference')
    } finally {
      setBusyAction(null)
    }
  }

  const handleConfirm = async (status: 'confirmed' | 'disputed') => {
    if (!detail) {
      return
    }

    try {
      setBusyAction(`confirm:${status}`)
      const response = await api.confirmOwnerConditionReport(token, detail.id, {
        status,
        note: confirmationNote.trim() || null,
      })
      setDetail(response.report)
      setConfirmationNote('')
      await loadOverview()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to update owner confirmation')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className={dashboardFormPanelClassName}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Deposit Documentation</p>
            <h3 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">Condition report workflow</h3>
            <p className="mt-2 max-w-3xl text-sm text-[var(--ph-text-muted)]">
              Capture room-by-room evidence, keep the audit trail attached to the tenancy, and hold move-in or move-out confirmation in one place
              {tenantName ? ` for ${tenantName}` : ''}.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Manual Report</p>
              <div className="mt-2 inline-flex rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setCreateType('move_in')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    createType === 'move_in'
                      ? 'bg-[rgba(240,163,35,0.16)] text-[#f6d9a1]'
                      : 'text-[var(--ph-text-muted)]'
                  }`}
                >
                  Move-in
                </button>
                <button
                  type="button"
                  onClick={() => setCreateType('move_out')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    createType === 'move_out'
                      ? 'bg-[rgba(240,163,35,0.16)] text-[#f6d9a1]'
                      : 'text-[var(--ph-text-muted)]'
                  }`}
                >
                  Move-out
                </button>
              </div>
            </div>
            <Button type="button" variant="primary" onClick={() => void handleCreate()} disabled={busyAction === 'create'}>
              {busyAction === 'create' ? 'Opening...' : 'Open workflow'}
            </Button>
          </div>
        </div>

        {summaryItems.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--ph-text)]">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading condition reports..." rows={4} /> : null}

      {!loading && overview && overview.reports.length === 0 ? (
        <EmptyState
          title="No condition reports yet"
          description="Move-in workflows start when a tenancy becomes active. Move-out workflows start when vacancy handling begins."
          icon={<FileText className="h-5 w-5" />}
        />
      ) : null}

      {!loading && overview && overview.reports.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className={`${dashboardFormPanelClassName} space-y-3`}>
            {overview.reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full rounded-lg border px-4 py-4 text-left transition ${
                  selectedReportId === report.id
                    ? 'border-[rgba(240,163,35,0.42)] bg-[rgba(240,163,35,0.08)]'
                    : 'border-[rgba(83,88,100,0.42)] bg-white/[0.03] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={conditionReportChipClassName(conditionReportWorkflowChipClassName(report.workflow_status))}>
                    {report.workflow_status.replaceAll('_', ' ')}
                  </span>
                  <span className={conditionReportChipClassName(conditionReportComparisonChipClassName(report.comparison_status))}>
                    {report.comparison_status.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="mt-3 font-medium text-[var(--ph-text)]">{report.report_label}</p>
                <p className="mt-2 text-xs text-[var(--ph-text-muted)]">
                  {conditionReportTypeLabel(report.report_type)} - {report.room_completion.assessed_rooms}/{report.room_completion.total_rooms} rooms -{' '}
                  {report.room_completion.media_items} evidence items
                </p>
                <p className="mt-2 text-xs text-[var(--ph-text-muted)]">Opened {formatDateTime(report.created_at)}</p>
              </button>
            ))}
          </div>

          <div className={`${dashboardFormPanelClassName} space-y-5`}>
            {detailLoading ? <LoadingState message="Loading report detail..." rows={4} /> : null}

            {!detailLoading && detail ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={conditionReportChipClassName(conditionReportWorkflowChipClassName(detail.workflow_status))}>
                        {detail.workflow_status.replaceAll('_', ' ')}
                      </span>
                      <span className={conditionReportChipClassName(conditionReportComparisonChipClassName(detail.comparison_status))}>
                        {detail.comparison_status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <h4 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">{detail.report_label}</h4>
                    <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{detail.report_summary ?? 'No summary generated yet.'}</p>
                  </div>

                  <div className={dashboardInfoPanelClassName}>
                    <p>Owner confirmation: {detail.owner_confirmation_status.replaceAll('_', ' ')}</p>
                    <p className="mt-1">Tenant confirmation: {detail.tenant_confirmation_status.replaceAll('_', ' ')}</p>
                    <p className="mt-1">Document: {detail.generated_document_status.replaceAll('_', ' ')}</p>
                  </div>
                </div>

                {detail.baseline_report ? (
                  <div className={dashboardInfoPanelClassName}>
                    <p className="font-medium text-[var(--ph-text)]">Linked baseline</p>
                    <p className="mt-1">{detail.baseline_report.report_label}</p>
                    <p className="mt-1 text-xs text-[var(--ph-text-muted)]">Opened {formatDateTime(detail.baseline_report.created_at)}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-[var(--ph-accent)]" />
                    <h5 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Room-by-room record</h5>
                  </div>

                  {detail.rooms.map((room) => (
                    <div key={room.id} className="rounded-lg border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-[var(--ph-text)]">{room.room_label_display}</p>
                          <p className="mt-1 text-xs text-[var(--ph-text-muted)]">
                            Comparison: {room.comparison_result.replaceAll('_', ' ')} {room.comparison_notes ? `- ${room.comparison_notes}` : ''}
                          </p>
                        </div>
                        <span className={conditionReportChipClassName(conditionReportComparisonChipClassName(detail.comparison_status))}>
                          {room.media_count} media
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
                        <FormInput
                          label="Condition"
                          as="input"
                          type="text"
                          list={`condition-ratings-${room.id}`}
                          value={roomDrafts[room.id]?.condition_rating ?? room.condition_rating}
                          onChange={(event) =>
                            setRoomDrafts((current) => ({
                              ...current,
                              [room.id]: {
                                condition_rating: event.target.value,
                                condition_notes: current[room.id]?.condition_notes ?? room.condition_notes ?? '',
                              },
                            }))
                          }
                        />
                        <datalist id={`condition-ratings-${room.id}`}>
                          <option value="not_reviewed" />
                          <option value="good" />
                          <option value="fair" />
                          <option value="poor" />
                        </datalist>

                        <FormInput
                          label="Condition Notes"
                          as="textarea"
                          rows={3}
                          value={roomDrafts[room.id]?.condition_notes ?? room.condition_notes ?? ''}
                          onChange={(event) =>
                            setRoomDrafts((current) => ({
                              ...current,
                              [room.id]: {
                                condition_rating: current[room.id]?.condition_rating ?? room.condition_rating,
                                condition_notes: event.target.value,
                              },
                            }))
                          }
                        />

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void handleSaveRoom(room.id)}
                            disabled={busyAction === `room:${room.id}`}
                          >
                            {busyAction === `room:${room.id}` ? 'Saving...' : 'Save room'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-[var(--ph-accent)]" />
                    <h5 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Evidence links</h5>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <FormInput
                      label="Room"
                      as="input"
                      type="text"
                      list="condition-room-entries"
                      value={mediaDraft.room_entry_id}
                      onChange={(event) => setMediaDraft((current) => ({ ...current, room_entry_id: event.target.value }))}
                    />
                    <datalist id="condition-room-entries">
                      {detail.rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_label_display}
                        </option>
                      ))}
                    </datalist>
                    <FormInput
                      label="Media URL"
                      value={mediaDraft.media_url}
                      onChange={(event) => setMediaDraft((current) => ({ ...current, media_url: event.target.value }))}
                      placeholder="https://..."
                    />
                    <FormInput
                      label="Caption"
                      value={mediaDraft.caption}
                      onChange={(event) => setMediaDraft((current) => ({ ...current, caption: event.target.value }))}
                      placeholder="What this evidence shows"
                    />
                    <div className="flex items-end">
                      <Button type="button" variant="secondary" onClick={() => void handleAddMedia()} disabled={busyAction === 'media'}>
                        {busyAction === 'media' ? 'Linking...' : 'Link evidence'}
                      </Button>
                    </div>
                  </div>

                  {detail.media.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {detail.media.map((item) => (
                        <div key={item.id} className="rounded-lg border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-4">
                          <p className="font-medium text-[var(--ph-text)]">{item.room_label.replaceAll('_', ' ')}</p>
                          <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{item.caption || 'No caption added'}</p>
                          <p className="mt-2 break-all text-xs text-[var(--ph-text-soft)]">{item.media_url || item.storage_path || 'Linked asset'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No evidence linked yet" description="Add room-specific URLs or future storage references as evidence is collected." />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
                    <h5 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Owner confirmation</h5>
                  </div>
                  <FormInput
                    label="Confirmation Note"
                    as="textarea"
                    rows={3}
                    value={confirmationNote}
                    onChange={(event) => setConfirmationNote(event.target.value)}
                    placeholder="Add any instruction or note that should stay with the audit trail."
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="primary" onClick={() => void handleConfirm('confirmed')} disabled={busyAction === 'confirm:confirmed'}>
                      {busyAction === 'confirm:confirmed' ? 'Saving...' : 'Confirm report'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void handleConfirm('disputed')} disabled={busyAction === 'confirm:disputed'}>
                      {busyAction === 'confirm:disputed' ? 'Saving...' : 'Flag for review'}
                    </Button>
                    <span className={conditionReportChipClassName(conditionReportConfirmationChipClassName(detail.owner_confirmation_status))}>
                      Owner {detail.owner_confirmation_status.replaceAll('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Timeline</h5>
                  {detail.events.length ? (
                    <div className="space-y-3">
                      {detail.events.slice(0, 8).map((event) => (
                        <div key={event.id} className="rounded-lg border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-[var(--ph-text)]">{event.title}</p>
                            <p className="text-xs text-[var(--ph-text-muted)]">{formatDateTime(event.created_at)}</p>
                          </div>
                          <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{event.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="Timeline not populated yet" description="Events will appear as rooms, media, comparisons, and confirmations are updated." />
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}


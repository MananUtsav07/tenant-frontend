import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api } from '../services/api'
import { useOwnerAuth } from './useOwnerAuth'
import { OwnerApprovalsContext, type OwnerApprovalsContextValue } from './ownerApprovalsContext'

export function OwnerApprovalsProvider({ children }: { children: ReactNode }) {
  const { token } = useOwnerAuth()
  const [approvals, setApprovals] = useState<OwnerApprovalsContextValue['approvals']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        setApprovals([])
        setError(null)
        setLoading(false)
        return
      }

      if (!options?.silent) {
        setLoading(true)
      }

      try {
        setError(null)
        const response = await api.getOwnerRentPaymentApprovals(token)
        setApprovals(response.approvals)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load approvals')
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => void refresh({ silent: true }), 30_000)
    return () => clearInterval(interval)
  }, [refresh])

  const value = useMemo<OwnerApprovalsContextValue>(
    () => ({
      approvals,
      pendingCount: approvals.filter((approval) => approval.status === 'awaiting_owner_approval').length,
      loading,
      error,
      refresh,
    }),
    [approvals, loading, error, refresh],
  )

  return <OwnerApprovalsContext.Provider value={value}>{children}</OwnerApprovalsContext.Provider>
}

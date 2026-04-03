import { createContext } from 'react'
import type { OwnerRentPaymentApproval } from '../types/api'

export type OwnerApprovalsContextValue = {
  approvals: OwnerRentPaymentApproval[]
  pendingCount: number
  loading: boolean
  error: string | null
  refresh: (options?: { silent?: boolean }) => Promise<void>
}

export const OwnerApprovalsContext = createContext<OwnerApprovalsContextValue | undefined>(undefined)

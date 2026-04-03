import { useContext } from 'react'

import { OwnerApprovalsContext } from './ownerApprovalsContext'

export function useOwnerApprovals() {
  const context = useContext(OwnerApprovalsContext)
  if (!context) {
    throw new Error('useOwnerApprovals must be used within OwnerApprovalsProvider')
  }
  return context
}

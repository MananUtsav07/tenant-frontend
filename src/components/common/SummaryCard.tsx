import type { ReactNode } from 'react'

import { DashboardCard } from './DashboardCard'

type SummaryCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function SummaryCard(props: SummaryCardProps) {
  return <DashboardCard {...props} />
}

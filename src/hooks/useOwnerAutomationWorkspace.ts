import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { api } from '../services/api'
import type {
  ComplianceOverview,
  OwnerAutomationSettings,
  OwnerCashFlowOverview,
  OwnerPortfolioVisibilityOverview,
  AutomationRun,
} from '../types/api'
import { useOwnerAuth } from './useOwnerAuth'

type OwnerAutomationWorkspaceState = {
  settings: OwnerAutomationSettings | null
  activity: AutomationRun[]
  compliance: ComplianceOverview | null
  cashFlow: OwnerCashFlowOverview | null
  portfolioVisibility: OwnerPortfolioVisibilityOverview | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setSettings: Dispatch<SetStateAction<OwnerAutomationSettings | null>>
}

export function useOwnerAutomationWorkspace(): OwnerAutomationWorkspaceState {
  const { token } = useOwnerAuth()
  const [settings, setSettings] = useState<OwnerAutomationSettings | null>(null)
  const [activity, setActivity] = useState<AutomationRun[]>([])
  const [compliance, setCompliance] = useState<ComplianceOverview | null>(null)
  const [cashFlow, setCashFlow] = useState<OwnerCashFlowOverview | null>(null)
  const [portfolioVisibility, setPortfolioVisibility] = useState<OwnerPortfolioVisibilityOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!token) {
      setSettings(null)
      setActivity([])
      setCompliance(null)
      setCashFlow(null)
      setPortfolioVisibility(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [settingsResponse, activityResponse, complianceResponse, cashFlowResponse, portfolioResponse] = await Promise.all([
        api.getOwnerAutomationSettings(token),
        api.getOwnerAutomationActivity(token, { page: 1, page_size: 20 }),
        api.getOwnerAutomationCompliance(token),
        api.getOwnerAutomationCashFlow(token),
        api.getOwnerAutomationPortfolioVisibility(token),
      ])

      setSettings(settingsResponse.settings)
      setActivity(activityResponse.items)
      setCompliance(complianceResponse.compliance)
      setCashFlow(cashFlowResponse.cash_flow)
      setPortfolioVisibility(portfolioResponse.portfolio_visibility)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load automation workspace')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    settings,
    activity,
    compliance,
    cashFlow,
    portfolioVisibility,
    loading,
    error,
    refresh,
    setSettings,
  }
}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '../services/api'
import type { Tenant } from '../types/api'
import { clearTenantToken, readTenantToken, writeTenantToken } from '../utils/storage'

type TenantAuthContextValue = {
  tenant: Tenant | null
  token: string | null
  loading: boolean
  login: (tenantAccessId: string, password: string, email?: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const TenantAuthContext = createContext<TenantAuthContextValue | null>(null)

export function TenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(() => readTenantToken())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) {
      setTenant(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.tenantMe(token)
      setTenant(response.tenant)
    } catch {
      clearTenantToken()
      setToken(null)
      setTenant(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (tenantAccessId: string, password: string, email?: string) => {
    const response = await api.tenantLogin({
      tenant_access_id: tenantAccessId,
      password,
      email,
    })
    writeTenantToken(response.token)
    setToken(response.token)
    const profile = await api.tenantMe(response.token)
    setTenant(profile.tenant)
  }, [])

  const logout = useCallback(() => {
    clearTenantToken()
    setToken(null)
    setTenant(null)
  }, [])

  const value = useMemo<TenantAuthContextValue>(
    () => ({
      tenant,
      token,
      loading,
      login,
      logout,
      refresh,
    }),
    [tenant, token, loading, login, logout, refresh],
  )

  return <TenantAuthContext.Provider value={value}>{children}</TenantAuthContext.Provider>
}

export function useTenantAuth() {
  const context = useContext(TenantAuthContext)
  if (!context) {
    throw new Error('useTenantAuth must be used within TenantAuthProvider')
  }

  return context
}

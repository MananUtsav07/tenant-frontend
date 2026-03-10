/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '../services/api'
import type { AdminUser } from '../types/api'
import { clearAdminToken, readAdminToken, writeAdminToken } from '../utils/storage'

type AdminAuthContextValue = {
  admin: AdminUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(() => readAdminToken())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.adminMe(token)
      setAdmin(response.admin)
    } catch {
      clearAdminToken()
      setToken(null)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.adminLogin({ email, password })
    writeAdminToken(response.token)
    setToken(response.token)
    setAdmin(response.admin)
  }, [])

  const logout = useCallback(() => {
    clearAdminToken()
    setToken(null)
    setAdmin(null)
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      token,
      loading,
      login,
      logout,
      refresh,
    }),
    [admin, token, loading, login, logout, refresh],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

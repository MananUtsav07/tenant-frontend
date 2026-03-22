/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '../services/api'
import type { Owner } from '../types/api'
import { clearOwnerToken, readOwnerToken, writeOwnerToken } from '../utils/storage'

type OwnerAuthContextValue = {
  owner: Owner | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    email: string
    password: string
    full_name?: string
    company_name?: string
    support_email?: string
    support_whatsapp?: string
    country_code: string
  }) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null)

export function OwnerAuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [token, setToken] = useState<string | null>(() => readOwnerToken())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) {
      setOwner(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.ownerMe(token)
      setOwner(response.owner)
    } catch {
      clearOwnerToken()
      setToken(null)
      setOwner(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.ownerLogin({ email, password })
    writeOwnerToken(response.token)
    setToken(response.token)
    setOwner(response.owner)
  }, [])

  const register = useCallback(async (input: {
    email: string
    password: string
    full_name?: string
    company_name?: string
    support_email?: string
    support_whatsapp?: string
    country_code: string
  }) => {
    const response = await api.ownerRegister(input)
    writeOwnerToken(response.token)
    setToken(response.token)
    setOwner(response.owner)
  }, [])

  const logout = useCallback(() => {
    clearOwnerToken()
    setToken(null)
    setOwner(null)
  }, [])

  const value = useMemo<OwnerAuthContextValue>(
    () => ({
      owner,
      token,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [owner, token, loading, login, register, logout, refresh],
  )

  return <OwnerAuthContext.Provider value={value}>{children}</OwnerAuthContext.Provider>
}

export function useOwnerAuth() {
  const context = useContext(OwnerAuthContext)
  if (!context) {
    throw new Error('useOwnerAuth must be used within OwnerAuthProvider')
  }
  return context
}

import { useCallback, useEffect, useState } from 'react'
import { useOwnerAuth } from './useOwnerAuth'
import { api } from '../services/api'

export function useOwnerOnboarding() {
  const { token, owner } = useOwnerAuth()
  const [showWizard, setShowWizard] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!token || !owner) return

    // Check localStorage first — if dismissed, don't show again
    const dismissed = localStorage.getItem(`onboarding_dismissed_${owner.id}`)
    if (dismissed) {
      setChecked(true)
      return
    }

    // Fetch properties — if 0, show wizard
    api
      .getOwnerProperties(token)
      .then((res) => {
        if (res.properties.length === 0) {
          setShowWizard(true)
        }
      })
      .catch(() => {
        /* fail silently */
      })
      .finally(() => setChecked(true))
  }, [token, owner])

  const dismissWizard = useCallback(() => {
    if (owner?.id) {
      localStorage.setItem(`onboarding_dismissed_${owner.id}`, 'true')
    }
    setShowWizard(false)
  }, [owner])

  return { showWizard, checked, dismissWizard }
}

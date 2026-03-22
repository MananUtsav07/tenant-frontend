import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackPageView } from '../utils/analytics'

export function usePageAnalytics() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`)
  }, [location.pathname, location.search])
}

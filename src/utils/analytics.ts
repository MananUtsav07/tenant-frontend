import { API_BASE_URL } from '../services/api'

export type AnalyticsUserType = 'public' | 'owner' | 'tenant' | 'admin' | 'system'

type EventPayload = {
  event_name: string
  user_type?: AnalyticsUserType
  metadata?: Record<string, unknown>
}

function postAnalyticsEvent(payload: EventPayload) {
  const body = JSON.stringify({
    event_name: payload.event_name,
    user_type: payload.user_type ?? 'public',
    metadata: payload.metadata ?? {},
  })

  const endpoint = `${API_BASE_URL}/api/public/analytics`

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' })
    const sent = navigator.sendBeacon(endpoint, blob)
    if (sent) {
      return
    }
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Intentionally ignored: analytics failures should not block UX.
  })
}

export function trackEvent(
  event_name: string,
  options: {
    user_type?: AnalyticsUserType
    metadata?: Record<string, unknown>
  } = {},
) {
  postAnalyticsEvent({
    event_name,
    user_type: options.user_type,
    metadata: options.metadata,
  })
}

export function trackPageView(path?: string) {
  const pathname = path ?? (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/')
  trackEvent('page_view', {
    user_type: 'public',
    metadata: {
      path: pathname,
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    },
  })
}

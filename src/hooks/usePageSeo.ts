import { useEffect } from 'react'

export type SeoOptions = {
  title: string
  description: string
  canonicalPath?: string
  ogType?: 'website' | 'article'
  image?: string
  twitterCard?: 'summary' | 'summary_large_image'
  structuredData?: Record<string, unknown>
}

const APP_NAME = 'Prophives'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function upsertStructuredData(structuredData?: Record<string, unknown>) {
  const scriptId = 'seo-structured-data'
  const existing = document.head.querySelector<HTMLScriptElement>(`script#${scriptId}`)

  if (!structuredData) {
    existing?.remove()
    return
  }

  const script = existing ?? document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.text = JSON.stringify(structuredData)

  if (!existing) {
    document.head.appendChild(script)
  }
}

function splitUrlCandidates(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return []
  }

  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeAbsoluteUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
  const normalized = hasProtocol ? trimmed : trimmed.startsWith('localhost') ? `http://${trimmed}` : `https://${trimmed}`

  try {
    return new URL(normalized).toString()
  } catch {
    return null
  }
}

function resolveSiteUrl(): string {
  const envCandidates = splitUrlCandidates(import.meta.env.VITE_SITE_URL)
  for (const candidate of envCandidates) {
    const normalized = normalizeAbsoluteUrl(candidate)
    if (normalized) {
      return normalized
    }
  }

  return window.location.origin
}

function toAbsoluteUrl(value: string, baseUrl: string, fallback: string): string {
  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return fallback
  }
}

export function usePageSeo({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  image,
  twitterCard = 'summary_large_image',
  structuredData,
}: SeoOptions) {
  const structuredDataKey = structuredData ? JSON.stringify(structuredData) : ''

  useEffect(() => {
    const siteUrl = resolveSiteUrl()
    const canonicalTarget = canonicalPath ?? `${window.location.pathname}${window.location.search}`
    const canonicalUrl = toAbsoluteUrl(canonicalTarget, siteUrl, window.location.href)
    const renderedTitle = `${title} | ${APP_NAME}`

    document.title = renderedTitle

    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', renderedTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('name', 'twitter:card', twitterCard)
    upsertMeta('name', 'twitter:title', renderedTitle)
    upsertMeta('name', 'twitter:description', description)

    if (image) {
      const imageUrl = toAbsoluteUrl(image, siteUrl, image)
      upsertMeta('property', 'og:image', imageUrl)
      upsertMeta('name', 'twitter:image', imageUrl)
    }

    upsertCanonical(canonicalUrl)
    upsertStructuredData(structuredDataKey ? (JSON.parse(structuredDataKey) as Record<string, unknown>) : undefined)
  }, [
    title,
    description,
    canonicalPath,
    ogType,
    image,
    twitterCard,
    structuredDataKey,
  ])
}

import { type SeoOptions, usePageSeo } from '../../hooks/usePageSeo'

export function SEO(props: SeoOptions) {
  usePageSeo(props)
  return null
}

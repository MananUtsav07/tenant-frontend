import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Tenant Login Requirements

- Tenant Access ID (shared by owner)
- Password set during tenant creation
- Optional tenant email for identity verification

## Login Steps

1. Go to **Tenant Login**.
2. Enter Tenant Access ID and password.
3. Submit to access tenant dashboard.

## If login fails

- Confirm Tenant Access ID is exact (case-sensitive).
- Ask owner to verify tenant status is **active**.
- Ask owner to reset tenant password from **Owner > Tenants**.
`

export function DocsTenantLoginPage() {
  return (
    <DocsArticleLayout
      title="Tenant Login Guide"
      description="How tenants authenticate and troubleshoot access issues."
      canonicalPath={ROUTES.docsTenantLogin}
      markdown={markdown}
    />
  )
}

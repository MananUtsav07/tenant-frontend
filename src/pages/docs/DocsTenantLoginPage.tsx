import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Resident login requirements

- Tenant Access ID shared by the owner
- Password set during tenant creation
- Optional resident email for identity verification

## Login steps

1. Go to **Tenant Login**.
2. Enter Tenant Access ID and password.
3. Submit to access the resident workspace.

## If login fails

- Confirm Tenant Access ID is exact.
- Ask the owner to verify tenant status is **active**.
- Ask the owner to reset the tenant password from **Owner Workspace > Tenants**.
`

export function DocsTenantLoginPage() {
  return (
    <DocsArticleLayout
      title="Resident Login Guide"
      description="How residents authenticate and troubleshoot access issues."
      canonicalPath={ROUTES.docsTenantLogin}
      markdown={markdown}
    />
  )
}

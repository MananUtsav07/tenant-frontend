import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## 1. Create your owner account

- Visit **Owner Login** and choose **Register**.
- Add your company name and support contact details.

## 2. Create properties

- Go to **Owner Dashboard > Properties**.
- Add property name, address, and optional unit details.

## 3. Add tenants

- Open **Owner Dashboard > Tenants**.
- Select a property and create tenant credentials.
- Tenant Access ID is auto-generated and shown in the table.

## 4. Start operations

- Track support tickets from the **Tickets** page.
- Review reminders and updates in **Notifications**.
`

export function DocsGettingStartedPage() {
  return (
    <DocsArticleLayout
      title="Getting Started"
      description="Owner onboarding checklist for TenantFlow."
      canonicalPath={ROUTES.docsGettingStarted}
      markdown={markdown}
    />
  )
}

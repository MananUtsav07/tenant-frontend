import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Owner workspace overview

The owner workspace provides:

- Active resident count
- Open support ticket count
- Overdue rent indicator
- Pending reminder count
- Unread notification count

## Core sections

- **Properties**: Add, edit, or remove properties.
- **Tenants**: Create resident credentials and lease details.
- **Tickets**: Update ticket status from open to closed.
- **Notifications**: Review reminder and ticket alerts.

## Best practices

- Process reminders daily.
- Keep resident contact details current.
- Resolve tickets with status updates to maintain visibility.
`

export function DocsOwnerDashboardPage() {
  return (
    <DocsArticleLayout
      title="Owner Workspace Guide"
      description="Reference for owner workflows and operational best practices."
      canonicalPath={ROUTES.docsOwnerDashboard}
      markdown={markdown}
    />
  )
}

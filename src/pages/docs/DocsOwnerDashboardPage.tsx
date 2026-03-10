import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Owner Dashboard Overview

The owner dashboard provides:

- Active tenant count
- Open support ticket count
- Overdue rent indicator
- Pending reminder count
- Unread notification count

## Core sections

- **Properties**: Add/edit/remove properties.
- **Tenants**: Create tenant credentials and lease details.
- **Tickets**: Update ticket status (open, in progress, resolved, closed).
- **Notifications**: Review reminder and ticket alerts.

## Best practices

- Process reminders daily.
- Keep tenant contact details current.
- Resolve tickets with status updates to maintain visibility.
`

export function DocsOwnerDashboardPage() {
  return (
    <DocsArticleLayout
      title="Owner Dashboard Guide"
      description="Reference for owner workflows and operational best practices."
      canonicalPath={ROUTES.docsOwnerDashboard}
      markdown={markdown}
    />
  )
}

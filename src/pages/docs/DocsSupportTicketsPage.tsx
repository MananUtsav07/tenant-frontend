import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Support Ticket Lifecycle

1. Tenant creates ticket with subject and message.
2. Ticket appears in owner and admin ticket queues.
3. Owner updates status as work progresses.
4. Ticket is resolved and closed when complete.

## Status definitions

- **open**: New request pending review
- **in progress**: Work started
- **resolved**: Work complete, pending close
- **closed**: Finalized

## Response guidelines

- Keep ticket subjects clear and specific.
- Update status quickly so tenants have visibility.
- Use notifications to prioritize high-impact issues.
`

export function DocsSupportTicketsPage() {
  return (
    <DocsArticleLayout
      title="Support Tickets Guide"
      description="How support ticket workflows function across tenant and owner dashboards."
      canonicalPath={ROUTES.docsSupportTickets}
      markdown={markdown}
    />
  )
}

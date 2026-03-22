import { DocsArticleLayout } from '../../components/docs/DocsArticleLayout'
import { ROUTES } from '../../routes/constants'

const markdown = `
## Support ticket lifecycle

1. Resident creates a ticket with a subject and message.
2. Ticket appears in the owner queue.
3. The owner updates status as work progresses.
4. Ticket is resolved and closed when complete.

## Status definitions

- **open**: New request pending review
- **in progress**: Work started
- **resolved**: Work complete, pending close
- **closed**: Finalized

## Response guidelines

- Keep ticket subjects clear and specific.
- Update status quickly so residents have visibility.
- Use notifications to prioritize high-impact issues.
`

export function DocsSupportTicketsPage() {
  return (
    <DocsArticleLayout
      title="Support Tickets Guide"
      description="How support ticket workflows function across resident and owner workspaces."
      canonicalPath={ROUTES.docsSupportTickets}
      markdown={markdown}
    />
  )
}

import { Button } from '../common/Button'

type AdminPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, totalItems, onPageChange }: AdminPaginationProps) {
  return (
    <div className="ph-form-toolbar flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 sm:p-5">
      <p className="text-sm text-[var(--ph-text-muted)]">
        Page {page} of {totalPages} - {totalItems} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}



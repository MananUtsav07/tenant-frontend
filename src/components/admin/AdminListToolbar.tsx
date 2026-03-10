type SortOption = {
  value: string
  label: string
}

type OrganizationOption = {
  value: string
  label: string
}

type AdminListToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  sortOptions: SortOption[]
  organizationId?: string
  onOrganizationIdChange?: (value: string) => void
  organizationOptions?: OrganizationOption[]
}

export function AdminListToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  sortOptions,
  organizationId,
  onOrganizationIdChange,
  organizationOptions = [],
}: AdminListToolbarProps) {
  const organizationFilterEnabled = typeof onOrganizationIdChange === 'function'

  return (
    <div className={`grid gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 ${organizationFilterEnabled ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
      <label className="block space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-600">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search..."
          className="tf-field"
        />
      </label>

      <div className={`grid gap-3 ${organizationFilterEnabled ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-600">Sort By</span>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="tf-field"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-600">Order</span>
          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as 'asc' | 'desc')}
            className="tf-field"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>

        {organizationFilterEnabled ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-600">Organization</span>
            <select
              value={organizationId ?? ''}
              onChange={(event) => onOrganizationIdChange(event.target.value)}
              className="tf-field"
            >
              <option value="">All organizations</option>
              {organizationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  )
}





import { FormSelect } from '../common/FormSelect'
import { SearchInput } from '../common/SearchInput'
import { dashboardFormToolbarClassName } from '../common/formTheme'

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
    <div
      className={`${dashboardFormToolbarClassName} grid gap-4 ${
        organizationFilterEnabled ? 'xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]' : 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)]'
      }`}
    >
      <SearchInput
        label="Search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search records, names, emails, or notes..."
        wrapperClassName="min-w-0"
      />

      <div className={`grid gap-3 ${organizationFilterEnabled ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <FormSelect
          label="Sort By"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="Order"
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </FormSelect>

        {organizationFilterEnabled ? (
          <FormSelect
            label="Organization"
            value={organizationId ?? ''}
            onChange={(event) => onOrganizationIdChange(event.target.value)}
          >
            <option value="">All organizations</option>
            {organizationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        ) : null}
      </div>
    </div>
  )
}

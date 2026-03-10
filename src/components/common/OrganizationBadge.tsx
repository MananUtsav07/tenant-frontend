type OrganizationBadgeProps = {
  name?: string | null
  slug?: string | null
  className?: string
}

export function OrganizationBadge({ name, slug, className }: OrganizationBadgeProps) {
  const label = name?.trim() || slug?.trim() || 'Organization'

  return (
    <span
      className={`inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-[0_10px_24px_-22px_rgba(37,99,235,0.8)] ${className ?? ''}`}
    >
      {label}
    </span>
  )
}


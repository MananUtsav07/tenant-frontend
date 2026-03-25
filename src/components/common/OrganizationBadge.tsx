type OrganizationBadgeProps = {
  name?: string | null
  slug?: string | null
  className?: string
}

export function OrganizationBadge({ name, slug, className }: OrganizationBadgeProps) {
  const label = name?.trim() || slug?.trim() || 'Organization'

  return (
    <span
      className={`inline-flex items-center rounded-full border border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.1)] px-2.5 py-1 text-xs font-medium text-[#92750A] shadow-sm ${className ?? ''}`}
    >
      {label}
    </span>
  )
}


type OrganizationBadgeProps = {
  name?: string | null
  slug?: string | null
  className?: string
}

export function OrganizationBadge({ name, slug, className }: OrganizationBadgeProps) {
  const label = name?.trim() || slug?.trim() || 'Organization'

  return (
    <span
      className={`inline-flex items-center rounded-full border border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.08)] px-2.5 py-1 text-xs font-medium text-[#f1cb85] shadow-[0_10px_24px_-22px_rgba(240,163,35,0.42)] ${className ?? ''}`}
    >
      {label}
    </span>
  )
}


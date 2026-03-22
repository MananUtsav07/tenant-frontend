export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-GB').format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function normalizeCurrencyCode(currencyCode: string | null | undefined): string {
  const normalized = currencyCode?.trim().toUpperCase()
  if (!normalized) {
    return 'INR'
  }
  return normalized
}

export function formatCurrency(value: number | null | undefined, currencyCode?: string | null): string {
  const amount = typeof value === 'number' ? value : 0
  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode)

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalizedCurrencyCode,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }
}

export function getCurrencyMarker(currencyCode?: string | null): string {
  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode)

  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalizedCurrencyCode,
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol',
    }).formatToParts(0)

    return parts.find((part) => part.type === 'currency')?.value ?? normalizedCurrencyCode
  } catch {
    return '₹'
  }
}

export function formatCurrencyInr(value: number | null | undefined): string {
  return formatCurrency(value, 'INR')
}

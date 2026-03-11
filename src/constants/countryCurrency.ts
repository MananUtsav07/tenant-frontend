export type CountryOption = {
  code: string
  label: string
  currency: string
}

export const topCountryOptions: CountryOption[] = [
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED' },
  { code: 'CA', label: 'Canada', currency: 'CAD' },
  { code: 'AU', label: 'Australia', currency: 'AUD' },
  { code: 'SG', label: 'Singapore', currency: 'SGD' },
  { code: 'DE', label: 'Germany', currency: 'EUR' },
  { code: 'FR', label: 'France', currency: 'EUR' },
  { code: 'SA', label: 'Saudi Arabia', currency: 'SAR' },
]

export const otherCountryOptions: CountryOption[] = [
  { code: 'NZ', label: 'New Zealand', currency: 'NZD' },
  { code: 'MY', label: 'Malaysia', currency: 'MYR' },
  { code: 'QA', label: 'Qatar', currency: 'QAR' },
  { code: 'ZA', label: 'South Africa', currency: 'ZAR' },
  { code: 'JP', label: 'Japan', currency: 'JPY' },
]

export const allCountryOptions: CountryOption[] = [...topCountryOptions, ...otherCountryOptions]

export const countryToCurrencyMap = allCountryOptions.reduce<Record<string, string>>((accumulator, option) => {
  accumulator[option.code] = option.currency
  return accumulator
}, {})

export function findCountryOption(countryCode: string | null | undefined): CountryOption | null {
  if (!countryCode) {
    return null
  }
  const normalizedCode = countryCode.trim().toUpperCase()
  return allCountryOptions.find((option) => option.code === normalizedCode) ?? null
}

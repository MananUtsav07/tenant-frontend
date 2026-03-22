import { Search } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { FormInput } from './FormInput'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  hideLabel?: boolean
  wrapperClassName?: string
}

export function SearchInput(props: SearchInputProps) {
  return <FormInput {...props} type="search" leadingIcon={<Search className="h-4 w-4" />} />
}

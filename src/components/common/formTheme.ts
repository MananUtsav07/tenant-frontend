import clsx from 'clsx'
import type { GroupBase, StylesConfig } from 'react-select'

export const dashboardFormPanelClassName =
  'ph-form-panel rounded-xl p-5 sm:p-6 lg:p-7'

export const dashboardFormToolbarClassName =
  'ph-form-toolbar rounded-xl p-4 sm:p-5 lg:p-6'

export const dashboardInfoPanelClassName =
  'rounded-xl border border-[rgba(83,88,100,0.42)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--ph-text-soft)] shadow-[0_18px_42px_-34px_rgba(0,0,0,0.72)]'

export const dashboardDangerPanelClassName =
  'rounded-lg border border-[rgba(244,163,163,0.28)] bg-[rgba(120,28,28,0.18)] px-4 py-3 text-sm text-red-200 shadow-[0_16px_34px_-28px_rgba(127,29,29,0.72)]'

export const dashboardSuccessPanelClassName =
  'rounded-lg border border-[rgba(139,208,181,0.26)] bg-[rgba(22,101,52,0.18)] px-4 py-3 text-sm text-[var(--ph-success)] shadow-[0_16px_34px_-28px_rgba(22,101,52,0.72)]'

export function getDashboardControlClassName(
  baseClassName: string,
  className?: string,
  options?: {
    variant?: 'default' | 'light'
    hasLeadingIcon?: boolean
    hasTrailingAdornment?: boolean
  },
) {
  return clsx(
    baseClassName,
    options?.hasLeadingIcon ? 'pl-11' : undefined,
    options?.hasTrailingAdornment ? 'pr-11' : undefined,
    className,
  )
}

export function getProphivesReactSelectStyles<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      minHeight: '56px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? 'rgba(240, 163, 35, 0.54)' : 'rgba(83, 88, 100, 0.48)',
      background:
        'linear-gradient(180deg, rgba(12, 19, 34, 0.9), rgba(10, 14, 25, 0.98))',
      boxShadow: state.isFocused
        ? '0 0 0 3px rgba(240, 163, 35, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 18px 36px -28px rgba(0, 0, 0, 0.78)',
      '&:hover': {
        borderColor: state.isFocused ? 'rgba(240, 163, 35, 0.54)' : 'rgba(151, 105, 34, 0.42)',
      },
    }),
    valueContainer: (baseStyles) => ({
      ...baseStyles,
      padding: '0 0.9rem',
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: '#97999e',
    }),
    input: (baseStyles) => ({
      ...baseStyles,
      color: '#eeeff0',
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: '#eeeff0',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      overflow: 'hidden',
      border: '1px solid rgba(83, 88, 100, 0.48)',
      borderRadius: '0.75rem',
      background:
        'linear-gradient(180deg, rgba(18, 24, 38, 0.98), rgba(10, 14, 25, 1))',
      boxShadow: '0 28px 54px -30px rgba(0, 0, 0, 0.82)',
    }),
    menuList: (baseStyles) => ({
      ...baseStyles,
      padding: '0.4rem',
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      borderRadius: '0.5rem',
      padding: '0.7rem 0.85rem',
      fontSize: '0.925rem',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      color: state.isDisabled ? '#727784' : '#eeeff0',
      backgroundColor: state.isSelected
        ? 'rgba(240, 163, 35, 0.12)'
        : state.isFocused
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
    }),
    indicatorSeparator: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: 'rgba(83, 88, 100, 0.48)',
    }),
    dropdownIndicator: (baseStyles, state) => ({
      ...baseStyles,
      color: state.isFocused ? '#f0a323' : '#97999e',
      '&:hover': {
        color: '#f0a323',
      },
    }),
  }
}

import clsx from 'clsx'
import type { GroupBase, StylesConfig } from 'react-select'

export const dashboardFormPanelClassName =
  'ph-form-panel rounded-xl p-5 sm:p-6 lg:p-7'

export const dashboardFormToolbarClassName =
  'ph-form-toolbar rounded-xl p-4 sm:p-5 lg:p-6'

export const dashboardInfoPanelClassName =
  'rounded-xl border border-[#272839] bg-[rgba(34,81,227,0.06)] p-4 text-sm text-[var(--ph-text-soft)] shadow-[0_18px_42px_-34px_rgba(0,0,0,0.72)]'

export const dashboardDangerPanelClassName =
  'rounded-lg border border-[rgba(242,84,97,0.3)] bg-[rgba(242,84,97,0.08)] px-4 py-3 text-sm text-[#F25461] shadow-[0_16px_34px_-28px_rgba(242,84,97,0.2)]'

export const dashboardSuccessPanelClassName =
  'rounded-lg border border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] px-4 py-3 text-sm text-[var(--ph-success)] shadow-[0_16px_34px_-28px_rgba(50,195,130,0.2)]'

export function getDashboardControlClassName(
  baseClassName: string,
  className?: string,
  options?: {
    variant?: 'default' | 'light' | 'dark'
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
>(theme: 'light' | 'dark' = 'dark'): StylesConfig<Option, IsMulti, Group> {
  if (theme === 'light') {
    return {
      control: (baseStyles, state) => ({
        ...baseStyles,
        minHeight: '44px',
        borderRadius: '0.75rem',
        borderColor: state.isFocused ? '#2251E3' : '#272839',
        background: '#101114',
        boxShadow: state.isFocused
          ? '0 0 0 3px rgba(34, 81, 227, 0.2)'
          : 'none',
        '&:hover': {
          borderColor: 'rgba(34, 81, 227, 0.5)',
        },
      }),
      valueContainer: (baseStyles) => ({
        ...baseStyles,
        padding: '0 0.875rem',
      }),
      placeholder: (baseStyles) => ({
        ...baseStyles,
        color: '#8D8D96',
      }),
      input: (baseStyles) => ({
        ...baseStyles,
        color: '#FFFFFF',
      }),
      singleValue: (baseStyles) => ({
        ...baseStyles,
        color: '#FFFFFF',
      }),
      menu: (baseStyles) => ({
        ...baseStyles,
        overflow: 'hidden',
        border: '1px solid #272839',
        borderRadius: '0.75rem',
        background: '#101114',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      }),
      menuList: (baseStyles) => ({
        ...baseStyles,
        padding: '0.5rem',
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        borderRadius: '0.5rem',
        padding: '0.625rem 0.875rem',
        fontSize: '0.875rem',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        color: state.isDisabled ? '#8D8D96' : '#FFFFFF',
        backgroundColor: state.isSelected
          ? 'rgba(34, 81, 227, 0.2)'
          : state.isFocused
            ? 'rgba(34, 81, 227, 0.1)'
            : 'transparent',
      }),
      indicatorSeparator: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: '#272839',
      }),
      dropdownIndicator: (baseStyles, state) => ({
        ...baseStyles,
        color: state.isFocused ? '#4E79FF' : '#8D8D96',
        '&:hover': {
          color: '#4E79FF',
        },
      }),
    }
  }

  // Dark theme
  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      minHeight: '56px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? 'rgba(34, 81, 227, 0.6)' : '#272839',
      background: '#101114',
      boxShadow: state.isFocused
        ? '0 0 0 3px rgba(34, 81, 227, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 18px 36px -28px rgba(0, 0, 0, 0.78)',
      '&:hover': {
        borderColor: state.isFocused ? 'rgba(34, 81, 227, 0.6)' : 'rgba(34, 81, 227, 0.3)',
      },
    }),
    valueContainer: (baseStyles) => ({
      ...baseStyles,
      padding: '0 0.9rem',
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: '#8D8D96',
    }),
    input: (baseStyles) => ({
      ...baseStyles,
      color: '#FFFFFF',
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: '#FFFFFF',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      overflow: 'hidden',
      border: '1px solid #272839',
      borderRadius: '0.75rem',
      background: '#141519',
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
      color: state.isDisabled ? '#8D8D96' : '#FFFFFF',
      backgroundColor: state.isSelected
        ? 'rgba(34, 81, 227, 0.18)'
        : state.isFocused
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
    }),
    indicatorSeparator: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: '#272839',
    }),
    dropdownIndicator: (baseStyles, state) => ({
      ...baseStyles,
      color: state.isFocused ? '#4E79FF' : '#8D8D96',
      '&:hover': {
        color: '#4E79FF',
      },
    }),
  }
}

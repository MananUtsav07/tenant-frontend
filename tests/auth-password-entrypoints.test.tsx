import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/hooks/useOwnerAuth', () => ({
  useOwnerAuth: () => ({
    owner: null,
    login: vi.fn(),
    register: vi.fn(),
  }),
}))

vi.mock('../src/hooks/useTenantAuth', () => ({
  useTenantAuth: () => ({
    tenant: null,
    login: vi.fn(),
  }),
}))

vi.mock('../src/hooks/usePageSeo', () => ({
  usePageSeo: vi.fn(),
}))

vi.mock('../src/utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

const { OwnerLoginPage } = await import('../src/pages/auth/OwnerLoginPage')
const { TenantLoginPage } = await import('../src/pages/auth/TenantLoginPage')
const { OwnerForgotPasswordPage } = await import('../src/pages/auth/OwnerForgotPasswordPage')
const { TenantForgotPasswordPage } = await import('../src/pages/auth/TenantForgotPasswordPage')

describe('forgot-password entrypoints and branded pages', () => {
  it('shows the owner forgot-password link on the owner login screen', () => {
    render(
      <MemoryRouter>
        <OwnerLoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/owner/forgot-password')
  })

  it('shows the tenant forgot-password link on the tenant login screen', () => {
    render(
      <MemoryRouter>
        <TenantLoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/tenant/forgot-password')
  })

  it('renders the owner and tenant forgot-password pages with branded Prophives copy', () => {
    const { rerender } = render(
      <MemoryRouter>
        <OwnerForgotPasswordPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Owner Password Access')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <TenantForgotPasswordPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Resident Password Access')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })
})

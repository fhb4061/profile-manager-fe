import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

function authenticated() {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  })
}

function unauthenticated() {
  mockUseAuth.mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  })
}

describe('App routes', () => {
  it('renders Login component at /login path', () => {
    unauthenticated()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renders Home component at / path when authenticated', () => {
    authenticated()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /profiles/i })).toBeInTheDocument()
  })

  it('redirects to /login when visiting / while unauthenticated', () => {
    unauthenticated()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })
})

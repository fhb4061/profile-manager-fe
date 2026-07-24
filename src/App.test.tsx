import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: [] }) },
}))

function renderApp(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

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

    renderApp('/login')
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renders Home component at / path when authenticated', () => {
    authenticated()

    renderApp('/')
    expect(screen.getByRole('heading', { name: /profiles/i })).toBeInTheDocument()
  })

  it('redirects to /login when visiting / while unauthenticated', () => {
    unauthenticated()

    renderApp('/')
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })
})

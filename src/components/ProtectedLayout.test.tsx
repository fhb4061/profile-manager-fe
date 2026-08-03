import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedLayout } from './ProtectedLayout'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}))

function renderProtected() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProtectedLayout', () => {
  it('shows a loading state while auth is initializing', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false })

    renderProtected()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /toggle dark mode/i })).not.toBeInTheDocument()
  })

  it('renders the protected content wrapped in the app shell when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    renderProtected()

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profile manager/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /toggle dark mode/i })).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    renderProtected()

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /toggle dark mode/i })).not.toBeInTheDocument()
  })
})

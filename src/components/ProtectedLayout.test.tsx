import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ProtectedLayout } from './ProtectedLayout'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderProtected(initialEntry = '/profiles') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Landing page</div>} />
        <Route element={<ProtectedLayout />}>
          <Route path="/profiles" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedLayout', () => {
  it('shows a loading state while auth is initializing', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false })

    renderProtected()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the protected content directly, without header markup, when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    renderProtected()

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /profile manager/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /toggle dark mode/i })).not.toBeInTheDocument()
  })

  it('redirects to / when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    renderProtected()

    expect(screen.getByText(/landing page/i)).toBeInTheDocument()
  })
})

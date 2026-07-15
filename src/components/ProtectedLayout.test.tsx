import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './ProtectedLayout'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<div>Protected content</div>} />
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

  it('renders the protected content when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    renderProtected()

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    renderProtected()

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })
})

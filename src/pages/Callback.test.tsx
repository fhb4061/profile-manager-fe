import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Callback } from './Callback'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderCallback() {
  return render(
    <MemoryRouter initialEntries={['/callback']}>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/profile/1" element={<div>Profile 1 page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Callback page', () => {
  it('shows a loading state while auth is processing the redirect', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: undefined,
    })

    renderCallback()

    expect(screen.getByText(/signing you in/i)).toBeInTheDocument()
  })

  it('navigates to / once authenticated with no restored path', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { state: undefined },
    })

    renderCallback()

    expect(await screen.findByText(/home page/i)).toBeInTheDocument()
  })

  it('navigates to the restored path once authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { state: { returnTo: '/profile/1' } },
    })

    renderCallback()

    expect(await screen.findByText(/profile 1 page/i)).toBeInTheDocument()
  })

  it('redirects to / when auth fails to complete', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      error: new Error('access_denied'),
    })

    renderCallback()

    expect(await screen.findByText(/home page/i)).toBeInTheDocument()
  })
})

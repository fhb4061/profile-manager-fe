import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileDetail } from './ProfileDetail'

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  }),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

import { api } from '@/lib/api'

function renderAt(initialId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/profile/${initialId}`]}>
        <Link to="/profile/2">go to profile 2</Link>
        <Routes>
          <Route path="/profile/:id" element={<ProfileDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Profile detail page', () => {
  it('shows the profile matching the current route id when navigating between profiles', async () => {
    vi.mocked(api.get).mockImplementation((url: string) =>
      url === '/profiles/1'
        ? Promise.resolve({ data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL' } })
        : Promise.resolve({ data: { sub: '2', givenName: 'Alan', familyName: 'Turing', initials: 'AT' } })
    )
    const user = userEvent.setup()

    renderAt('1')
    expect(await screen.findByRole('heading', { name: /ada lovelace/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /go to profile 2/i }))

    expect(await screen.findByRole('heading', { name: /alan turing/i })).toBeInTheDocument()
  })

  it('shows skeleton placeholders while the profile is loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

    const { container } = renderAt('1')

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})

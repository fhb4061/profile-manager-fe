import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeaderAuth } from './HeaderAuth'

const mockUseAuth = vi.fn()
const signoutRedirect = vi.fn()
const signinRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

import { api } from '@/lib/api'

function renderHeaderAuth() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HeaderAuth />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function loading() {
  mockUseAuth.mockReturnValue({
    isLoading: true,
    isAuthenticated: false,
    signinRedirect,
    signoutRedirect,
  })
}

function loggedOut() {
  mockUseAuth.mockReturnValue({
    isLoading: false,
    isAuthenticated: false,
    signinRedirect,
    signoutRedirect,
  })
}

function loggedIn() {
  mockUseAuth.mockReturnValue({
    isLoading: false,
    isAuthenticated: true,
    signinRedirect,
    signoutRedirect,
  })
}

describe('HeaderAuth', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    signoutRedirect.mockClear()
    signinRedirect.mockClear()
  })

  describe('while auth is initializing', () => {
    it('shows a skeleton avatar', () => {
      loading()

      const { container } = renderHeaderAuth()

      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('does not call GET /profile', () => {
      loading()

      renderHeaderAuth()

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('when logged out', () => {
    it('shows a Login button instead of the account menu', () => {
      loggedOut()

      renderHeaderAuth()

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /account menu/i })).not.toBeInTheDocument()
    })

    it('does not call GET /profile', () => {
      loggedOut()

      renderHeaderAuth()

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('when logged in', () => {
    beforeEach(() => {
      loggedIn()
    })

    it('shows a skeleton avatar while the profile is loading', () => {
      vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

      const { container } = renderHeaderAuth()

      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('shows the initials once the profile loads', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })

      renderHeaderAuth()

      expect(await screen.findByText('AL')).toBeInTheDocument()
    })

    it('shows a generic fallback icon when the profile fails to load', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('network error'))

      const { container } = renderHeaderAuth()

      await screen.findByRole('button', { name: /account menu/i })
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('opens a menu with Edit profile and Log out when the avatar is clicked', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderHeaderAuth()
      await user.click(await screen.findByRole('button', { name: /account menu/i }))

      expect(screen.getByRole('button', { name: /edit profile/i })).toHaveAttribute('href', '/profile/edit')
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    })

    it('calls signoutRedirect when Log out is clicked', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderHeaderAuth()
      await user.click(await screen.findByRole('button', { name: /account menu/i }))
      await user.click(screen.getByRole('button', { name: /log out/i }))

      expect(signoutRedirect).toHaveBeenCalledTimes(1)
    })

    it('passes logout_uri as an extra query param, since Cognito ignores post_logout_redirect_uri', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderHeaderAuth()
      await user.click(await screen.findByRole('button', { name: /account menu/i }))
      await user.click(screen.getByRole('button', { name: /log out/i }))

      expect(signoutRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          extraQueryParams: expect.objectContaining({
            logout_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
            client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
          }),
        })
      )
    })
  })
})

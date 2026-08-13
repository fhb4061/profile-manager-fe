import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './AppShell'

const mockUseAuth = vi.fn()
const signoutRedirect = vi.fn()
const signinRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}))

import { api } from '@/lib/api'

function renderShell(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<div>content</div>} />
            <Route path="/camera" element={<div>camera content</div>} />
          </Route>
        </Routes>
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

describe('AppShell', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    signoutRedirect.mockClear()
    signinRedirect.mockClear()
  })

  it('renders the routed content and a theme toggle in the header', () => {
    loggedIn()
    vi.mocked(api.get).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })

    renderShell()

    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /toggle dark mode/i })).toBeInTheDocument()
  })

  it('shows a Home breadcrumb linking to / in place of the old Profile Manager link', () => {
    loggedIn()
    vi.mocked(api.get).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })

    renderShell()

    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Profile Manager')).not.toBeInTheDocument()
  })

  it('shows a persistent Home icon link to / even on a fresh load of a non-Home page', () => {
    loggedIn()
    vi.mocked(api.get).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })

    renderShell('/camera')

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })

  describe('while auth is initializing', () => {
    it('shows a skeleton avatar', () => {
      loading()

      const { container } = renderShell()

      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('does not call GET /profile', () => {
      loading()

      renderShell()

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('when logged out', () => {
    it('shows a Login button instead of the account menu', () => {
      loggedOut()

      renderShell()

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /account menu/i })).not.toBeInTheDocument()
    })

    it('does not call GET /profile', () => {
      loggedOut()

      renderShell()

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('when logged in', () => {
    beforeEach(() => {
      loggedIn()
    })

    it('shows a skeleton avatar while the profile is loading', () => {
      vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

      const { container } = renderShell()

      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('shows the initials once the profile loads', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })

      renderShell()

      expect(await screen.findByText('AL')).toBeInTheDocument()
    })

    it('shows a generic fallback icon when the profile fails to load', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('network error'))

      const { container } = renderShell()

      await screen.findByRole('button', { name: /account menu/i })
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('opens a menu with Edit profile and Log out when the avatar is clicked', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderShell()
      await user.click(await screen.findByRole('button', { name: /account menu/i }))

      expect(screen.getByRole('button', { name: /edit profile/i })).toHaveAttribute('href', '/profile/edit')
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    })

    it('calls signoutRedirect when Log out is clicked', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderShell()
      await user.click(await screen.findByRole('button', { name: /account menu/i }))
      await user.click(screen.getByRole('button', { name: /log out/i }))

      expect(signoutRedirect).toHaveBeenCalledTimes(1)
    })

    it('passes logout_uri as an extra query param, since Cognito ignores post_logout_redirect_uri', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
      })
      const user = userEvent.setup()

      renderShell()
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

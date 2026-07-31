import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './AppShell'

const signoutRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signoutRedirect,
  }),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}))

import { api } from '@/lib/api'

function renderShell() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AppShell account menu', () => {
  it('renders a theme toggle in the header', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })

    renderShell()

    expect(screen.getByRole('switch', { name: /toggle dark mode/i })).toBeInTheDocument()
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

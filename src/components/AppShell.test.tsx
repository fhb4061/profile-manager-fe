import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './AppShell'

const signoutRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signoutRedirect,
  }),
}))

describe('AppShell logout control', () => {
  it('calls signoutRedirect when Log out is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(signoutRedirect).toHaveBeenCalledTimes(1)
  })

  it('passes logout_uri as an extra query param, since Cognito ignores post_logout_redirect_uri', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppShell>
          <div>content</div>
        </AppShell>
      </MemoryRouter>
    )

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

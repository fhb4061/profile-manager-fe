import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginButton } from './LoginButton'

const signinRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signinRedirect,
  }),
}))

describe('LoginButton', () => {
  beforeEach(() => {
    signinRedirect.mockClear()
  })

  it('renders a "Log in" button', () => {
    render(
      <MemoryRouter>
        <LoginButton />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('calls signinRedirect with no return state when there is no attempted route', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginButton />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signinRedirect).toHaveBeenCalledWith(undefined)
  })

  it('passes the originally-requested path as return state when redirected from a protected route', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/',
            state: { from: { pathname: '/profile/1', search: '' } },
          },
        ]}
      >
        <LoginButton />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: '/profile/1' },
    })
  })
})

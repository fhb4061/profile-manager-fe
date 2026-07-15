import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Login } from './Login'

const signinRedirect = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signinRedirect,
  }),
}))

describe('Login page', () => {
  beforeEach(() => {
    signinRedirect.mockClear()
  })

  it('renders a single "Log in" button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('calls signinRedirect when the Log in button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signinRedirect).toHaveBeenCalledTimes(1)
  })

  it('calls signinRedirect with no return state when arriving at /login directly', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
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
            pathname: '/login',
            state: { from: { pathname: '/profile/1', search: '' } },
          },
        ]}
      >
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: '/profile/1' },
    })
  })
})

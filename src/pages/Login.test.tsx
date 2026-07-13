import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from './Login'
import { Home } from './Home'

describe('Login form', () => {
  it('renders email input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('renders password input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('shows email validation error after blur with invalid email', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const emailInput = screen.getByPlaceholderText(/email/i)

    await user.type(emailInput, 'invalid')
    await user.click(screen.getByPlaceholderText(/password/i))

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('shows password validation error after blur with invalid password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await user.type(passwordInput, 'short')
    await user.click(screen.getByPlaceholderText(/email/i))

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
  })

  it('login button is disabled initially', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeDisabled()
  })

  it('login button is disabled with invalid email', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await user.type(emailInput, 'invalid')
    await user.type(passwordInput, 'validpass123')

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeDisabled()
  })

  it('login button is disabled with invalid password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await user.type(emailInput, 'user@example.com')
    await user.type(passwordInput, 'short')

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeDisabled()
  })

  it('login button is enabled with valid email and password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await user.type(emailInput, 'user@example.com')
    await user.type(passwordInput, 'validpass123')

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).not.toBeDisabled()
  })

  it('navigates to home page when login button is clicked with valid credentials', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await user.type(emailInput, 'user@example.com')
    await user.type(passwordInput, 'validpass123')

    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)

    expect(screen.getByRole('heading', { name: /profiles/i })).toBeInTheDocument()
  })
})

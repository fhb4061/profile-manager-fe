import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('renders HeaderAuth in the header', () => {
    loggedOut()

    renderShell()

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders the animated wave background behind an opaque header', () => {
    loggedOut()

    const { container } = renderShell()

    expect(container.querySelectorAll('svg.animate-wave-slow')).toHaveLength(1)
    expect(container.querySelector('header')).toHaveClass('bg-background')
  })
})

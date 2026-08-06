import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const mockUseAuth = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: [] }) },
}))

vi.mock('@/lib/camera', () => ({
  getCameraStream: vi.fn().mockReturnValue(new Promise(() => {})),
}))

function renderApp(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function authenticated() {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  })
}

function unauthenticated() {
  mockUseAuth.mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
  })
}

describe('App routes', () => {
  it('renders the public landing page at / when unauthenticated', () => {
    unauthenticated()

    renderApp('/')
    expect(screen.getByText(/welcome to profile manager/i)).toBeInTheDocument()
  })

  it('renders the public landing page at / when authenticated', () => {
    authenticated()

    renderApp('/')
    expect(screen.getByText(/welcome to profile manager/i)).toBeInTheDocument()
  })

  it('renders Profiles at /profiles when authenticated', async () => {
    authenticated()

    renderApp('/profiles')
    expect(await screen.findByRole('heading', { name: /profiles/i })).toBeInTheDocument()
  })

  it('redirects to / when visiting /profiles while unauthenticated', () => {
    unauthenticated()

    renderApp('/profiles')
    expect(screen.getByText(/welcome to profile manager/i)).toBeInTheDocument()
  })

  it('renders EditProfile component at /profile/edit path when authenticated', () => {
    authenticated()

    renderApp('/profile/edit')
    expect(screen.getByRole('heading', { name: /edit profile/i })).toBeInTheDocument()
  })

  it('renders CameraFeed at /camera when unauthenticated', () => {
    unauthenticated()

    const { container } = renderApp('/camera')
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })
})

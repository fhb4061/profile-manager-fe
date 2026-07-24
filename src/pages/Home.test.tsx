import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

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

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Home profile list', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
  })

  it('shows 3 skeleton placeholder rows while profiles are loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

    const { container } = renderHome()

    const rows = container.querySelectorAll('li')
    expect(rows).toHaveLength(3)
    rows.forEach((row) => {
      expect(row.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    })
  })
})

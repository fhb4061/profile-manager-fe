import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Profiles } from './Profiles'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

import { api } from '@/lib/api'

function renderProfiles() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/profiles']}>
        <Profiles />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Profiles list', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
  })

  it('shows 3 skeleton placeholder rows while profiles are loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

    const { container } = renderProfiles()

    const rows = container.querySelectorAll('li')
    expect(rows).toHaveLength(3)
    rows.forEach((row) => {
      expect(row.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    })
  })

  it('shows an error message when profiles fail to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network error'))

    const { findByRole } = renderProfiles()

    expect(await findByRole('alert')).toHaveTextContent(/couldn't load profiles/i)
  })
})

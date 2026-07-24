import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

vi.mock('@/lib/api', () => ({
  api: { put: vi.fn() },
}))

import { api } from '@/lib/api'
import { useUpdateProfile } from './useUpdateProfile'

function renderWithClient(sub: string | undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useUpdateProfile(sub), { wrapper })
  return { result, invalidateQueries }
}

describe('useUpdateProfile', () => {
  it('sends givenName and familyName to PUT /profile', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })
    const { result } = renderWithClient('1')

    result.current.mutate({ givenName: 'Ada', familyName: 'Lovelace' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.put).toHaveBeenCalledWith('/profile', { givenName: 'Ada', familyName: 'Lovelace' })
  })

  it('invalidates the my-profile, profiles list, and this profile caches on success', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })
    const { result, invalidateQueries } = renderWithClient('1')

    result.current.mutate({ givenName: 'Ada', familyName: 'Lovelace' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profiles'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', '1'] })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePhotoUpload } from './usePhotoUpload'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

import { api } from '@/lib/api'

function renderPhotoUpload(sub = '1', photoUrl: string | undefined = undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => usePhotoUpload(sub, photoUrl), { wrapper })
}

function oversizedFile() {
  const file = new File(['x'.repeat(10)], 'huge.png', { type: 'image/png' })
  Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
  return file
}

describe('usePhotoUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('rejects a file over 5MB without calling the upload API', async () => {
    const { result } = renderPhotoUpload()

    act(() => {
      result.current.upload(oversizedFile())
    })

    expect(result.current.validationError).toMatch(/5mb or smaller/i)
    expect(result.current.previewUrl).toBeNull()
    expect(api.post).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
})

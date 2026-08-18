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

  it('rejects a file with an unsupported type without calling the upload API', async () => {
    const { result } = renderPhotoUpload()
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    act(() => {
      result.current.upload(file)
    })

    expect(result.current.validationError).toMatch(/jpeg, png, or webp/i)
    expect(result.current.previewUrl).toBeNull()
    expect(api.post).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows a local preview and requests a presigned post then uploads to S3, file field last', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/',
        fields: { key: 'photos/1/abc-123', policy: 'the-policy' },
      },
    })
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)
    const { result } = renderPhotoUpload()
    const file = new File(['hello'], 'photo.png', { type: 'image/png' })

    act(() => {
      result.current.upload(file)
    })

    expect(result.current.previewUrl).not.toBeNull()
    expect(result.current.validationError).toBeNull()

    await vi.waitFor(() => expect(api.post).toHaveBeenCalledWith('/profile/photo'))
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())

    const [url, requestInit] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://photo-bucket.s3.ap-southeast-2.amazonaws.com/')
    const body = requestInit?.body as FormData
    expect(body.get('key')).toBe('photos/1/abc-123')
    expect(body.get('policy')).toBe('the-policy')
    expect(body.get('Content-Type')).toBe('image/png')
    expect(body.get('file')).toBe(file)
    expect([...body.keys()].at(-1)).toBe('file')
  })
})

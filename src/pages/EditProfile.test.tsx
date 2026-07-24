import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditProfile } from './EditProfile'

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signoutRedirect: vi.fn(),
  }),
}))

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}))

import { api } from '@/lib/api'

function renderEditProfile() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/profile/edit']}>
        <Routes>
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<div>profile detail page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Edit profile page', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      data: { sub: '1', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL', email: 'ada@example.com' },
    })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('prefills the form with the current profile, and disables the email field', async () => {
    renderEditProfile()

    expect(await screen.findByLabelText(/first name/i)).toHaveValue('Ada')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Lovelace')
    const emailField = screen.getByLabelText(/email/i)
    expect(emailField).toHaveValue('ada@example.com')
    expect(emailField).toBeDisabled()
  })

  it('shows a validation error and does not submit when first name is cleared', async () => {
    const user = userEvent.setup()
    renderEditProfile()

    await user.clear(await screen.findByLabelText(/first name/i))
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i)
    expect(api.put).not.toHaveBeenCalled()
  })

  it('saves trimmed changes and navigates to the profile detail page on success', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: { sub: '1', givenName: 'Grace', familyName: 'Hopper', initials: 'GH', email: 'ada@example.com' },
    })
    const user = userEvent.setup()
    renderEditProfile()

    const givenNameField = await screen.findByLabelText(/first name/i)
    await user.clear(givenNameField)
    await user.type(givenNameField, '  Grace  ')
    const familyNameField = screen.getByLabelText(/last name/i)
    await user.clear(familyNameField)
    await user.type(familyNameField, 'Hopper')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(api.put).toHaveBeenCalledWith('/profile', { givenName: 'Grace', familyName: 'Hopper' })
    expect(await screen.findByText('profile detail page')).toBeInTheDocument()
  })

  it('shows an inline error and keeps the entered values when saving fails', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()
    renderEditProfile()

    const givenNameField = await screen.findByLabelText(/first name/i)
    await user.clear(givenNameField)
    await user.type(givenNameField, 'Grace')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't save/i)
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Grace')
  })

  it('navigates to the profile detail page when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderEditProfile()

    await user.click(await screen.findByRole('button', { name: /cancel/i }))

    expect(await screen.findByText('profile detail page')).toBeInTheDocument()
  })

  describe('photo upload', () => {
    function oversizedFile() {
      const file = new File(['x'.repeat(10)], 'huge.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
      return file
    }

    it('rejects a file over 5MB without calling the upload API', async () => {
      const user = userEvent.setup()
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      await user.upload(input, oversizedFile())

      expect(await screen.findByText(/5mb or smaller/i)).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('rejects a file with an unsupported type without calling the upload API', async () => {
      // A mislabeled file (wrong extension/MIME) can still reach the change handler even
      // though the input's accept filter blocks it in a real file picker — use fireEvent to
      // exercise that defensive check directly, since userEvent.upload enforces accept itself.
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
      fireEvent.change(input, { target: { files: [file] } })

      expect(await screen.findByText(/jpeg, png, or webp/i)).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('requests a presigned post then uploads the file to S3 with the file field last', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: {
          url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/',
          fields: { key: 'photos/1/abc-123', policy: 'the-policy', 'x-amz-signature': 'the-signature' },
        },
      })
      vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)
      const user = userEvent.setup()
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      const file = new File(['hello'], 'photo.png', { type: 'image/png' })
      await user.upload(input, file)

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

    it('polls until the profile reflects the new photo, then stops', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.post).mockResolvedValue({
        data: { url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/', fields: { key: 'photos/1/abc' } },
      })
      vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)
      let getCallCount = 0
      vi.mocked(api.get).mockImplementation(() => {
        getCallCount += 1
        return Promise.resolve({
          data: {
            sub: '1',
            givenName: 'Ada',
            familyName: 'Lovelace',
            initials: 'AL',
            email: 'ada@example.com',
            photoUrl: getCallCount > 1 ? 'https://cdn.example.com/photos/1/abc' : undefined,
          },
        })
      })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync })
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      await user.upload(input, new File(['hello'], 'photo.png', { type: 'image/png' }))
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled())

      await vi.advanceTimersByTimeAsync(1500)
      await vi.waitFor(() => expect(getCallCount).toBe(2))
      expect(screen.queryByText(/couldn't upload/i)).not.toBeInTheDocument()

      await vi.advanceTimersByTimeAsync(5000)
      expect(getCallCount).toBe(2)

      vi.useRealTimers()
    })

    it('shows an error and reverts to initials if the photo never shows up within the poll budget', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.mocked(api.post).mockResolvedValue({
        data: { url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/', fields: { key: 'photos/1/abc' } },
      })
      vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)
      // api.get always returns the same profile: no photoUrl ever appears (upload was rejected server-side)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync })
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      await user.upload(input, new File(['hello'], 'photo.png', { type: 'image/png' }))
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled())

      await vi.advanceTimersByTimeAsync(12000)

      expect(await screen.findByText(/couldn't upload photo/i)).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('shows an error when the presigned-post request itself fails', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('network error'))
      const user = userEvent.setup()
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      await user.upload(input, new File(['hello'], 'photo.png', { type: 'image/png' }))

      expect(await screen.findByText(/couldn't upload photo/i)).toBeInTheDocument()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('shows an error when the S3 upload itself fails', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/', fields: { key: 'photos/1/abc' } },
      })
      vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response)
      const user = userEvent.setup()
      renderEditProfile()

      const input = await screen.findByLabelText(/change profile photo/i)
      await user.upload(input, new File(['hello'], 'photo.png', { type: 'image/png' }))

      expect(await screen.findByText(/couldn't upload photo/i)).toBeInTheDocument()
    })
  })
})

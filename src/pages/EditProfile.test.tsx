import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditProfile } from './EditProfile'

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
    it('shows a local preview in the avatar when a valid photo is selected', async () => {
      // The avatar library only renders the <img> once the browser reports the image as
      // loaded; jsdom never actually loads image resources, so stub window.Image to resolve
      // immediately, the same way it would once the object URL is decoded in a real browser.
      const OriginalImage = window.Image
      class ImmediatelyLoadingImage {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_value: string) {
          queueMicrotask(() => this.onload?.())
        }
      }
      // @ts-expect-error test stub swaps the loading behavior, not the full Image interface
      window.Image = ImmediatelyLoadingImage

      try {
        vi.mocked(api.post).mockResolvedValue({
          data: { url: 'https://photo-bucket.s3.ap-southeast-2.amazonaws.com/', fields: { key: 'photos/1/abc' } },
        })
        vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)
        const user = userEvent.setup()
        const { container } = renderEditProfile()

        const input = await screen.findByLabelText(/change profile photo/i)
        await user.upload(input, new File(['hello'], 'photo.png', { type: 'image/png' }))

        // alt="" makes the avatar image decorative (no accessible role), so query by
        // the shadcn avatar-image slot rather than role.
        await vi.waitFor(() => {
          expect(container.querySelector('img[data-slot="avatar-image"]')).toHaveAttribute(
            'src',
            expect.stringMatching(/^blob:/)
          )
        })
      } finally {
        window.Image = OriginalImage
      }
    })
  })
})

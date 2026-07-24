import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  api: { get: vi.fn(), put: vi.fn() },
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
})

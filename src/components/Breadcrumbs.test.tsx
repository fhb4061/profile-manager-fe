import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BreadcrumbTrailProvider } from './BreadcrumbTrailContext'
import { Breadcrumbs } from './Breadcrumbs'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

import { api } from '@/lib/api'

function TestNav() {
  return (
    <>
      <Link to="/">home</Link>
      <Link to="/camera">camera</Link>
      <Link to="/profiles">profiles</Link>
      <Link to="/profile/abc">profile abc</Link>
    </>
  )
}

function renderAt(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <BreadcrumbTrailProvider>
          <TestNav />
          <Breadcrumbs />
        </BreadcrumbTrailProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Breadcrumbs', () => {
  it('renders a link for every crumb except the last, which is plain text', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })
    const user = userEvent.setup()

    renderAt('/')
    await user.click(screen.getByRole('link', { name: 'camera' }))
    await user.click(screen.getByRole('link', { name: 'profiles' }))

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Camera' })).toHaveAttribute('href', '/camera')
    expect(screen.getByText('Profiles')).not.toHaveAttribute('href')
    expect(screen.getByText('Profiles')).toHaveAttribute('aria-current', 'page')
  })

  it("resolves a /profile/:id crumb to the profile's given name once profiles load", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ sub: 'abc', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL' }] },
    })
    const user = userEvent.setup()

    renderAt('/')
    await user.click(screen.getByRole('link', { name: 'profile abc' }))

    expect(await screen.findByText('Ada')).toHaveAttribute('aria-current', 'page')
  })

  it('shows a Profile placeholder for a /profile/:id crumb while profiles are loading', async () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    renderAt('/')
    await user.click(screen.getByRole('link', { name: 'profile abc' }))

    expect(screen.getByText('Profile')).toHaveAttribute('aria-current', 'page')
  })
})

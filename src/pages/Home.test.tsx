import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Home } from './Home'

describe('Home landing page', () => {
  it('shows a public welcome message, without checking auth', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/welcome to profile manager\. log in to view and manage your profile\./i)
    ).toBeInTheDocument()
  })

  it('links to /camera', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /camera/i })).toHaveAttribute('href', '/camera')
  })
})

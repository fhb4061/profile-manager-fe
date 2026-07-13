import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('Profile detail page', () => {
  it('shows the profile name, date of birth, email and created date at /profile/:id', () => {
    renderAt('/profile/1')

    expect(
      screen.getByRole('heading', { name: /ada lovelace/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Lovelace')).toBeInTheDocument()
    expect(screen.getByText('December 10, 1815')).toBeInTheDocument()
    expect(screen.getByText('ada.lovelace@example.com')).toBeInTheDocument()
    expect(screen.getByText('January 5, 2024')).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown profile id', () => {
    renderAt('/profile/does-not-exist')

    expect(
      screen.getByRole('heading', { name: /profile not found/i })
    ).toBeInTheDocument()
  })
})

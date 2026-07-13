import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
}

describe('Home profile list', () => {
  it('lists every profile by name', () => {
    renderHome()

    expect(screen.getByRole('link', { name: /ada lovelace/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alan turing/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /grace hopper/i })).toBeInTheDocument()
  })

  it('navigates to the profile detail page when a profile is clicked', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('link', { name: /alan turing/i }))

    expect(
      screen.getByRole('heading', { name: /alan turing/i })
    ).toBeInTheDocument()
    expect(screen.getByText('alan.turing@example.com')).toBeInTheDocument()
  })
})

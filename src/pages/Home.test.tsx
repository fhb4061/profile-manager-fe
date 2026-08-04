import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home } from './Home'

describe('Home landing page', () => {
  it('shows a public welcome message, without checking auth', () => {
    render(<Home />)

    expect(
      screen.getByText(/welcome to profile manager\. log in to view and manage your profile\./i)
    ).toBeInTheDocument()
  })
})

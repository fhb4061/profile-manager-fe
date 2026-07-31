import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

const mockUseTheme = vi.fn()

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme(),
}))

describe('ThemeToggle', () => {
  it('calls the toggle function from useTheme when the switch is interacted with', async () => {
    const toggle = vi.fn()
    mockUseTheme.mockReturnValue({ theme: 'light', toggle })
    const user = userEvent.setup()

    render(<ThemeToggle />)
    await user.click(screen.getByRole('switch', { name: /toggle dark mode/i }))

    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('shows the switch as checked when the theme is dark', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', toggle: vi.fn() })

    render(<ThemeToggle />)

    expect(screen.getByRole('switch', { name: /toggle dark mode/i })).toBeChecked()
  })
})

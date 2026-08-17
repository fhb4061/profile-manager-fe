import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RobotBuddy } from './RobotBuddy'

const mockUseRobotBrain = vi.fn()

vi.mock('@/hooks/useRobotBrain', () => ({
  useRobotBrain: () => mockUseRobotBrain(),
}))

function renderRobot() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <RobotBuddy />
    </QueryClientProvider>
  )
}

describe('RobotBuddy', () => {
  it('is hidden from assistive tech and inert to pointer events', () => {
    mockUseRobotBrain.mockReturnValue({ mode: 'idle', x: 50 })

    const { container } = renderRobot()

    const robot = container.querySelector('[aria-hidden="true"]')
    expect(robot).toBeInTheDocument()
    expect(robot).toHaveClass('pointer-events-none')
  })

  it.each(['idle', 'busy', 'success', 'error'] as const)(
    'reflects the %s brain mode on the root element',
    (mode) => {
      mockUseRobotBrain.mockReturnValue({ mode, x: 10 })

      const { container } = renderRobot()

      expect(container.querySelector(`[data-robot-mode="${mode}"]`)).toBeInTheDocument()
    }
  )
})

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRobotBrain } from './useRobotBrain'

describe('useRobotBrain', () => {
  it('starts idle at an x position derived from the injected random source', () => {
    const random = vi.fn().mockReturnValue(0.25)

    const { result } = renderHook(() => useRobotBrain({ isFetching: 0, isMutating: 0, random }))

    expect(result.current.mode).toBe('idle')
    expect(result.current.x).toBe(25)
  })
})

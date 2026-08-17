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

  it('is busy while a query is fetching', () => {
    const { result } = renderHook(() => useRobotBrain({ isFetching: 1, isMutating: 0 }))

    expect(result.current.mode).toBe('busy')
  })

  it('is busy while a mutation is in flight', () => {
    const { result } = renderHook(() => useRobotBrain({ isFetching: 0, isMutating: 1 }))

    expect(result.current.mode).toBe('busy')
  })
})

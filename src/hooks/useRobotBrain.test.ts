import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRobotBrain } from './useRobotBrain'
import { emitRobotEvent } from '@/lib/robotEvents'

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

  describe('idle wandering', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('wanders to a new x position after a random interval between 8s and 20s', () => {
      const random = vi
        .fn()
        .mockReturnValueOnce(0.1) // initial x = 10
        .mockReturnValueOnce(0.5) // interval fraction -> 8000 + 0.5 * 12000 = 14000ms
        .mockReturnValueOnce(0.9) // next x = 90
      const { result } = renderHook(() => useRobotBrain({ isFetching: 0, isMutating: 0, random }))

      expect(result.current.x).toBe(10)

      act(() => {
        vi.advanceTimersByTime(13999)
      })
      expect(result.current.x).toBe(10)

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current.x).toBe(90)
    })
  })

  describe('mutation events', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows success mode on a success event, reverting to idle after the event duration', () => {
      const { result } = renderHook(() =>
        useRobotBrain({ isFetching: 0, isMutating: 0, eventDurationMs: 1000 })
      )

      act(() => emitRobotEvent('success'))
      expect(result.current.mode).toBe('success')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.mode).toBe('idle')
    })

    it('shows error mode even while busy, overriding busy until the event elapses', () => {
      const { result } = renderHook(() =>
        useRobotBrain({ isFetching: 1, isMutating: 0, eventDurationMs: 1000 })
      )
      expect(result.current.mode).toBe('busy')

      act(() => emitRobotEvent('error'))
      expect(result.current.mode).toBe('error')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.mode).toBe('busy')
    })
  })
})

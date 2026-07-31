import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

function mockMatchMedia(matches: boolean) {
  let listener: ((event: { matches: boolean }) => void) | undefined
  const mql = {
    matches,
    addEventListener: vi.fn((_event: string, cb: (event: { matches: boolean }) => void) => {
      listener = cb
    }),
    removeEventListener: vi.fn(),
  }
  window.matchMedia = vi.fn().mockReturnValue(mql)

  return {
    triggerChange(newMatches: boolean) {
      mql.matches = newMatches
      listener?.({ matches: newMatches })
    },
  }
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('returns dark when system prefers dark and no stored preference exists', () => {
    mockMatchMedia(true)

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
  })

  it('returns the stored preference instead of the system preference when one exists', () => {
    mockMatchMedia(true)
    localStorage.setItem('theme', 'light')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
  })

  it('flips the theme, updates the dark class, and persists to localStorage when toggled', () => {
    mockMatchMedia(false)

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('tracks system preference changes until an explicit toggle happens, then stops', () => {
    const media = mockMatchMedia(false)

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => {
      media.triggerChange(true)
    })
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggle()
    })
    expect(result.current.theme).toBe('light')

    act(() => {
      media.triggerChange(true)
    })
    expect(result.current.theme).toBe('light')
  })
})

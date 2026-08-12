import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDraggable } from './useDraggable'

describe('useDraggable', () => {
  it('starts at the given initial position with dragging false', () => {
    const { result } = renderHook(() =>
      useDraggable({ size: { width: 320, height: 180 }, initialPosition: { x: 10, y: 16 } })
    )

    expect(result.current.position).toEqual({ x: 10, y: 16 })
    expect(result.current.isDragging).toBe(false)
  })

  it('moves position by the pointer movement delta while dragging', () => {
    window.innerWidth = 1000
    window.innerHeight = 1000
    const { result } = renderHook(() =>
      useDraggable({ size: { width: 320, height: 180 }, initialPosition: { x: 100, y: 100 } })
    )

    act(() => {
      result.current.onPointerDown({ clientX: 50, clientY: 50 })
    })
    expect(result.current.isDragging).toBe(true)

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 70, clientY: 65 }))
    })

    expect(result.current.position).toEqual({ x: 120, y: 115 })
  })
})

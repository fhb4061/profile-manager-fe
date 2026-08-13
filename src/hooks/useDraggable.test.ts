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

  it('clamps position so the box stays fully within the viewport', () => {
    window.innerWidth = 500
    window.innerHeight = 400
    const { result } = renderHook(() =>
      useDraggable({ size: { width: 320, height: 180 }, initialPosition: { x: 100, y: 100 } })
    )

    act(() => {
      result.current.onPointerDown({ clientX: 0, clientY: 0 })
    })
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 10000, clientY: 10000 }))
    })

    expect(result.current.position).toEqual({ x: 180, y: 220 })

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: -10000, clientY: -10000 }))
    })

    expect(result.current.position).toEqual({ x: 0, y: 0 })
  })

  it('clamps the top edge to minY instead of 0, while x still clamps at 0', () => {
    window.innerWidth = 500
    window.innerHeight = 400
    const { result } = renderHook(() =>
      useDraggable({
        size: { width: 320, height: 180 },
        initialPosition: { x: 100, y: 100 },
        minY: 57,
      })
    )

    act(() => {
      result.current.onPointerDown({ clientX: 0, clientY: 0 })
    })
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: -10000, clientY: -10000 }))
    })

    expect(result.current.position).toEqual({ x: 0, y: 57 })
  })

  it('stops dragging on pointerup and ignores further pointermoves', () => {
    window.innerWidth = 1000
    window.innerHeight = 1000
    const { result } = renderHook(() =>
      useDraggable({ size: { width: 320, height: 180 }, initialPosition: { x: 100, y: 100 } })
    )

    act(() => {
      result.current.onPointerDown({ clientX: 50, clientY: 50 })
    })
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'))
    })

    expect(result.current.isDragging).toBe(false)
    const positionAfterUp = result.current.position

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 500, clientY: 500 }))
    })

    expect(result.current.position).toEqual(positionAfterUp)
  })
})

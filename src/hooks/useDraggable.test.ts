import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDraggable } from './useDraggable'

describe('useDraggable', () => {
  it('starts at the given initial position with dragging false', () => {
    const { result } = renderHook(() =>
      useDraggable({ size: { width: 320, height: 180 }, initialPosition: { x: 10, y: 16 } })
    )

    expect(result.current.position).toEqual({ x: 10, y: 16 })
    expect(result.current.isDragging).toBe(false)
  })
})

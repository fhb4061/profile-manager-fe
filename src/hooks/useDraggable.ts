import { useCallback, useEffect, useRef, useState } from 'react'

interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

interface UseDraggableOptions {
  size: Size
  initialPosition: Position
  minY?: number
}

function clamp(value: number, min: number, max: number): number {
  const upperBound = Math.max(max, min)
  return Math.min(Math.max(value, min), upperBound)
}

export function useDraggable({ size, initialPosition, minY = 0 }: UseDraggableOptions) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const lastPointer = useRef<Position>({ x: 0, y: 0 })

  const onPointerDown = useCallback((event: { clientX: number; clientY: number }) => {
    lastPointer.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - lastPointer.current.x
      const deltaY = event.clientY - lastPointer.current.y
      lastPointer.current = { x: event.clientX, y: event.clientY }

      setPosition((prev) => ({
        x: clamp(prev.x + deltaX, 0, window.innerWidth - size.width),
        y: clamp(prev.y + deltaY, minY, window.innerHeight - size.height),
      }))
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, size.width, size.height, minY])

  return { position, isDragging, onPointerDown }
}

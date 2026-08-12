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
}

function clamp(value: number, max: number): number {
  const upperBound = Math.max(max, 0)
  return Math.min(Math.max(value, 0), upperBound)
}

export function useDraggable({ size, initialPosition }: UseDraggableOptions) {
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
        x: clamp(prev.x + deltaX, window.innerWidth - size.width),
        y: clamp(prev.y + deltaY, window.innerHeight - size.height),
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
  }, [isDragging, size.width, size.height])

  return { position, isDragging, onPointerDown }
}

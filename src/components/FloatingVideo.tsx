import type { RefObject } from 'react'
import { useDraggable } from '@/hooks/useDraggable'

const SIZE = { width: 320, height: 180 }
const TOP_OFFSET = 16

interface FloatingVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>
}

export function FloatingVideo({ videoRef }: FloatingVideoProps) {
  const initialPosition = {
    x: Math.max(window.innerWidth / 2 - SIZE.width / 2, 0),
    y: TOP_OFFSET,
  }
  const { position, isDragging, onPointerDown } = useDraggable({
    size: SIZE,
    initialPosition,
  })

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      playsInline
      onPointerDown={onPointerDown}
      className="rounded-md bg-black"
      style={{
        transform: 'scaleX(-1)',
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: SIZE.width,
        height: SIZE.height,
        zIndex: 100,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    />
  )
}

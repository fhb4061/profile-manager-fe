import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { FloatingVideo } from './FloatingVideo'
import { useDraggable } from '@/hooks/useDraggable'

const { useDraggable: realUseDraggable } =
  await vi.importActual<typeof import('@/hooks/useDraggable')>('@/hooks/useDraggable')

vi.mock('@/hooks/useDraggable', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useDraggable')>()
  return { ...actual, useDraggable: vi.fn(actual.useDraggable) }
})

describe('FloatingVideo', () => {
  afterEach(() => {
    vi.mocked(useDraggable).mockImplementation(realUseDraggable)
  })

  it('renders a mirrored, muted video element wired to the given ref', () => {
    const ref = createRef<HTMLVideoElement>()

    const { container } = render(<FloatingVideo videoRef={ref} />)
    const video = container.querySelector('video') as HTMLVideoElement

    expect(video).toBeInTheDocument()
    expect(video.muted).toBe(true)
    expect(video.autoplay).toBe(true)
    expect(video.style.transform).toBe('scaleX(-1)')
    expect(ref.current).toBe(video)
  })

  it('positions itself fixed, top-middle of the body below the header, with a grab cursor', () => {
    window.innerWidth = 1000
    const ref = createRef<HTMLVideoElement>()

    const { container } = render(<FloatingVideo videoRef={ref} />)
    const video = container.querySelector('video') as HTMLVideoElement

    expect(video.style.position).toBe('fixed')
    expect(video.style.left).toBe('340px')
    expect(video.style.top).toBe('73px')
    expect(video.style.width).toBe('320px')
    expect(video.style.height).toBe('180px')
    expect(video.style.cursor).toBe('grab')
  })

  it('stops dragging upward at the header bottom edge', () => {
    window.innerWidth = 1000
    window.innerHeight = 1000
    const ref = createRef<HTMLVideoElement>()

    const { container } = render(<FloatingVideo videoRef={ref} />)
    const video = container.querySelector('video') as HTMLVideoElement

    fireEvent.pointerDown(video, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(window, { clientX: 0, clientY: -10000 })

    expect(video.style.top).toBe('57px')
  })

  it('switches to a grabbing cursor while dragging', () => {
    vi.mocked(useDraggable).mockReturnValue({
      position: { x: 0, y: 0 },
      isDragging: true,
      onPointerDown: vi.fn(),
    })
    const ref = createRef<HTMLVideoElement>()

    const { container } = render(<FloatingVideo videoRef={ref} />)
    const video = container.querySelector('video') as HTMLVideoElement

    expect(video.style.cursor).toBe('grabbing')
  })
})

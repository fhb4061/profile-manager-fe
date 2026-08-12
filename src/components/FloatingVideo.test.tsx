import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { createRef } from 'react'
import { FloatingVideo } from './FloatingVideo'

describe('FloatingVideo', () => {
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

  it('positions itself fixed, top-middle of the viewport, with a grab cursor', () => {
    window.innerWidth = 1000
    const ref = createRef<HTMLVideoElement>()

    const { container } = render(<FloatingVideo videoRef={ref} />)
    const video = container.querySelector('video') as HTMLVideoElement

    expect(video.style.position).toBe('fixed')
    expect(video.style.left).toBe('340px')
    expect(video.style.top).toBe('16px')
    expect(video.style.width).toBe('320px')
    expect(video.style.height).toBe('180px')
    expect(video.style.cursor).toBe('grab')
  })
})

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
})

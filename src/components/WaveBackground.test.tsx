import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { WaveBackground } from './WaveBackground'

describe('WaveBackground', () => {
  it('renders a fixed, full-bleed, non-interactive layer behind content', () => {
    const { container } = render(<WaveBackground />)
    const wrapper = container.firstChild as HTMLElement

    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper.className).toContain('fixed')
    expect(wrapper.className).toContain('inset-0')
    expect(wrapper.className).toContain('-z-10')
    expect(wrapper.className).toContain('pointer-events-none')
  })

  it('renders 3 layered wave SVGs with distinct animation speeds', () => {
    const { container } = render(<WaveBackground />)
    const svgs = container.querySelectorAll('svg')

    expect(svgs).toHaveLength(3)
    expect(svgs[0]).toHaveClass('animate-wave-slow')
    expect(svgs[1]).toHaveClass('animate-wave-medium')
    expect(svgs[2]).toHaveClass('animate-wave-fast')
  })

  it('colors layers using existing theme tokens only', () => {
    const { container } = render(<WaveBackground />)
    const paths = container.querySelectorAll('path')

    for (const path of paths) {
      expect(path.getAttribute('fill')).toMatch(/^var\(--(primary|muted)\)$/)
    }
  })
})

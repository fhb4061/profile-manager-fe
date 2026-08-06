import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CameraFeed } from './CameraFeed'

vi.mock('@/lib/camera', () => ({
  getCameraStream: vi.fn(),
}))

import { getCameraStream } from '@/lib/camera'

function renderCameraFeed() {
  return render(
    <MemoryRouter initialEntries={['/camera']}>
      <CameraFeed />
    </MemoryRouter>
  )
}

describe('Camera feed page', () => {
  it('shows a skeleton placeholder while camera access is pending', () => {
    vi.mocked(getCameraStream).mockReturnValue(new Promise(() => {}))

    const { container } = renderCameraFeed()

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
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

  it('shows a mirrored, muted video playing the granted camera stream', async () => {
    const stopTrack = vi.fn()
    const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream
    vi.mocked(getCameraStream).mockResolvedValue(stream)

    const { container, unmount } = renderCameraFeed()

    const video = await vi.waitFor(() => {
      const element = container.querySelector('video')
      expect(element).toBeInTheDocument()
      return element as HTMLVideoElement
    })

    expect(video.muted).toBe(true)
    expect(video.autoplay).toBe(true)
    expect(video.style.transform).toBe('scaleX(-1)')
    expect(video.srcObject).toBe(stream)

    unmount()

    expect(stopTrack).toHaveBeenCalled()
  })

  it('shows an alert about re-enabling camera access when permission is denied', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError')
    vi.mocked(getCameraStream).mockRejectedValue(error)

    const { findByRole } = renderCameraFeed()

    expect(await findByRole('alert')).toHaveTextContent(
      /camera access.*denied.*site settings/i
    )
  })

  it('shows a distinct alert for other camera errors, like no hardware', async () => {
    const error = new DOMException('No camera found', 'NotFoundError')
    vi.mocked(getCameraStream).mockRejectedValue(error)

    const { findByRole } = renderCameraFeed()

    expect(await findByRole('alert')).toHaveTextContent(/no camera|hardware/i)
  })

  it('shows a Home button navigating to / when there is no prior page in history', async () => {
    vi.mocked(getCameraStream).mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/camera']}>
        <Routes>
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/camera" element={<CameraFeed />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /home/i }))

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('shows a Back button navigating back when there is a prior page in history', async () => {
    vi.mocked(getCameraStream).mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/profiles', '/camera']} initialIndex={1}>
        <Routes>
          <Route path="/profiles" element={<div>Profiles page</div>} />
          <Route path="/camera" element={<CameraFeed />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(await screen.findByText('Profiles page')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { getCameraStream } from './camera'

describe('getCameraStream', () => {
  it('requests a front-facing, video-only stream from getUserMedia', async () => {
    const mockStream = {} as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(mockStream)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })

    const stream = await getCameraStream()

    expect(getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'user' },
      audio: false,
    })
    expect(stream).toBe(mockStream)
  })
})

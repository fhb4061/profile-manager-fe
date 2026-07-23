import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const mockGetUser = vi.fn()

vi.mock('./auth', () => ({
  userManager: { getUser: () => mockGetUser() },
}))

const { api } = await import('./api')

function captureRequestConfig() {
  return new Promise<InternalAxiosRequestConfig>((resolve) => {
    api.defaults.adapter = (config: InternalAxiosRequestConfig) => {
      resolve(config)
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse)
    }
  })
}

describe('api request interceptor', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
  })

  it('attaches the access token as a Bearer header when a user is signed in', async () => {
    mockGetUser.mockResolvedValue({ access_token: 'abc123' })
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).toBe('Bearer abc123')
  })

  it('sends no Authorization header when there is no signed-in user', async () => {
    mockGetUser.mockResolvedValue(null)
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).toBeUndefined()
  })
})

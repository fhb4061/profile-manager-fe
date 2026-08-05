import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const mockGetUser = vi.fn()
const mockRemoveUser = vi.fn()
const mockSigninSilent = vi.fn()

vi.mock('./auth', () => ({
  userManager: {
    getUser: () => mockGetUser(),
    removeUser: () => mockRemoveUser(),
    signinSilent: () => mockSigninSilent(),
  },
}))

const mockClearQueryCache = vi.fn()

vi.mock('./queryClient', () => ({
  queryClient: { clear: () => mockClearQueryCache() },
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

/**
 * Adapter that fails every request with `status`, counting the attempts so a
 * retry (or a retry loop) is observable.
 */
function alwaysFailingAdapter(status: number) {
  const attempts = { count: 0 }
  api.defaults.adapter = (config: InternalAxiosRequestConfig) => {
    attempts.count += 1
    return Promise.reject(
      Object.assign(new Error(`Request failed with status code ${status}`), {
        isAxiosError: true,
        config,
        response: { status, data: {}, statusText: '', headers: {}, config } as AxiosResponse,
      }),
    )
  }
  return attempts
}

describe('api request interceptor', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
  })

  it('attaches the access token as a Bearer header when a user is signed in', async () => {
    mockGetUser.mockResolvedValue({ access_token: 'abc123', id_token: 'id-token' })
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).toBe('Bearer abc123')
  })

  it('never sends the id token, which is proof of authentication and carries PII', async () => {
    mockGetUser.mockResolvedValue({ access_token: 'access-token', id_token: 'id-token' })
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).not.toContain('id-token')
  })

  it('sends no Authorization header for a user that has an id token but no access token', async () => {
    mockGetUser.mockResolvedValue({ id_token: 'id-token' })
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('sends no Authorization header when there is no signed-in user', async () => {
    mockGetUser.mockResolvedValue(null)
    const captured = captureRequestConfig()

    await api.get('/whoami')

    const config = await captured
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('api 401 recovery', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockRemoveUser.mockReset()
    mockSigninSilent.mockReset()
    mockClearQueryCache.mockReset()
    mockGetUser.mockResolvedValue({ access_token: 'stale-token' })
    mockRemoveUser.mockResolvedValue(undefined)
  })

  it('recovers a 401 by silently renewing and retrying the request once', async () => {
    const attempts = { count: 0 }
    api.defaults.adapter = (config: InternalAxiosRequestConfig) => {
      attempts.count += 1
      if (attempts.count === 1) {
        return Promise.reject(
          Object.assign(new Error('401'), {
            isAxiosError: true,
            config,
            response: { status: 401, data: {}, statusText: '', headers: {}, config } as AxiosResponse,
          }),
        )
      }
      return Promise.resolve({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse)
    }
    mockSigninSilent.mockResolvedValue({ access_token: 'fresh-token' })

    const response = await api.get('/profiles')

    expect(response.status).toBe(200)
    expect(attempts.count).toBe(2)
    expect(mockRemoveUser).not.toHaveBeenCalled()
  })

  it('clears the stored user when silent renew fails, so the app falls back to signed-out', async () => {
    alwaysFailingAdapter(401)
    mockSigninSilent.mockRejectedValue(new Error('refresh token expired'))

    await expect(api.get('/profiles')).rejects.toThrow()

    expect(mockRemoveUser).toHaveBeenCalled()
  })

  it('clears the React Query cache when the session is unrecoverable', async () => {
    alwaysFailingAdapter(401)
    mockSigninSilent.mockRejectedValue(new Error('refresh token expired'))

    await expect(api.get('/profiles')).rejects.toThrow()

    expect(mockClearQueryCache).toHaveBeenCalled()
  })

  it('does not loop when the retried request 401s again', async () => {
    const attempts = alwaysFailingAdapter(401)
    mockSigninSilent.mockResolvedValue({ access_token: 'fresh-but-still-rejected' })

    await expect(api.get('/profiles')).rejects.toThrow()

    // one original attempt + exactly one retry, then give up
    expect(attempts.count).toBe(2)
    expect(mockSigninSilent).toHaveBeenCalledTimes(1)
    expect(mockRemoveUser).toHaveBeenCalled()
  })

  it('renews only once for concurrent 401s rather than once per request', async () => {
    alwaysFailingAdapter(401)
    mockSigninSilent.mockRejectedValue(new Error('refresh token expired'))

    await Promise.allSettled([api.get('/a'), api.get('/b'), api.get('/c')])

    expect(mockSigninSilent).toHaveBeenCalledTimes(1)
  })

  it('leaves non-401 failures alone', async () => {
    alwaysFailingAdapter(500)

    await expect(api.get('/profiles')).rejects.toThrow()

    expect(mockSigninSilent).not.toHaveBeenCalled()
    expect(mockRemoveUser).not.toHaveBeenCalled()
  })
})

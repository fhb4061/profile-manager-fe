import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { userManager } from './auth'
import { endSession } from './authRecovery'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Marks a request that has already been retried after a token renewal, so a
// second 401 gives up instead of renewing and retrying forever.
type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRenew?: boolean }

// The access token is the API credential. The id_token is audience-scoped to the
// app client and is proof of authentication, not authorization — sending it would
// also leak identity claims (email, name, ...) to the API on every request.
api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`
  }
  return config
})

// In-flight renewal shared by every request that 401s at the same time; without
// it, a page issuing N parallel requests would fire N silent renews.
let renewal: Promise<string | undefined> | null = null

function renewOnce(): Promise<string | undefined> {
  renewal ??= userManager
    .signinSilent()
    .then((user) => user?.access_token)
    .finally(() => {
      renewal = null
    })
  return renewal
}

// `endSession` clears the cache and calls removeUser, which fires oidc-client-ts's
// `userUnloaded` event; react-oidc-context turns that into `isAuthenticated: false`,
// so ProtectedLayout redirects to the landing page and the user can sign in again.
// Without it the app keeps rendering as authenticated while every request 401s —
// the "stuck on a broken page forever" case.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined

  if (error.response?.status !== 401 || !config) {
    return Promise.reject(error)
  }

  // Already retried with a fresh token and still refused: the session cannot be
  // salvaged (revoked, app client changed, or the API rejects us outright).
  if (config._retriedAfterRenew) {
    await endSession()
    return Promise.reject(error)
  }

  config._retriedAfterRenew = true

  let accessToken: string | undefined
  try {
    accessToken = await renewOnce()
  } catch {
    await endSession()
    return Promise.reject(error)
  }

  if (!accessToken) {
    await endSession()
    return Promise.reject(error)
  }

  return api.request(config)
})

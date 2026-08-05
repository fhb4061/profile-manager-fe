import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRemoveUser = vi.fn()
const silentRenewErrorHandlers: Array<() => void> = []
const userSignedOutHandlers: Array<() => void> = []

vi.mock('./auth', () => ({
  userManager: {
    removeUser: () => mockRemoveUser(),
    events: {
      addSilentRenewError: (cb: () => void) => silentRenewErrorHandlers.push(cb),
      addUserSignedOut: (cb: () => void) => userSignedOutHandlers.push(cb),
    },
  },
}))

const mockClearQueryCache = vi.fn()

vi.mock('./queryClient', () => ({
  queryClient: { clear: () => mockClearQueryCache() },
}))

const { registerAuthRecovery } = await import('./authRecovery')

describe('registerAuthRecovery', () => {
  beforeEach(() => {
    mockRemoveUser.mockReset()
    mockRemoveUser.mockResolvedValue(undefined)
    mockClearQueryCache.mockReset()
    silentRenewErrorHandlers.length = 0
    userSignedOutHandlers.length = 0
  })

  it('subscribes to silent renew failures and to sign-out', () => {
    registerAuthRecovery()

    expect(silentRenewErrorHandlers).toHaveLength(1)
    expect(userSignedOutHandlers).toHaveLength(1)
  })

  it('clears the session and cached data when silent renew fails', async () => {
    registerAuthRecovery()

    await silentRenewErrorHandlers[0]()

    expect(mockClearQueryCache).toHaveBeenCalled()
    expect(mockRemoveUser).toHaveBeenCalled()
  })

  it('clears cached profile data when the session is signed out elsewhere', async () => {
    registerAuthRecovery()

    await userSignedOutHandlers[0]()

    expect(mockClearQueryCache).toHaveBeenCalled()
    expect(mockRemoveUser).toHaveBeenCalled()
  })
})

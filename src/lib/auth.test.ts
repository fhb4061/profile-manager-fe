import { describe, it, expect } from 'vitest'
import { UserManager } from 'oidc-client-ts'
import { userManager } from './auth'

describe('userManager', () => {
  it('is a UserManager instance configured with the Cognito settings', () => {
    expect(userManager).toBeInstanceOf(UserManager)
    expect(userManager.settings.authority).toBe(import.meta.env.VITE_COGNITO_AUTHORITY)
    expect(userManager.settings.client_id).toBe(import.meta.env.VITE_COGNITO_CLIENT_ID)
  })
})

import { describe, it, expect } from 'vitest'
import { profileDetail, isProfileDetailPath } from './routes'

describe('profileDetail', () => {
  it('builds the profile detail path for a given sub', () => {
    expect(profileDetail('abc123')).toBe('/profile/abc123')
  })
})

describe('isProfileDetailPath', () => {
  it('returns true for a /profile/:id path', () => {
    expect(isProfileDetailPath('/profile/abc123')).toBe(true)
  })

  it('returns false for the static /profile/edit path', () => {
    expect(isProfileDetailPath('/profile/edit')).toBe(false)
  })

  it('returns false for unrelated paths', () => {
    expect(isProfileDetailPath('/')).toBe(false)
    expect(isProfileDetailPath('/camera')).toBe(false)
  })
})

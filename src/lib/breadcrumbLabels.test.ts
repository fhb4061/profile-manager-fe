import { describe, it, expect } from 'vitest'
import { getCrumbLabel } from './breadcrumbLabels'

describe('getCrumbLabel', () => {
  it('returns the static label for known routes', () => {
    expect(getCrumbLabel('/')).toBe('Home')
    expect(getCrumbLabel('/camera')).toBe('Camera')
    expect(getCrumbLabel('/profiles')).toBe('Profiles')
    expect(getCrumbLabel('/profile/edit')).toBe('Edit Profile')
  })

  it('returns the matching profile\'s given name for a /profile/:id route', () => {
    const profiles = [
      { sub: 'abc', givenName: 'Ada', familyName: 'Lovelace', initials: 'AL' },
    ]
    expect(getCrumbLabel('/profile/abc', profiles)).toBe('Ada')
  })
})

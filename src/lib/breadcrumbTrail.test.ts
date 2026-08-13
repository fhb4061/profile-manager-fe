import { describe, it, expect } from 'vitest'
import { updateTrail } from './breadcrumbTrail'

describe('updateTrail', () => {
  it('appends the new path to the trail when it is not already present', () => {
    expect(updateTrail(['/'], '/camera')).toEqual(['/', '/camera'])
  })

  it('truncates the trail back to the existing entry, inclusive, when the path is already in it', () => {
    expect(updateTrail(['/', '/camera', '/profiles'], '/camera')).toEqual(['/', '/camera'])
  })
})

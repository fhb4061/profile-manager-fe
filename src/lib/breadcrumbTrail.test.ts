import { describe, it, expect } from 'vitest'
import { updateTrail } from './breadcrumbTrail'

describe('updateTrail', () => {
  it('appends the new path to the trail when it is not already present', () => {
    expect(updateTrail(['/'], '/camera')).toEqual(['/', '/camera'])
  })
})

import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword } from './validation'

describe('isValidEmail', () => {
  it('returns true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('returns false for email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('returns false for email without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('returns false for email without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('returns true for password with 8 characters', () => {
    expect(isValidPassword('password')).toBe(true)
  })

  it('returns true for password longer than 8 characters', () => {
    expect(isValidPassword('longpassword123')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isValidPassword('')).toBe(false)
  })

  it('returns false for password shorter than 8 characters', () => {
    expect(isValidPassword('short')).toBe(false)
  })

  it('returns false for password with exactly 7 characters', () => {
    expect(isValidPassword('1234567')).toBe(false)
  })
})

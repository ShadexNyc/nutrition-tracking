import { describe, it, expect } from 'vitest'
import { getLocalDateString } from './date'

describe('date', () => {
  it('returns YYYY-MM-DD for given date', () => {
    const d = new Date(2025, 1, 6) // Feb 6, 2025
    expect(getLocalDateString(d)).toBe('2025-02-06')
  })

  it('pads month and day with zero', () => {
    const d = new Date(2025, 0, 5) // Jan 5
    expect(getLocalDateString(d)).toBe('2025-01-05')
  })

  it('uses today when no argument', () => {
    const result = getLocalDateString()
    expect(/^\d{4}-\d{2}-\d{2}$/.test(result)).toBe(true)
  })
})

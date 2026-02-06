import { describe, it, expect } from 'vitest'
import {
  isValidDate,
  sanitizeProductInput,
  sanitizeQuantityGrams,
  sanitizeMealType,
} from './validation'

describe('validation', () => {
  describe('isValidDate', () => {
    it('accepts valid YYYY-MM-DD date', () => {
      expect(isValidDate('2025-02-06')).toBe(true)
      expect(isValidDate('2024-01-01')).toBe(true)
    })

    it('rejects invalid format', () => {
      expect(isValidDate('06-02-2025')).toBe(false)
      expect(isValidDate('2025/02/06')).toBe(false)
      expect(isValidDate('')).toBe(false)
      expect(isValidDate('not-a-date')).toBe(false)
    })

    it('rejects invalid calendar date', () => {
      expect(isValidDate('2025-02-30')).toBe(false)
      expect(isValidDate('2025-13-01')).toBe(false)
    })
  })

  describe('sanitizeProductInput', () => {
    it('returns null for invalid input', () => {
      expect(sanitizeProductInput(null as unknown as never)).toBe(null)
      expect(
        sanitizeProductInput({
          name: '',
          calories_per_100g: 0,
          protein_per_100g: 0,
          carbs_per_100g: 0,
          fat_per_100g: 0,
        })
      ).toBe(null)
      expect(
        sanitizeProductInput({
          name: '   ',
          calories_per_100g: 0,
          protein_per_100g: 0,
          carbs_per_100g: 0,
          fat_per_100g: 0,
        })
      ).toBe(null)
    })

    it('trims and caps name, clamps numbers', () => {
      const result = sanitizeProductInput({
        name: '  Chicken  ',
        calories_per_100g: 165,
        protein_per_100g: 31,
        carbs_per_100g: 0,
        fat_per_100g: 3.6,
      })
      expect(result).not.toBe(null)
      expect(result!.name).toBe('Chicken')
      expect(result!.calories_per_100g).toBe(165)
      expect(result!.protein_per_100g).toBe(31)
    })

    it('clamps values over max to 0', () => {
      const result = sanitizeProductInput({
        name: 'X',
        calories_per_100g: 2000,
        protein_per_100g: 150,
        carbs_per_100g: 150,
        fat_per_100g: 150,
      })
      expect(result!.calories_per_100g).toBe(0)
      expect(result!.protein_per_100g).toBe(0)
    })
  })

  describe('sanitizeQuantityGrams', () => {
    it('accepts valid numbers', () => {
      expect(sanitizeQuantityGrams(100)).toBe(100)
      expect(sanitizeQuantityGrams(0.1)).toBe(0.1)
    })

    it('returns null for invalid', () => {
      expect(sanitizeQuantityGrams(0)).toBe(null)
      expect(sanitizeQuantityGrams(-1)).toBe(null)
      expect(sanitizeQuantityGrams(NaN)).toBe(null)
    })
  })

  describe('sanitizeMealType', () => {
    it('returns value for valid meal type', () => {
      expect(sanitizeMealType('breakfast')).toBe('breakfast')
      expect(sanitizeMealType('lunch')).toBe('lunch')
      expect(sanitizeMealType('dinner')).toBe('dinner')
    })

    it('returns breakfast for invalid', () => {
      expect(sanitizeMealType('snack')).toBe('breakfast')
      expect(sanitizeMealType(null)).toBe('breakfast')
    })
  })
})

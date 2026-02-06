import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nutritionService } from './nutritionService'

describe('nutritionService', () => {
  let store: Record<string, string> = {}

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
    })
  })

  describe('createEntry', () => {
    it('creates entry and returns it', async () => {
      const entry = await nutritionService.createEntry(
        {
          name: 'Chicken',
          calories_per_100g: 165,
          protein_per_100g: 31,
          carbs_per_100g: 0,
          fat_per_100g: 3.6,
        },
        200,
        '2025-02-06',
        'lunch'
      )
      expect(entry.id).toBeDefined()
      expect(entry.product_id).toBeDefined()
      expect(entry.quantity_grams).toBe(200)
      expect(entry.date).toBe('2025-02-06')
      expect(entry.meal_type).toBe('lunch')
      expect(entry.product?.name).toBe('Chicken')
    })

    it('throws for invalid product name', async () => {
      await expect(
        nutritionService.createEntry(
          { name: '', calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
          100
        )
      ).rejects.toThrow()
    })

    it('throws for invalid quantity', async () => {
      await expect(
        nutritionService.createEntry(
          { name: 'X', calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
          0
        )
      ).rejects.toThrow()
    })
  })

  describe('deleteEntry', () => {
    it('removes entry by id', async () => {
      const entry = await nutritionService.createEntry(
        { name: 'Test', calories_per_100g: 100, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
        100,
        '2025-02-06'
      )
      await nutritionService.deleteEntry(entry.id)
      const after = await nutritionService.getEntriesByDate('2025-02-06')
      expect(after.find((e) => e.id === entry.id)).toBeUndefined()
    })

    it('does nothing for empty entryId', async () => {
      await nutritionService.createEntry(
        { name: 'Keep', calories_per_100g: 100, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
        100,
        '2025-02-06'
      )
      await nutritionService.deleteEntry('')
      await nutritionService.deleteEntry('   ')
      const after = await nutritionService.getEntriesByDate('2025-02-06')
      expect(after.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getEntriesByDate', () => {
    it('returns entries for date', async () => {
      await nutritionService.createEntry(
        { name: 'A', calories_per_100g: 100, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
        100,
        '2025-02-06'
      )
      const entries = await nutritionService.getEntriesByDate('2025-02-06')
      expect(entries.some((e) => e.product?.name === 'A')).toBe(true)
    })
  })

  describe('calculateDailyNutrition', () => {
    it('returns daily totals', async () => {
      await nutritionService.createEntry(
        { name: 'Cal', calories_per_100g: 100, protein_per_100g: 10, carbs_per_100g: 0, fat_per_100g: 0 },
        100,
        '2025-02-07'
      )
      const daily = await nutritionService.calculateDailyNutrition('2025-02-07')
      expect(daily.totalCalories).toBe(100)
      expect(daily.protein.current).toBe(10)
      expect(daily.entries?.length).toBeGreaterThanOrEqual(1)
    })
  })
})

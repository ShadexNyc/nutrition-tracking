/**
 * Input validation for nutrition feature. Single place for limits and rules.
 */
import type { MealType } from '../types'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const MAX_NAME_LENGTH = 500
const MAX_GRAMS = 100_000
const MIN_GRAMS = 0.1
const MAX_PER_100G = 1000
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

export interface ProductInput {
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

export function isValidDate(date: string): boolean {
  if (!DATE_REGEX.test(date)) return false
  const d = new Date(date)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date
}

export function sanitizeProductInput(raw: ProductInput): ProductInput | null {
  if (typeof raw !== 'object' || raw === null) return null
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, MAX_NAME_LENGTH) : ''
  if (!name) return null
  const n = (v: unknown, max: number) => {
    const num = Number(v)
    return Number.isFinite(num) && num >= 0 && num <= max ? num : 0
  }
  return {
    name,
    calories_per_100g: n(raw.calories_per_100g, MAX_PER_100G),
    protein_per_100g: n(raw.protein_per_100g, 100),
    carbs_per_100g: n(raw.carbs_per_100g, 100),
    fat_per_100g: n(raw.fat_per_100g, 100),
  }
}

export function sanitizeQuantityGrams(value: unknown): number | null {
  const num = Number(value)
  if (!Number.isFinite(num) || num < MIN_GRAMS || num > MAX_GRAMS) return null
  return num
}

export function sanitizeMealType(value: unknown): MealType {
  return MEAL_TYPES.includes(value as MealType) ? (value as MealType) : 'breakfast'
}

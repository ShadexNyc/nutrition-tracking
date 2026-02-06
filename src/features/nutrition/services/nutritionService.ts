import type { NutritionEntry, Product, DailyNutrition, MealType } from '../types'
import {
  isValidDate,
  sanitizeProductInput,
  sanitizeQuantityGrams,
  sanitizeMealType,
} from './validation'
import { getLocalDateString } from '../utils/date'

const STORAGE_KEY = 'nutrition_entries'
const PRODUCTS_STORAGE_KEY = 'products'
const MAX_ENTRIES = 10_000
const MAX_PRODUCTS = 2_000

function safeParse<T>(key: string, fallback: T, maxLength: number): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const parsed = JSON.parse(stored) as T
    if (key === STORAGE_KEY && Array.isArray(parsed)) return parsed.slice(0, maxLength) as T
    if (key === PRODUCTS_STORAGE_KEY && Array.isArray(parsed)) return parsed.slice(0, maxLength) as T
    return parsed
  } catch {
    return fallback
  }
}

function getStoredEntries(): NutritionEntry[] {
  const entries = safeParse<NutritionEntry[]>(STORAGE_KEY, [], MAX_ENTRIES)
  return Array.isArray(entries) ? entries : []
}

function getStoredProducts(): Product[] {
  const products = safeParse<Product[]>(PRODUCTS_STORAGE_KEY, [], MAX_PRODUCTS)
  return Array.isArray(products) ? products : []
}

function saveEntries(entries: NutritionEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products.slice(-MAX_PRODUCTS)))
}

/** Public API: nutrition data service. */
export const nutritionService = {
  async createEntry(
    product: { name: string; calories_per_100g: number; protein_per_100g: number; carbs_per_100g: number; fat_per_100g: number },
    quantityGrams: number,
    date: string = getLocalDateString(),
    mealType: MealType = 'breakfast'
  ): Promise<NutritionEntry> {
    const sanitizedProduct = sanitizeProductInput(product)
    if (!sanitizedProduct) throw new Error('Некорректные данные продукта')
    const qty = sanitizeQuantityGrams(quantityGrams)
    if (qty === null) throw new Error('Некорректное количество грамм')
    const safeDate = isValidDate(date) ? date : getLocalDateString()
    const safeMealType = sanitizeMealType(mealType)

    const existingProducts = getStoredProducts()
    const existingEntries = getStoredEntries()

    const existingProduct = existingProducts.find(
      (p) =>
        p.name === sanitizedProduct.name &&
        p.calories_per_100g === sanitizedProduct.calories_per_100g &&
        p.protein_per_100g === sanitizedProduct.protein_per_100g &&
        p.carbs_per_100g === sanitizedProduct.carbs_per_100g &&
        p.fat_per_100g === sanitizedProduct.fat_per_100g
    )

    let productId: string
    if (existingProduct) {
      productId = existingProduct.id
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...sanitizedProduct,
        created_at: new Date().toISOString(),
      }
      existingProducts.push(newProduct)
      saveProducts(existingProducts)
      productId = newProduct.id
    }

    const newEntry: NutritionEntry = {
      id: crypto.randomUUID(),
      product_id: productId,
      quantity_grams: qty,
      date: safeDate,
      meal_type: safeMealType,
      created_at: new Date().toISOString(),
      product: existingProducts.find((p) => p.id === productId),
    }

    existingEntries.push(newEntry)
    saveEntries(existingEntries)

    return newEntry
  },

  async getEntriesByDate(date: string): Promise<NutritionEntry[]> {
    const safeDate = isValidDate(date) ? date : getLocalDateString()
    const entries = getStoredEntries()
    const products = getStoredProducts()

    return entries
      .filter((entry) => entry.date === safeDate)
      .map((entry) => ({
        ...entry,
        product: products.find((p) => p.id === entry.product_id),
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )
  },

  async deleteEntry(entryId: string): Promise<void> {
    if (typeof entryId !== 'string' || !entryId.trim()) return
    const entries = getStoredEntries().filter((e) => e.id !== entryId)
    saveEntries(entries)
  },

  async calculateDailyNutrition(date: string): Promise<DailyNutrition> {
    const entries = await this.getEntriesByDate(date)

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    for (const entry of entries) {
      if (entry.product) {
        const multiplier = entry.quantity_grams / 100
        totalCalories += entry.product.calories_per_100g * multiplier
        totalProtein += entry.product.protein_per_100g * multiplier
        totalCarbs += entry.product.carbs_per_100g * multiplier
        totalFat += entry.product.fat_per_100g * multiplier
      }
    }

    return {
      totalCalories: Math.round(totalCalories),
      protein: { current: Math.round(totalProtein), target: 143 },
      carbs: { current: Math.round(totalCarbs), target: 160 },
      fat: { current: Math.round(totalFat), target: 90 },
      entries,
    }
  },
}

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
    product: {
      name: string
      calories_per_100g: number
      protein_per_100g: number
      carbs_per_100g: number
      fat_per_100g: number
      barcode?: string
    },
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

    const barcode =
      typeof product.barcode === 'string' && product.barcode.trim()
        ? product.barcode.trim()
        : undefined

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
      if (barcode && existingProduct.barcode !== barcode) {
        const idx = existingProducts.indexOf(existingProduct)
        existingProducts[idx] = { ...existingProduct, barcode }
        saveProducts(existingProducts)
      }
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...sanitizedProduct,
        barcode,
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

  async getProducts(): Promise<Product[]> {
    return getStoredProducts()
  },

  searchProducts(query: string): Promise<Product[]> {
    const q = (typeof query === 'string' ? query : '').trim().toLowerCase()
    if (!q) return Promise.resolve(getStoredProducts())
    const products = getStoredProducts()
    return Promise.resolve(
      products.filter((p) => p.name.toLowerCase().includes(q))
    )
  },

  async getRecentlyAddedProducts(limit = 20): Promise<Product[]> {
    const entries = getStoredEntries()
    const products = getStoredProducts()
    const byNewest = [...entries].sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    )
    const seen = new Set<string>()
    const result: Product[] = []
    for (const entry of byNewest) {
      const product = products.find((p) => p.id === entry.product_id)
      if (product && !seen.has(product.id)) {
        seen.add(product.id)
        result.push(product)
        if (result.length >= limit) break
      }
    }
    return result
  },

  async findProductByBarcode(barcode: string): Promise<Product | null> {
    const code = (barcode || '').trim()
    if (!code) return null
    const products = getStoredProducts()
    return products.find((p) => p.barcode === code) ?? null
  },

  /** Save product with optional barcode (e.g. from Open Food Facts). Returns existing or new product id. */
  async saveProductWithBarcode(
    product: {
      name: string
      calories_per_100g: number
      protein_per_100g: number
      carbs_per_100g: number
      fat_per_100g: number
      barcode?: string
    }
  ): Promise<Product> {
    const sanitized = sanitizeProductInput(product)
    if (!sanitized) throw new Error('Некорректные данные продукта')
    const existingProducts = getStoredProducts()
    const withBarcode =
      typeof product.barcode === 'string' && product.barcode.trim()
        ? product.barcode.trim()
        : undefined
    const existing = existingProducts.find(
      (p) =>
        p.name === sanitized.name &&
        p.calories_per_100g === sanitized.calories_per_100g &&
        p.protein_per_100g === sanitized.protein_per_100g &&
        p.carbs_per_100g === sanitized.carbs_per_100g &&
        p.fat_per_100g === sanitized.fat_per_100g
    )
    if (existing) {
      if (withBarcode && existing.barcode !== withBarcode) {
        const updated = { ...existing, barcode: withBarcode }
        const idx = existingProducts.indexOf(existing)
        existingProducts[idx] = updated
        saveProducts(existingProducts)
        return updated
      }
      return existing
    }
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...sanitized,
      barcode: withBarcode,
      created_at: new Date().toISOString(),
    }
    existingProducts.push(newProduct)
    saveProducts(existingProducts)
    return newProduct
  },
}

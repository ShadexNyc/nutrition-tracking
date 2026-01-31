import { NutritionEntry, Product, DailyNutrition, MealType } from '../types'

// Локальное хранилище для данных (временное решение до подключения Supabase)
const STORAGE_KEY = 'nutrition_entries'
const PRODUCTS_STORAGE_KEY = 'products'

export const nutritionService = {
  async createEntry(
    product: Omit<Product, 'id' | 'created_at'>,
    quantityGrams: number,
    date: string = new Date().toISOString().split('T')[0],
    mealType: MealType = 'breakfast'
  ): Promise<NutritionEntry> {
    // Получаем существующие данные
    const existingProducts = this.getStoredProducts()
    const existingEntries = this.getStoredEntries()

    // Ищем или создаем продукт
    let productId: string
    const existingProduct = existingProducts.find(
      (p) =>
        p.name === product.name &&
        p.calories_per_100g === product.calories_per_100g &&
        p.protein_per_100g === product.protein_per_100g &&
        p.carbs_per_100g === product.carbs_per_100g &&
        p.fat_per_100g === product.fat_per_100g
    )

    if (existingProduct) {
      productId = existingProduct.id
    } else {
      // Создаем новый продукт
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...product,
        created_at: new Date().toISOString(),
      }
      existingProducts.push(newProduct)
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(existingProducts))
      productId = newProduct.id
    }

    // Создаем запись о питании
    const newEntry: NutritionEntry = {
      id: crypto.randomUUID(),
      product_id: productId,
      quantity_grams: quantityGrams,
      date,
      meal_type: mealType,
      created_at: new Date().toISOString(),
      product: existingProducts.find((p) => p.id === productId) || undefined,
    }

    existingEntries.push(newEntry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingEntries))

    return newEntry
  },

  async getEntriesByDate(date: string): Promise<NutritionEntry[]> {
    const entries = this.getStoredEntries()
    const products = this.getStoredProducts()

    return entries
      .filter((entry) => entry.date === date)
      .map((entry) => ({
        ...entry,
        product: products.find((p) => p.id === entry.product_id),
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
      )
  },

  async calculateDailyNutrition(date: string): Promise<DailyNutrition> {
    const entries = await this.getEntriesByDate(date)

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    entries.forEach((entry) => {
      if (entry.product) {
        const multiplier = entry.quantity_grams / 100
        totalCalories += entry.product.calories_per_100g * multiplier
        totalProtein += entry.product.protein_per_100g * multiplier
        totalCarbs += entry.product.carbs_per_100g * multiplier
        totalFat += entry.product.fat_per_100g * multiplier
      }
    })

    // Целевые значения (можно будет сделать настраиваемыми)
    return {
      totalCalories: Math.round(totalCalories),
      protein: {
        current: Math.round(totalProtein),
        target: 143,
      },
      carbs: {
        current: Math.round(totalCarbs),
        target: 160,
      },
      fat: {
        current: Math.round(totalFat),
        target: 90,
      },
      entries,
    }
  },

  // Вспомогательные методы для работы с localStorage
  getStoredEntries(): NutritionEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  getStoredProducts(): Product[] {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },
}

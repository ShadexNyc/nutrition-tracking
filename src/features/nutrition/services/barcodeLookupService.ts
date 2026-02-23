/**
 * Barcode lookup via Open Food Facts API.
 * Used when product is not found in local storage.
 */
import type { Product } from '../types'

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product'

interface OFFNutriments {
  'energy-kcal_100g'?: number
  energy_100g?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
}

interface OFFProduct {
  product_name?: string
  nutriments?: OFFNutriments
}

interface OFFResponse {
  status?: number
  product?: OFFProduct
}

function toNumber(value: unknown): number {
  if (value == null) return 0
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * Fetches product by barcode from Open Food Facts.
 * Returns our Product shape or null if not found / invalid.
 */
export async function fetchProductByBarcode(
  barcode: string
): Promise<Product | null> {
  const code = (barcode || '').trim()
  if (!code) return null

  try {
    const url = `${OFF_API_BASE}/${encodeURIComponent(code)}.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as OFFResponse
    if (data.status !== 1 || !data.product) return null

    const p = data.product
    const name =
      typeof p.product_name === 'string' && p.product_name.trim()
        ? p.product_name.trim()
        : 'Unknown product'
    const nut = p.nutriments ?? ({} as OFFNutriments)

    // Prefer energy-kcal_100g; fallback to energy_100g (often in kJ, convert if needed)
    let caloriesPer100 = toNumber(nut['energy-kcal_100g'])
    if (caloriesPer100 <= 0 && nut.energy_100g != null) {
      const e = Number(nut.energy_100g)
      if (e > 0 && e < 1000) caloriesPer100 = e
      else if (e >= 1000) caloriesPer100 = Math.round(e / 4.184)
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name,
      calories_per_100g: Math.round(caloriesPer100 * 10) / 10,
      protein_per_100g: Math.round(toNumber(nut.proteins_100g) * 10) / 10,
      carbs_per_100g:
        Math.round(toNumber(nut.carbohydrates_100g) * 10) / 10,
      fat_per_100g: Math.round(toNumber(nut.fat_100g) * 10) / 10,
      barcode: code,
      created_at: new Date().toISOString(),
    }

    return product
  } catch {
    return null
  }
}

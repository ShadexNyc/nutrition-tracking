export interface Product {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  created_at?: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface NutritionEntry {
  id: string
  product_id: string | null
  quantity_grams: number
  date: string
  meal_type?: MealType
  created_at?: string
  product?: Product
}

export interface DailyNutrition {
  totalCalories: number
  protein: {
    current: number
    target: number
  }
  carbs: {
    current: number
    target: number
  }
  fat: {
    current: number
    target: number
  }
  entries?: NutritionEntry[]
}

export interface MacronutrientData {
  label: string
  current: number
  target: number
  color: string
}

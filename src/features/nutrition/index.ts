/**
 * Nutrition feature — public API.
 * Other modules must import only from this file, not from internal paths.
 */
export { MainScreen } from './components/MainScreen'
export { ScanProductScreen } from './components/ScanProductScreen'
export { useNutritionStore } from './store/nutritionStore'
export type { NutritionEntry, Product, DailyNutrition, MealType } from './types'

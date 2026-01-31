import { DailyNutrition, MacronutrientData } from '../types'

export function getMacronutrientData(
  nutrition: DailyNutrition
): MacronutrientData[] {
  return [
    {
      label: 'Protein',
      current: nutrition.protein.current,
      target: nutrition.protein.target,
      color: '#FFD700', // Yellow
    },
    {
      label: 'Carbs',
      current: nutrition.carbs.current,
      target: nutrition.carbs.target,
      color: '#FFA500', // Orange
    },
    {
      label: 'Fat',
      current: nutrition.fat.current,
      target: nutrition.fat.target,
      color: '#8A2BE2', // Purple
    },
  ]
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

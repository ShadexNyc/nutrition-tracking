import type { NutritionEntry } from '../types'

export interface DailyMealsListProps {
  entries?: NutritionEntry[] | null
}

export function DailyMealsList({ entries }: DailyMealsListProps) {
  if (!entries?.length) {
    return (
      <div className="text-center py-8 text-gray-500" style={{ color: '#26222F' }}>
        Пока нет записей о питании
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm">
          {entry.product?.name ?? 'Продукт'} — {entry.quantity_grams} г
        </li>
      ))}
    </ul>
  )
}

import type { NutritionEntry, MealType } from '../types'

const MEAL_SECTIONS: { type: MealType; title: string; emptyText: string }[] = [
  { type: 'breakfast', title: 'Завтрак', emptyText: 'Тут будет ваш рацион завтрака' },
  { type: 'lunch', title: 'Обед', emptyText: 'Тут будет ваш рацион обеда' },
  { type: 'dinner', title: 'Ужин', emptyText: 'А тут ваш рацион ужина' },
]

function entryCalories(entry: NutritionEntry): number {
  if (!entry.product) return 0
  const mult = entry.quantity_grams / 100
  return Math.round(entry.product.calories_per_100g * mult)
}

function entryMacros(entry: NutritionEntry): { kcal: number; protein: number; carbs: number; fat: number } {
  if (!entry.product) return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  const mult = entry.quantity_grams / 100
  return {
    kcal: Math.round(entry.product.calories_per_100g * mult * 10) / 10,
    protein: Math.round(entry.product.protein_per_100g * mult * 10) / 10,
    carbs: Math.round(entry.product.carbs_per_100g * mult * 10) / 10,
    fat: Math.round(entry.product.fat_per_100g * mult * 10) / 10,
  }
}

export interface DailyMealsListProps {
  entries?: NutritionEntry[] | null
}

function SectionEntries({ entries }: { entries: NutritionEntry[] }) {
  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const macros = entryMacros(entry)
        return (
          <li key={entry.id}>
            <div className="text-base font-normal text-black" style={{ color: '#26222F' }}>
              {entry.product?.name ?? 'Продукт'}
            </div>
            <div
              className="text-sm mt-0.5 flex flex-wrap gap-x-1 gap-y-0"
              style={{ color: '#757575' }}
            >
              <span>{entry.quantity_grams}g</span>
              <span>·</span>
              <span>{macros.kcal} ккал</span>
              <span>·</span>
              <span>{macros.protein} бел</span>
              <span>·</span>
              <span>{macros.carbs} угл</span>
              <span>·</span>
              <span>{macros.fat} жир</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function DailyMealsList({ entries }: DailyMealsListProps) {
  const byMeal = (type: MealType) =>
    (entries ?? []).filter((e) => (e.meal_type ?? 'breakfast') === type)

  return (
    <div className="flex flex-col gap-6">
      {MEAL_SECTIONS.map(({ type, title, emptyText }) => {
        const sectionEntries = byMeal(type)
        const totalCal = sectionEntries.reduce((sum, e) => sum + entryCalories(e), 0)
        return (
          <section key={type}>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h2
                className="text-2xl font-bold"
                style={{ color: '#26222F' }}
              >
                {title}
              </h2>
              {sectionEntries.length > 0 && (
                <span
                  className="text-xs rounded-full px-2.5 py-1 shrink-0"
                  style={{ backgroundColor: '#F5F5F5', color: '#757575' }}
                >
                  {totalCal} калории
                </span>
              )}
            </div>
            {sectionEntries.length > 0 ? (
              <SectionEntries entries={sectionEntries} />
            ) : (
              <p
                className="text-sm"
                style={{ color: '#757575' }}
              >
                {emptyText}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}

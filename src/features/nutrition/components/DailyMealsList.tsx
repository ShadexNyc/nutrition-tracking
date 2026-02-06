import { useState, useCallback } from 'react'
import type { NutritionEntry, MealType } from '../types'
import { SwipeableMealItem } from './SwipeableMealItem'

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
  onDeleteEntry?: (entryId: string) => void
  /** Id только что добавленного entry — для анимации появления */
  newlyAddedEntryId?: string | null
}

function SectionEntries({
  entries,
  onDeleteEntry,
  newlyAddedEntryId,
}: {
  entries: NutritionEntry[]
  onDeleteEntry?: (entryId: string) => void
  newlyAddedEntryId?: string | null
}) {
  const [dragState, setDragState] = useState<{ id: string; x: number } | null>(null)

  const handleDragStart = useCallback((id: string) => {
    setDragState({ id, x: 0 })
  }, [])

  const handleDrag = useCallback((x: number) => {
    setDragState((s) => (s ? { ...s, x } : null))
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState(null)
  }, [])

  const dragIndex = dragState ? entries.findIndex((e) => e.id === dragState.id) : -1

  return (
    <ul className="space-y-0">
      {entries.map((entry, index) => {
        const isAdjacent =
          dragIndex >= 0 &&
          dragState != null &&
          dragState.id !== entry.id &&
          (index === dragIndex - 1 || index === dragIndex + 1)
        const neighborDragX = dragState != null && isAdjacent ? dragState.x : 0

        return (
          <li key={entry.id}>
            <SwipeableMealItem
              entry={entry}
              onDelete={(id) => onDeleteEntry?.(id)}
              entryMacros={entryMacros}
              onDragStart={() => handleDragStart(entry.id)}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              neighborDragX={neighborDragX}
              isNewlyAdded={entry.id === newlyAddedEntryId}
            />
          </li>
        )
      })}
    </ul>
  )
}

const EMPTY_STATE_LINES = [
  'Your diet will be displayed here',
  'in the morning, day, and evening',
]

export function DailyMealsList({ entries, onDeleteEntry, newlyAddedEntryId }: DailyMealsListProps) {
  const hasAnyEntries = Boolean(entries?.length)
  const byMeal = (type: MealType) =>
    (entries ?? []).filter((e) => (e.meal_type ?? 'breakfast') === type)

  if (!hasAnyEntries) {
    return (
      <div className="flex flex-1 flex-col min-h-0 items-center justify-center text-center px-4">
        <p className="text-base leading-relaxed">
          <span style={{ color: '#26222F' }}>{EMPTY_STATE_LINES[0]}</span>
          <br />
          <span style={{ color: '#757575' }}>{EMPTY_STATE_LINES[1]}</span>
        </p>
      </div>
    )
  }

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
              <div className="-mx-4 sm:-mx-6">
                <SectionEntries
                entries={sectionEntries}
                onDeleteEntry={onDeleteEntry}
                newlyAddedEntryId={newlyAddedEntryId}
              />
              </div>
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

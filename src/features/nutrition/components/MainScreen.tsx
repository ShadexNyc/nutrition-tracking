import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNutritionStore } from '../store/nutritionStore'
import { TotalCalories } from './TotalCalories'
import { MacronutrientCard } from './MacronutrientCard'
import { AddNutritionButton } from './AddNutritionButton'
import { WeekCalendar } from './WeekCalendar'
import { NutritionDrawer } from './NutritionDrawer'
import { DailyMealsList } from './DailyMealsList'
import { getMacronutrientData } from '../utils/calculations'
import { NativeButton } from '@/shared/components/NativeButton'

export function MainScreen() {
  const { dailyNutrition, isLoading, error, loadDailyNutrition } = useNutritionStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    loadDailyNutrition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddNutrition = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleRetry = useCallback(() => {
    loadDailyNutrition()
  }, [loadDailyNutrition])

  const nutrition = useMemo(
    () =>
      dailyNutrition || {
        totalCalories: 0,
        protein: { current: 0, target: 143 },
        carbs: { current: 0, target: 160 },
        fat: { current: 0, target: 70 },
      },
    [dailyNutrition]
  )

  const macronutrients = useMemo(() => getMacronutrientData(nutrition), [nutrition])

  if (isLoading && !dailyNutrition) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E6E0E9' }}>
        <div className="text-lg" style={{ color: '#26222F' }}>Загрузка...</div>
      </div>
    )
  }

  if (error && !dailyNutrition) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: '#E6E0E9' }}
      >
        <div className="text-lg text-red-500 mb-4 text-center">{error}</div>
        <NativeButton
          onClick={handleRetry}
          variant="cta"
          className="w-full h-[54px] flex items-center justify-center gap-1 rounded-[16px] text-white max-w-[280px]"
        >
          Попробовать снова
        </NativeButton>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col pt-0 pb-20 safe-area-bottom"
      style={{ backgroundColor: '#E6E0E9' }}
    >
      <div className="max-w-md mx-auto flex flex-1 flex-col min-h-0 w-full" style={{ gap: 4 }}>
        {/* Верхний остров */}
        <div
          className="rounded-t-none rounded-b-[24px] bg-white p-4 sm:p-6 pt-16 shrink-0"
        >
          <TotalCalories calories={nutrition.totalCalories} />
          <div className="grid grid-cols-3 gap-x-0 gap-y-4 mt-6 mb-6 mx-0 items-stretch h-fit">
            {macronutrients.map((macro) => (
              <MacronutrientCard key={macro.label} data={macro} />
            ))}
          </div>
          <WeekCalendar />
        </div>

        {/* Нижний остров */}
        <div
          className="rounded-t-[24px] bg-white flex flex-1 flex-col min-h-0 p-4 sm:p-6 gap-6 overflow-y-auto"
        >
          <div className="flex flex-1 flex-col min-h-0">
            <DailyMealsList entries={dailyNutrition?.entries} />
          </div>
          <AddNutritionButton onClick={handleAddNutrition} />
        </div>
      </div>

      <NutritionDrawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </div>
  )
}

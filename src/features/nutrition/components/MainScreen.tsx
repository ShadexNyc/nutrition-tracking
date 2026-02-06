import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNutritionStore } from '../store/nutritionStore'
import { nutritionService } from '../services/nutritionService'
import { getLocalDateString } from '../utils/date'
import { TotalCalories } from './TotalCalories'
import { MacronutrientCard } from './MacronutrientCard'
import { AddNutritionButton } from './AddNutritionButton'
import { WeekCalendar } from './WeekCalendar'
import { NutritionDrawer } from './NutritionDrawer'
import { DailyMealsList } from './DailyMealsList'
import { getMacronutrientData } from '../utils/calculations'
import { NativeButton } from '@/shared/components/NativeButton'
import { PersonIcon } from '@/shared/components/icons/PersonIcon'

/** iOS: без safe area для нижней кнопки; Android: с safe area над системными кнопками */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function MainScreen() {
  const { dailyNutrition, isLoading, error, loadDailyNutrition, refreshNutrition } = useNutritionStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [newlyAddedEntryId, setNewlyAddedEntryId] = useState<string | null>(null)
  const clearNewlyAddedRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ios = useMemo(() => isIOS(), [])

  useEffect(() => {
    loadDailyNutrition(getLocalDateString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddNutrition = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const handleDrawerClose = useCallback((addedEntryId?: string) => {
    if (clearNewlyAddedRef.current) {
      clearTimeout(clearNewlyAddedRef.current)
      clearNewlyAddedRef.current = null
    }
    if (addedEntryId) {
      setNewlyAddedEntryId(addedEntryId)
      clearNewlyAddedRef.current = setTimeout(() => {
        setNewlyAddedEntryId(null)
        clearNewlyAddedRef.current = null
      }, 1400)
    }
    setIsDrawerOpen(false)
  }, [])

  const handleRetry = useCallback(() => {
    loadDailyNutrition()
  }, [loadDailyNutrition])

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      await nutritionService.deleteEntry(entryId)
      await refreshNutrition()
    },
    [refreshNutrition]
  )

  const nutrition = useMemo(
    () =>
      dailyNutrition || {
        totalCalories: 0,
        protein: { current: 0, target: 143 },
        carbs: { current: 0, target: 160 },
        fat: { current: 0, target: 90 },
      },
    [dailyNutrition]
  )

  const macronutrients = useMemo(() => getMacronutrientData(nutrition), [nutrition])

  if (isLoading && !dailyNutrition) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-white">
        <div className="text-lg" style={{ color: '#26222F' }}>Загрузка...</div>
      </div>
    )
  }

  if (error && !dailyNutrition) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center px-6 bg-white">
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
    <div className="min-h-[100svh] flex flex-col pt-0 bg-white w-full min-w-0 overflow-x-hidden">
      <div
        className="max-w-md mx-auto flex flex-1 flex-col min-h-0 w-full rounded-[24px] overflow-hidden gap-1"
        style={{ backgroundColor: '#E6E0E9' }}
      >
        {/* Верхняя секция */}
        <div className="rounded-t-none rounded-b-[24px] bg-white p-4 sm:p-6 pt-16 shrink-0">
          <div className="relative">
            <TotalCalories calories={nutrition.totalCalories} />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: '#f4f1f4' }}
              aria-hidden
            >
              <PersonIcon className="w-[44px] h-[30px] pt-0 -mb-[7px]" style={{ color: '#26222F' }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-0 gap-y-4 mt-6 mb-6 mx-0 items-stretch h-fit">
            {macronutrients.map((macro) => (
              <MacronutrientCard key={macro.label} data={macro} />
            ))}
          </div>
          <WeekCalendar />
        </div>

        {/* Нижняя секция: overscroll-behavior-contain чтобы при овердраге кнопка не пропадала */}
        <div className="rounded-t-[24px] bg-white flex flex-1 flex-col min-h-0">
          <div className="flex flex-1 flex-col min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-[120px]">
            <DailyMealsList
              entries={dailyNutrition?.entries}
              onDeleteEntry={handleDeleteEntry}
              newlyAddedEntryId={newlyAddedEntryId}
            />
          </div>
        </div>
      </div>

      {/* Плавающая кнопка в Portal — на тачах не пропадает при скролле (fixed относительно viewport) */}
      {!isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed left-0 right-0 bottom-0 z-30 pt-4 px-4 sm:pt-6 sm:px-6 max-w-md mx-auto"
            style={{
              paddingBottom: ios ? '1.5rem' : 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div
              className="absolute inset-0 rounded-t-[24px] backdrop-blur-md -z-10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, white 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 100%)',
              }}
              aria-hidden
            />
            <AddNutritionButton onClick={handleAddNutrition} />
          </div>,
          document.body
        )}

      <NutritionDrawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </div>
  )
}

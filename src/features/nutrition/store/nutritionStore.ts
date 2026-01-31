import { create } from 'zustand'
import { toUserMessage } from '@/shared/utils/errorHandler'
import { DailyNutrition } from '../types'
import { nutritionService } from '../services/nutritionService'

interface NutritionState {
  dailyNutrition: DailyNutrition | null
  isLoading: boolean
  error: string | null
  selectedDate: string
  loadDailyNutrition: (date?: string) => Promise<void>
  refreshNutrition: () => Promise<void>
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyNutrition: null,
  isLoading: false,
  error: null,
  selectedDate: getTodayDate(),

  loadDailyNutrition: async (date?: string) => {
    const targetDate = date || getTodayDate()
    set({ isLoading: true, error: null, selectedDate: targetDate })

    try {
      const nutrition = await nutritionService.calculateDailyNutrition(targetDate)
      set({ dailyNutrition: nutrition, isLoading: false })
    } catch (error) {
      set({
        error: toUserMessage(error),
        isLoading: false,
      })
    }
  },

  refreshNutrition: async () => {
    const { selectedDate } = get()
    await get().loadDailyNutrition(selectedDate)
  },
}))

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeButton } from '@/shared/components/NativeButton'
import type { MealType } from '../types'

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
]

const nutritionFormSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  productName: z.string().min(1, 'Название продукта обязательно'),
  quantityGrams: z
    .number()
    .positive('Вес должен быть положительным числом')
    .min(0.1, 'Минимальный вес: 0.1г'),
  caloriesPer100g: z
    .number()
    .nonnegative('Калории не могут быть отрицательными')
    .max(1000, 'Слишком большое значение'),
  proteinPer100g: z
    .number()
    .nonnegative('Белки не могут быть отрицательными')
    .max(100, 'Слишком большое значение'),
  carbsPer100g: z
    .number()
    .nonnegative('Углеводы не могут быть отрицательными')
    .max(100, 'Слишком большое значение'),
  fatPer100g: z
    .number()
    .nonnegative('Жиры не могут быть отрицательными')
    .max(100, 'Слишком большое значение'),
})

export type NutritionFormData = z.infer<typeof nutritionFormSchema>

interface NutritionFormProps {
  onSubmit: (data: NutritionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function NutritionForm({ onSubmit, onCancel, isLoading }: NutritionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } =   useForm<NutritionFormData>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      mealType: 'breakfast',
      productName: '',
      quantityGrams: 100,
      caloriesPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Приём пищи
        </label>
        <select
          {...register('mealType')}
          className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {MEAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Название продукта
        </label>
        <input
          type="text"
          {...register('productName')}
          className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Например: Куриная грудка"
        />
        {errors.productName && (
          <p className="mt-1 text-sm text-red-500">{errors.productName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Вес (граммы)
        </label>
        <input
          type="number"
          step="0.1"
          {...register('quantityGrams', { valueAsNumber: true })}
          className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="100"
        />
        {errors.quantityGrams && (
          <p className="mt-1 text-sm text-red-500">{errors.quantityGrams.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Калории (на 100г)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('caloriesPer100g', { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {errors.caloriesPer100g && (
            <p className="mt-1 text-sm text-red-500">
              {errors.caloriesPer100g.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Белки (на 100г)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('proteinPer100g', { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {errors.proteinPer100g && (
            <p className="mt-1 text-sm text-red-500">
              {errors.proteinPer100g.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Углеводы (на 100г)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('carbsPer100g', { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {errors.carbsPer100g && (
            <p className="mt-1 text-sm text-red-500">{errors.carbsPer100g.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Жиры (на 100г)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('fatPer100g', { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {errors.fatPer100g && (
            <p className="mt-1 text-sm text-red-500">{errors.fatPer100g.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 pb-6">
        <NativeButton
          type="submit"
          variant="cta"
          className="w-full h-[54px] flex items-center justify-center gap-1 rounded-[16px] text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Добавить'}
        </NativeButton>

        <NativeButton
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="w-full h-[54px] flex items-center justify-center rounded-[16px]"
          disabled={isLoading}
        >
          Отмена
        </NativeButton>
      </div>
    </form>
  )
}

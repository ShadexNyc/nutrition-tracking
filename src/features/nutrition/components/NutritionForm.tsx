import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeButton } from '@/shared/components/NativeButton'
import type { MealType } from '../types'

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
]

/** Parses string or number; accepts dot or comma as decimal separator. */
function parseDecimal(value: unknown): number {
  if (value === '' || value === undefined || value === null) return NaN
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const s = String(value).trim().replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : NaN
}

const nutritionFormSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  productName: z.string().min(1, 'Product name is required'),
  quantityGrams: z.preprocess(parseDecimal, z.number().positive('Weight must be positive').min(0.1, 'Minimum weight: 0.1g')),
  caloriesPer100g: z.preprocess(parseDecimal, z.number().nonnegative('Calories cannot be negative').max(1000, 'Value too large')),
  proteinPer100g: z.preprocess(parseDecimal, z.number().nonnegative('Protein cannot be negative').max(100, 'Value too large')),
  carbsPer100g: z.preprocess(parseDecimal, z.number().nonnegative('Carbs cannot be negative').max(100, 'Value too large')),
  fatPer100g: z.preprocess(parseDecimal, z.number().nonnegative('Fat cannot be negative').max(100, 'Value too large')),
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
    watch,
    setValue,
  } = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      mealType: 'breakfast',
      productName: '',
      quantityGrams: 100,
      caloriesPer100g: '' as unknown as number,
      proteinPer100g: '' as unknown as number,
      carbsPer100g: '' as unknown as number,
      fatPer100g: '' as unknown as number,
    },
  })

  const mealType = watch('mealType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <div
          className="flex rounded-[12px] p-[2px] gap-0 bg-gray-100"
          role="group"
          aria-label="Meal"
        >
          {MEAL_OPTIONS.map((opt) => {
            const isSelected = mealType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('mealType', opt.value)}
                className="flex-1 py-2 px-3 rounded-[10px] text-sm font-medium transition-colors border-0 cursor-pointer"
                style={{
                  backgroundColor: isSelected ? '#fff' : 'transparent',
                  color: isSelected ? '#26222F' : '#26222F',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.08)' : undefined,
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Product name
        </label>
        <input
          type="text"
          {...register('productName')}
          className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
          placeholder="e.g. Chicken breast"
        />
        {errors.productName && (
          <p className="mt-1 text-sm text-red-500">{errors.productName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Weight (grams)
        </label>
        <input
          type="text"
          inputMode="decimal"
          {...register('quantityGrams')}
          className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
          placeholder="100"
        />
        {errors.quantityGrams && (
          <p className="mt-1 text-sm text-red-500">{errors.quantityGrams.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Calories (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('caloriesPer100g')}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
            placeholder=""
          />
          {errors.caloriesPer100g && (
            <p className="mt-1 text-sm text-red-500">
              {errors.caloriesPer100g.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Protein (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('proteinPer100g')}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
            placeholder=""
          />
          {errors.proteinPer100g && (
            <p className="mt-1 text-sm text-red-500">
              {errors.proteinPer100g.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Carbs (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('carbsPer100g')}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
            placeholder=""
          />
          {errors.carbsPer100g && (
            <p className="mt-1 text-sm text-red-500">{errors.carbsPer100g.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Fat (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('fatPer100g')}
            className="w-full px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none"
            placeholder=""
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
          {isLoading ? 'Saving...' : 'Add'}
        </NativeButton>

        <NativeButton
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="w-full h-[54px] flex items-center justify-center rounded-[16px]"
          disabled={isLoading}
        >
          Cancel
        </NativeButton>
      </div>
    </form>
  )
}

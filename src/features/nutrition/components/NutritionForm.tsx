import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeButton } from '@/shared/components/NativeButton'
import { AddCircleIcon } from '@/shared/components/icons/AddCircleIcon'
import type { MealType, Product } from '../types'

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
  /** When set, form shows "Check the product data" block and fields are pre-filled for 100g. */
  initialProduct?: Product | null
}

export function NutritionForm({
  onSubmit,
  onCancel,
  isLoading,
  initialProduct,
}: NutritionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
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

  useEffect(() => {
    if (initialProduct) {
      reset({
        mealType: 'breakfast',
        productName: initialProduct.name,
        quantityGrams: 100,
        caloriesPer100g: initialProduct.calories_per_100g,
        proteinPer100g: initialProduct.protein_per_100g,
        carbsPer100g: initialProduct.carbs_per_100g,
        fatPer100g: initialProduct.fat_per_100g,
      })
    }
  }, [initialProduct, reset])

  const mealType = watch('mealType')
  const quantityGrams = watch('quantityGrams')
  const caloriesPer100g = watch('caloriesPer100g')
  const qNum =
    typeof quantityGrams === 'number'
      ? quantityGrams
      : parseDecimal(quantityGrams)
  const calNum =
    typeof caloriesPer100g === 'number'
      ? caloriesPer100g
      : parseDecimal(caloriesPer100g)
  const totalCaloriesPer100g = Number.isFinite(calNum) ? calNum : 0
  const totalForServing =
    Number.isFinite(qNum) && Number.isFinite(calNum)
      ? Math.round((qNum / 100) * calNum * 10) / 10
      : 0

  const showCheckBlock = Boolean(initialProduct)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
      {showCheckBlock && initialProduct && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-black mb-2">
            Check the product data
          </h3>
          <p className="font-medium text-black">{initialProduct.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            100g • {initialProduct.calories_per_100g} calories {initialProduct.protein_per_100g} protein{' '}
            {initialProduct.fat_per_100g} fat {initialProduct.carbs_per_100g} carbs
          </p>
        </div>
      )}

      <div className="mb-[6px]">
        <div
          className="flex rounded-[12px] p-[2px] gap-0 bg-[#F0EDF0]"
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
                className="flex-1 h-[44px] px-3 rounded-[10px] text-sm font-medium transition-colors border-0 cursor-pointer box-border"
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

      {!showCheckBlock && (
        <div className="mt-[6px]">
          <label className="block text-sm font-medium text-black mb-1">
            Product name
          </label>
          <input
            type="text"
            {...register('productName')}
            className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
            placeholder="e.g. Chicken breast"
          />
          <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
            {errors.productName?.message}
          </div>
        </div>
      )}

      {showCheckBlock && (
        <input type="hidden" {...register('productName')} />
      )}

      <div className="grid grid-cols-2 gap-[16px]">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {showCheckBlock ? 'Serving' : 'Weight (grams)'}
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('quantityGrams')}
            className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
            placeholder={showCheckBlock ? '100 g' : '100'}
          />
          <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
            {errors.quantityGrams?.message}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Carbs (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('carbsPer100g')}
            className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
            placeholder=""
          />
          <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
            {errors.carbsPer100g?.message}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Protein (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('proteinPer100g')}
            className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
            placeholder=""
          />
          <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
            {errors.proteinPer100g?.message}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Fat (per 100g)
          </label>
          <input
            type="text"
            inputMode="decimal"
            {...register('fatPer100g')}
            className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
            placeholder=""
          />
          <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
            {errors.fatPer100g?.message}
          </div>
        </div>

        {!showCheckBlock && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-black mb-1">
              Calories (per 100g)
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...register('caloriesPer100g')}
              className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
              placeholder=""
            />
            <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
              {errors.caloriesPer100g?.message}
            </div>
          </div>
        )}
      </div>

      {showCheckBlock && (
        <div className="grid grid-cols-2 gap-[16px]">
          <div />
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Calories (per 100g)
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...register('caloriesPer100g')}
              className="w-full h-[44px] px-4 py-2 bg-[#F0EDF0] rounded-[12px] focus:outline-none box-border"
              placeholder=""
            />
            <div className="mt-1 min-h-[0.2rem] text-sm text-red-500">
              {errors.caloriesPer100g?.message}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 pb-1">
        <p className="text-sm font-medium text-gray-600">
          Total calories per 100g
        </p>
        <p className="text-xl font-semibold text-black mt-0.5">
          {totalCaloriesPer100g > 0 ? `${totalCaloriesPer100g} calories` : '—'}
        </p>
        {totalForServing > 0 && qNum !== 100 && (
          <p className="text-sm text-gray-600 mt-1">
            Total for serving: {totalForServing} calories
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4 pb-6">
        <NativeButton
          type="submit"
          variant="cta"
          className="w-full h-[54px] flex items-center justify-center gap-1 rounded-[16px] text-white"
          disabled={isLoading}
        >
          {!isLoading && <AddCircleIcon className="w-5 h-5 shrink-0" variant="outline" />}
          <span className="w-fit h-fit font-normal">
            {isLoading
              ? 'Saving...'
              : `Add to ${MEAL_OPTIONS.find((o) => o.value === mealType)?.label ?? mealType}`}
          </span>
        </NativeButton>

        <NativeButton
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="w-full h-[54px] flex items-center justify-center rounded-[16px]"
          disabled={isLoading}
        >
          <span className="w-fit h-fit font-normal">Cancel</span>
        </NativeButton>
      </div>
    </form>
  )
}

import { memo } from 'react'
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber'

interface TotalCaloriesProps {
  calories: number
}

export const TotalCalories = memo(function TotalCalories({
  calories,
}: TotalCaloriesProps) {
  const animatedCalories = useAnimatedNumber(calories, { delay: 15, duration: 150 })

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div
        className="font-extrabold mb-0 h-[54px]"
        style={{ fontSize: 44, color: '#26222F' }}
      >
        {Math.round(animatedCalories)}
      </div>
      <div
        className="font-normal"
        style={{ fontSize: 14, color: '#757575' }}
      >
        total calories
      </div>
    </div>
  )
})

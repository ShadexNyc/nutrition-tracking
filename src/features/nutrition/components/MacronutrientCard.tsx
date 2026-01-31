import { memo } from 'react'
import { MacronutrientData } from '../types'
import { calculateProgress } from '../utils/calculations'
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber'

interface MacronutrientCardProps {
  data: MacronutrientData
}

export const MacronutrientCard = memo(function MacronutrientCard({
  data,
}: MacronutrientCardProps) {
  const animatedCurrent = useAnimatedNumber(data.current)
  const progress = calculateProgress(animatedCurrent, data.target)
  const progressPercentage = Math.min(progress, 100)

  return (
    <div className="flex flex-col items-center w-full min-w-0 flex-1 h-fit gap-0 justify-start mx-0 px-6">
      <div
        className="font-semibold mb-0.5 h-5 flex items-center justify-center text-center gap-[1px]"
        style={{ fontSize: 14, color: '#26222F' }}
      >
        {data.label}
      </div>
      <div
        className="font-normal -mt-[2px] pb-2 h-6 flex items-center justify-center tabular-nums"
        style={{ fontSize: 14, color: '#757575' }}
      >
        {Math.round(animatedCurrent)}/{data.target}g
      </div>
      <div className="w-[64px] h-1.5 bg-[rgba(230,224,233,1)] rounded-full overflow-hidden mt-1 flex-shrink-0">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: data.color,
            transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
          }}
        />
      </div>
    </div>
  )
})

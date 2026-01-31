import { NativeButton } from '@/shared/components/NativeButton'
import { AddCircleIcon } from '@/shared/components/icons/AddCircleIcon'

interface AddNutritionButtonProps {
  onClick: () => void
}

export function AddNutritionButton({ onClick }: AddNutritionButtonProps) {
  return (
    <NativeButton
      onClick={onClick}
      variant="cta"
      className="w-full h-[54px] flex items-center justify-center gap-1 rounded-[16px] text-white"
    >
      <AddCircleIcon className="w-5 h-5 shrink-0" variant="outline" />
      <span className="w-fit h-fit font-normal">Add nutrition</span>
    </NativeButton>
  )
}

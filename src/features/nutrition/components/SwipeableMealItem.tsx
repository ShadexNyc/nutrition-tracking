import { useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'motion/react'
import { TrashIcon } from '@/shared/components/icons/TrashIcon'
import type { NutritionEntry } from '../types'

const ACTION_WIDTH = 80
const DELETE_THRESHOLD = 0.4 // 40% — отпустить палец для удаления
const RED_BG_THRESHOLD = 0.9 // 90% — полный красный фон
const FADE_START = 0.8 // 80% — начало фейда
const THRESHOLD_PX = ACTION_WIDTH * DELETE_THRESHOLD
const RED_BG_PX = ACTION_WIDTH * RED_BG_THRESHOLD
const FADE_START_PX = ACTION_WIDTH * FADE_START
const GRAY_FROM_PX = 1 // 1px — сразу E6E0E9 при начале движения

const BG_COLOR_IDLE = '#ffffff' // когда не тянем
const BG_COLOR_NORMAL = '#E6E0E9'
const BG_COLOR_DELETE = '#ED7A7A'

/** Коэффициент «отрыва»: насколько соседние items тянутся за текущим (0.08 = 8%) */
const NEIGHBOR_DRAG_FACTOR = 0.08

const FLASH_TEXT_COLOR = '#D3C1FF'
const TEXT_COLOR_TITLE = '#26222F'
const TEXT_COLOR_MACROS = '#757575'

interface SwipeableMealItemProps {
  entry: NutritionEntry
  onDelete: (entryId: string) => void
  entryMacros: (e: NutritionEntry) => { kcal: number; protein: number; carbs: number; fat: number }
  onDragStart?: () => void
  onDrag?: (x: number) => void
  onDragEnd?: () => void
  /** Смещение от тяги соседнего item (для анимации отрыва) */
  neighborDragX?: number
  /** Только что добавленный элемент — мигание цвета шрифта после закрытия шторки */
  isNewlyAdded?: boolean
}

export function SwipeableMealItem({
  entry,
  onDelete,
  entryMacros,
  onDragStart,
  onDrag,
  onDragEnd,
  neighborDragX = 0,
  isNewlyAdded = false,
}: SwipeableMealItemProps) {
  const x = useMotionValue(0)

  useMotionValueEvent(x, 'change', (latest) => {
    onDrag?.(latest)
  })
  // 0% — белый, с 1px свайпа — сразу E6E0E9, 80–90% — фейд в красный
  const backgroundColor = useTransform(
    x,
    [0, -GRAY_FROM_PX, -FADE_START_PX, -RED_BG_PX],
    [BG_COLOR_IDLE, BG_COLOR_NORMAL, BG_COLOR_NORMAL, BG_COLOR_DELETE]
  )
  const iconColor = useTransform(
    x,
    [0, -GRAY_FROM_PX, -FADE_START_PX, -RED_BG_PX],
    ['#26222F', '#26222F', '#26222F', '#ffffff']
  )

  const handleDragEnd = useCallback(
    (_e: PointerEvent | TouchEvent | MouseEvent, info: { offset: { x: number } }) => {
      const offsetX = info.offset.x
      if (offsetX < -THRESHOLD_PX) {
        animate(x, -400, {
          type: 'spring',
          stiffness: 400,
          damping: 35,
        }).then(() => onDelete(entry.id))
      } else {
        animate(x, 0, {
          type: 'spring',
          stiffness: 500,
          damping: 40,
        })
      }
      onDragEnd?.()
    },
    [entry.id, onDelete, onDragEnd, x]
  )

  const macros = entryMacros(entry)
  const neighborX = neighborDragX * NEIGHBOR_DRAG_FACTOR

  return (
    <div style={{ transform: 'translateZ(0)' }}>
      <motion.div
        className="relative overflow-hidden"
        style={{ x: neighborX }}
        transition={
          neighborDragX === 0
            ? { duration: 0 }
            : { type: 'spring', stiffness: 500, damping: 45 }
        }
      >
      {/* Фон — без скруглений */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor }}
      />
      {/* Иконка корзины справа */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <motion.span style={{ color: iconColor }}>
          <TrashIcon className="w-6 h-6" color="currentColor" />
        </motion.span>
      </div>

      {/* Контент — свайпится влево, скругление справа 8px */}
      <motion.div
        className="relative bg-white rounded-r-[8px] pl-4 pr-4 sm:pl-6 sm:pr-6 py-3 z-10"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 40,
          mass: 0.5,
        }}
      >
        <motion.div
          className="text-base font-normal text-black"
          style={{
            color: isNewlyAdded ? undefined : TEXT_COLOR_TITLE,
          }}
          {...(isNewlyAdded && {
            initial: { color: TEXT_COLOR_TITLE },
            animate: {
              color: [TEXT_COLOR_TITLE, FLASH_TEXT_COLOR, TEXT_COLOR_TITLE],
            },
            transition: {
              duration: 1,
              times: [0, 0.25, 1],
              ease: 'easeInOut',
            },
          })}
        >
          {entry.product?.name ?? 'Продукт'}
        </motion.div>
        <motion.div
          className="text-sm mt-0.5 flex flex-wrap gap-x-1 gap-y-0"
          style={{
            color: isNewlyAdded ? undefined : TEXT_COLOR_MACROS,
          }}
          {...(isNewlyAdded && {
            initial: { color: TEXT_COLOR_MACROS },
            animate: {
              color: [TEXT_COLOR_MACROS, FLASH_TEXT_COLOR, TEXT_COLOR_MACROS],
            },
            transition: {
              duration: 1,
              times: [0, 0.25, 1],
              ease: 'easeInOut',
            },
          })}
        >
          <span>{entry.quantity_grams}g</span>
          <span>·</span>
          <span>{macros.kcal} ккал</span>
          <span>·</span>
          <span>{macros.protein} бел</span>
          <span>·</span>
          <span>{macros.carbs} угл</span>
          <span>·</span>
          <span>{macros.fat} жир</span>
        </motion.div>
      </motion.div>
    </motion.div>
    </div>
  )
}

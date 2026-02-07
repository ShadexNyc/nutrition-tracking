import { useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'motion/react'
import { TrashIcon } from '@/shared/components/icons/TrashIcon'
import type { NutritionEntry } from '../types'

const ACTION_WIDTH = 80
const DELETE_THRESHOLD = 0.65 // 65% — осознанный свайп для удаления (не от лёгкого прикосновения)
const RED_BG_THRESHOLD = 0.9 // 90% — полный красный фон
/** Порог в px: движение в одну сторону должно быть больше, чтобы считать жест «свайпом» или «скроллом» */
const DIRECTION_THRESHOLD_PX = 14
/** Горизонталь побеждает, если horizontal >= ratio * vertical */
const HORIZONTAL_VS_VERTICAL_RATIO = 1.5
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

/** Эластичность как в iOS: тяга за пределы границы с сопротивлением */
const ELASTIC_OVERSCROLL_MAX = 50
const ELASTIC_RESISTANCE = 0.35

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
  /** Первый item в категории — верхний отступ 7px (под заголовком 7px) */
  isFirstInSection?: boolean
}

type GestureLock = null | 'horizontal' | 'vertical'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Сопротивление «резинки»: за границей -ACTION_WIDTH движение замедляется (как в iOS) */
function elasticX(offsetX: number): number {
  if (offsetX >= 0) return 0
  if (offsetX > -ACTION_WIDTH) return offsetX
  const overscroll = offsetX + ACTION_WIDTH
  const elastic = -ACTION_WIDTH + overscroll * ELASTIC_RESISTANCE
  return Math.max(-ACTION_WIDTH - ELASTIC_OVERSCROLL_MAX, elastic)
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
  isFirstInSection = false,
}: SwipeableMealItemProps) {
  const x = useMotionValue(0)
  const gestureLockRef = useRef<GestureLock>(null)
  const isPointerDownRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const lockStartXRef = useRef(0)

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

  const finishSwipeGesture = useCallback(() => {
    const positionAtRelease = x.get()
    if (positionAtRelease < -THRESHOLD_PX) {
      animate(x, -400, {
        type: 'spring',
        stiffness: 800,
        damping: 45,
      }).then(() => onDelete(entry.id))
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 40,
      })
    }
    onDragEnd?.()
  }, [entry.id, onDelete, onDragEnd, x])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (gestureLockRef.current !== null) return
    gestureLockRef.current = null
    isPointerDownRef.current = true
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDownRef.current) return
      const lock = gestureLockRef.current
      const deltaX = e.clientX - startXRef.current
      const deltaY = e.clientY - startYRef.current

      if (lock === null) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)
        if (absX >= DIRECTION_THRESHOLD_PX && absX >= HORIZONTAL_VS_VERTICAL_RATIO * absY) {
          gestureLockRef.current = 'horizontal'
          lockStartXRef.current = e.clientX
          e.preventDefault()
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          onDragStart?.()
        } else if (absY >= DIRECTION_THRESHOLD_PX && absY >= HORIZONTAL_VS_VERTICAL_RATIO * absX) {
          gestureLockRef.current = 'vertical'
          ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
        }
      }

      if (gestureLockRef.current === 'horizontal') {
        e.preventDefault()
        const offsetX = e.clientX - lockStartXRef.current
        x.set(elasticX(offsetX))
      }
    },
    [onDragStart, x]
  )

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    gestureLockRef.current = null
    isPointerDownRef.current = false
  }, [])

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const lock = gestureLockRef.current
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      if (lock === 'horizontal') {
        finishSwipeGesture()
      }
      gestureLockRef.current = null
      isPointerDownRef.current = false
    },
    [finishSwipeGesture]
  )

  const macros = entryMacros(entry)
  const neighborX = neighborDragX * NEIGHBOR_DRAG_FACTOR

  return (
    <div className="relative" style={{ transform: 'translateZ(0)' }}>
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
      {/* Иконка корзины под карточкой: z-0, карточка z-10 — видна при смещении влево */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center pointer-events-none z-0"
        style={{ transform: 'translateZ(0)' }}
        aria-hidden
      >
        <motion.span style={{ color: iconColor }}>
          <TrashIcon className="w-6 h-6" color="currentColor" />
        </motion.span>
      </div>
      {/* Контент — свайпится влево, скругление справа 12px */}
      <motion.div
        className={`relative bg-white rounded-r-[12px] pl-4 pr-4 sm:pl-6 sm:pr-6 py-[5px] z-10 touch-pan-y ${isFirstInSection ? 'pt-[7px]' : ''}`}
        style={{ x }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
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

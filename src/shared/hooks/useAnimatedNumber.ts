import { useEffect, useState, useRef } from 'react'

interface UseAnimatedNumberOptions {
  duration?: number
  easing?: (t: number) => number
  delay?: number
}

/**
 * Хук для плавной анимации чисел от старого значения к новому
 * @param targetValue - целевое значение
 * @param options - опции анимации
 * @returns текущее анимированное значение
 */
export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) {
  const { duration = 300, easing = easeOutQuart, delay = 0 } = options
  const [displayValue, setDisplayValue] = useState(targetValue)
  const animationFrameRef = useRef<number | null>(null)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef<number | null>(null)
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Если значение не изменилось, ничего не делаем
    if (targetValue === startValueRef.current) {
      return
    }

    // Отменяем предыдущую анимацию, если она была
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current)
    }

    startValueRef.current = displayValue
    startTimeRef.current = null

    const startAnimation = () => {
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime
        }

        const elapsed = currentTime - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)

        const currentValue =
          startValueRef.current +
          (targetValue - startValueRef.current) * easedProgress

        setDisplayValue(currentValue)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Убеждаемся, что финальное значение точно равно целевому
          setDisplayValue(targetValue)
          startValueRef.current = targetValue
          animationFrameRef.current = null
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (delayTimeoutRef.current !== null) {
        clearTimeout(delayTimeoutRef.current)
        delayTimeoutRef.current = null
      }
    }
  }, [targetValue, duration, easing, delay, displayValue])

  return Math.round(displayValue * 10) / 10 // Округляем до 1 знака после запятой
}

// Easing функция для плавной анимации (ease-out quart - более плавная)
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

import { useEffect, useState, useRef } from 'react'
import { toUserMessage } from '@/shared/utils/errorHandler'
import { NutritionForm, NutritionFormData } from './NutritionForm'
import { nutritionService } from '../services/nutritionService'
import { useNutritionStore } from '../store/nutritionStore'

interface NutritionDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function NutritionDrawer({ isOpen, onClose }: NutritionDrawerProps) {
  const { refreshNutrition, selectedDate } = useNutritionStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Небольшая задержка для плавного появления
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Обработка свайпа вниз для закрытия с использованием addEventListener
  useEffect(() => {
    const drawer = drawerRef.current
    const header = headerRef.current
    if (!drawer || !header || !isOpen) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const target = e.target as HTMLElement
      
      // Разрешаем свайп только если начинаем с верхней части (индикатор или заголовок)
      const isTopArea = target.closest('.drawer-header') !== null
      if (!isTopArea) return

      startYRef.current = touch.clientY
      currentYRef.current = touch.clientY
      isDraggingRef.current = true
      e.preventDefault()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !drawer) return
      const touch = e.touches[0]
      currentYRef.current = touch.clientY
      const deltaY = currentYRef.current - startYRef.current

      // Разрешаем свайп только вниз
      if (deltaY > 0) {
        drawer.style.transform = `translateY(${deltaY}px)`
        drawer.style.transition = 'none'
        // Затемняем overlay при свайпе
        const overlay = document.querySelector('[data-drawer-overlay]') as HTMLElement
        if (overlay) {
          const opacity = Math.max(0, 0.5 - deltaY / 400)
          overlay.style.opacity = opacity.toString()
        }
        e.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      if (!isDraggingRef.current || !drawer) return
      const deltaY = currentYRef.current - startYRef.current
      const threshold = 100 // Порог для закрытия (в пикселях)

      if (deltaY > threshold) {
        onClose()
      } else {
        // Возвращаем на место с анимацией
        drawer.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        drawer.style.transform = 'translateY(0)'
        
        // Восстанавливаем overlay
        const overlay = document.querySelector('[data-drawer-overlay]') as HTMLElement
        if (overlay) {
          overlay.style.transition = 'opacity 0.3s'
          overlay.style.opacity = '0.5'
        }
      }

      isDraggingRef.current = false
      startYRef.current = 0
      currentYRef.current = 0
    }

    // Добавляем обработчики с { passive: false } для возможности preventDefault
    header.addEventListener('touchstart', handleTouchStart, { passive: false })
    drawer.addEventListener('touchmove', handleTouchMove, { passive: false })
    drawer.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      header.removeEventListener('touchstart', handleTouchStart)
      drawer.removeEventListener('touchmove', handleTouchMove)
      drawer.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (data: NutritionFormData) => {
    setIsSubmitting(true)
    try {
      await nutritionService.createEntry(
        {
          name: data.productName,
          calories_per_100g: data.caloriesPer100g,
          protein_per_100g: data.proteinPer100g,
          carbs_per_100g: data.carbsPer100g,
          fat_per_100g: data.fatPer100g,
        },
        data.quantityGrams,
        selectedDate,
        data.mealType
      )

      await refreshNutrition()
      onClose()
    } catch (error) {
      console.error('Error adding nutrition entry:', error)
      alert(toUserMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        data-drawer-overlay
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        style={{ willChange: 'opacity' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[90vh] overflow-y-auto safe-area-bottom drawer-native"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: isDraggingRef.current
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          willChange: 'transform',
        }}
      >
        {/* Индикатор для свайпа и заголовок - область для свайпа */}
        <div ref={headerRef} className="drawer-header">
          <div className="flex justify-center mb-4 pt-0 md:hidden">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black">Добавить питание</h2>
          </div>
        </div>

        <NutritionForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
        />
      </div>
    </>
  )
}

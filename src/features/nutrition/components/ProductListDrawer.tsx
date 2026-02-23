import { useEffect, useState, useRef, useCallback } from 'react'
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll'
import { nutritionService } from '../services/nutritionService'
import type { Product } from '../types'
import { NativeButton } from '@/shared/components/NativeButton'
import { BarcodeScanIcon } from '@/shared/components/icons/BarcodeScanIcon'

const SWIPE_TOP_ZONE_HEIGHT = 100

interface ProductListDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct: (product: Product) => void
  onScanProduct: () => void
}

export function ProductListDrawer({
  isOpen,
  onClose,
  onSelectProduct,
  onScanProduct,
}: ProductListDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const isDraggingRef = useRef(false)

  const showSearch = searchQuery.trim().length > 0
  const displayList = showSearch ? searchResults : recentProducts

  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    nutritionService.getRecentlyAddedProducts(20).then(setRecentProducts)
  }, [isOpen])

  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      return
    }
    const t = setTimeout(() => {
      nutritionService.searchProducts(q).then(setSearchResults)
    }, 150)
    return () => clearTimeout(t)
  }, [searchQuery])

  const handleSwipe = useCallback(() => {
    const drawer = drawerRef.current
    if (!drawer || !isOpen) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const rect = drawer.getBoundingClientRect()
      const isInTopZone =
        touch.clientY >= rect.top &&
        touch.clientY <= rect.top + SWIPE_TOP_ZONE_HEIGHT
      if (!isInTopZone) return
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
      if (deltaY > 0) {
        drawer.style.transform = `translateY(${deltaY}px)`
        drawer.style.transition = 'none'
        const overlay = document.querySelector(
          '[data-product-list-drawer-overlay]'
        ) as HTMLElement
        if (overlay) {
          overlay.style.opacity = String(Math.max(0, 1 - deltaY / 400))
        }
        e.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      if (!isDraggingRef.current || !drawer) return
      const deltaY = currentYRef.current - startYRef.current
      const threshold = 100
      if (deltaY > threshold) {
        onClose()
      } else {
        drawer.style.transition =
          'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        drawer.style.transform = 'translateY(0)'
        const overlay = document.querySelector(
          '[data-product-list-drawer-overlay]'
        ) as HTMLElement
        if (overlay) {
          overlay.style.transition = 'opacity 0.3s'
          overlay.style.opacity = '1'
        }
      }
      isDraggingRef.current = false
      startYRef.current = 0
      currentYRef.current = 0
    }

    drawer.addEventListener('touchstart', handleTouchStart, { passive: false })
    drawer.addEventListener('touchmove', handleTouchMove, { passive: false })
    drawer.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart)
      drawer.removeEventListener('touchmove', handleTouchMove)
      drawer.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, onClose])

  useEffect(handleSwipe, [handleSwipe])

  if (!isOpen) return null

  return (
    <>
      <div
        data-product-list-drawer-overlay
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 backdrop-blur-sm ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'opacity' }}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />

      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl overflow-hidden drawer-native flex flex-col max-h-[90vh]"
        style={{
          height: '90vh',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: isDraggingRef.current
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          willChange: 'transform',
        }}
      >
        <div className="drawer-header flex-shrink-0 p-4 pt-4 pb-0">
          <div className="flex justify-center mb-4 md:hidden">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-4">
            Let&apos;s find a product
          </h2>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products"
            className="w-full h-12 px-4 py-2 bg-[#F0EDF0] rounded-[12px] text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#26222F]"
            aria-label="Search for products"
          />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 min-h-0">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {showSearch ? 'Search results' : 'Recent added'}
          </p>
          {displayList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              {showSearch
                ? 'No products match your search.'
                : 'No recently added products.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {displayList.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(p)}
                    className="w-full text-left py-3 px-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <p className="font-medium text-black truncate">{p.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      100g • {p.calories_per_100g} calories
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-shrink-0 p-4 pt-2 pb-6 safe-area-bottom">
          <NativeButton
            type="button"
            onClick={onScanProduct}
            variant="cta"
            className="w-full h-[54px] flex items-center justify-center gap-2 rounded-[16px] text-white"
          >
            <BarcodeScanIcon className="w-5 h-5 shrink-0" />
            <span>Scan product</span>
          </NativeButton>
        </div>
      </div>
    </>
  )
}

import { useEffect, useState, useRef, useCallback } from 'react'
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll'
import { STORAGE_KEY } from '@/shared/utils/addToHomeScreen'
import { NativeButton } from './NativeButton'

/** Событие beforeinstallprompt (Chrome/Edge) для добавления на главный экран. */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> }

interface AddToHomeScreenDrawerProps {
  isOpen: boolean
  onClose: () => void
}

/** Иллюстрация: телефон с сеткой иконок (Frame 61). */
function PhoneIllustration() {
  return (
    <svg
      width="94"
      height="163"
      viewBox="0 0 94 163"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[94px] h-[163px] shrink-0"
      aria-hidden
    >
      <rect width="94" height="163" rx="12" fill="#F4F1F4" />
      <rect x="12" y="12" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="12" y="38" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="12" y="64" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="12" y="90" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="38" y="12" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="38" y="38" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="38" y="64" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="64" y="12" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="64" y="38" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="64" y="64" width="18" height="18" rx="4" fill="#DACCDA" />
      <rect x="38" y="90" width="18" height="18" rx="4" fill="#8E62FF" />
      <rect opacity="0.4" x="35" y="155" width="27" height="2" rx="1" fill="#26222F" />
    </svg>
  )
}

export function AddToHomeScreenDrawer({ isOpen, onClose }: AddToHomeScreenDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const markDismissedAndClose = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage недоступен
    }
    onClose()
  }, [onClose])

  const handleAddToScreen = useCallback(async () => {
    const deferred = deferredPromptRef.current
    if (deferred) {
      try {
        await deferred.prompt()
      } catch {
        // Игнорируем отмену или ошибку
      }
      deferredPromptRef.current = null
    }
    markDismissedAndClose()
  }, [markDismissedAndClose])

  const handleNotNeeded = useCallback(() => {
    markDismissedAndClose()
  }, [markDismissedAndClose])

  if (!isOpen) return null

  return (
    <>
      <div
        data-drawer-overlay
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 backdrop-blur-sm ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'opacity' }}
        aria-hidden
      />

      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-8 max-h-[90vh] overflow-y-auto drawer-native"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          willChange: 'transform',
        }}
        role="dialog"
        aria-labelledby="add-to-home-title"
        aria-describedby="add-to-home-desc"
      >
        <div className="drawer-header flex flex-col items-center">
          <div className="flex justify-center mb-4 pt-0 md:hidden">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <PhoneIllustration />
          <h2
            id="add-to-home-title"
            className="text-xl font-semibold mt-6 text-center"
            style={{ color: '#8E62FF' }}
          >
            Приложение на экране телефона — так быстрее
          </h2>
          <p
            id="add-to-home-desc"
            className="text-[#26222F] text-center mt-3 text-base leading-relaxed"
          >
            Это веб-приложение. Его не нужно устанавливать или обновлять. Просто добавь
            иконку на экран твоего телефона, выбрав «Добавить на домашний экран».
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <NativeButton
            variant="cta"
            className="w-full h-[54px] flex items-center justify-center gap-2 rounded-[16px]"
            onClick={handleAddToScreen}
          >
            <span aria-hidden>+</span>
            Добавить на экран
          </NativeButton>
          <NativeButton
            variant="secondary"
            className="w-full h-[54px] flex items-center justify-center rounded-[16px]"
            onClick={handleNotNeeded}
          >
            Не нужно
          </NativeButton>
        </div>
      </div>
    </>
  )
}

import { useRef, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'close'

interface NativeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  pressScale?: number
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#A4E973] text-black',
  secondary: 'bg-gray-200 text-black',
  close: 'text-gray-500 hover:text-gray-700',
}

export function NativeButton({
  children,
  className = '',
  pressScale = 0.95,
  variant,
  onClick,
  ...props
}: NativeButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!buttonRef.current || props.disabled) return
    // Мгновенное применение без transition - как в iOS
    buttonRef.current.style.transition = 'none'
    buttonRef.current.style.transform = `scale(${pressScale})`
    buttonRef.current.style.opacity = '0.8'
  }

  const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!buttonRef.current || props.disabled) return
    // Плавный возврат с spring-like анимацией (iOS стиль)
    buttonRef.current.style.transition =
      'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    buttonRef.current.style.transform = 'scale(1)'
    buttonRef.current.style.opacity = '1'
    
    // Очищаем transition после анимации
    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.style.transition = ''
      }
    }, 400)
  }

  // Базовые стили для всех кнопок
  const baseStyles = 'font-medium transition-transform duration-0 active:scale-95 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
  

  // Объединяем стили
  const finalClassName = variant
    ? `${baseStyles} ${variantStyles[variant]} ${className}`.trim()
    : `${baseStyles} ${className}`.trim()

  return (
    <button
      ref={buttonRef}
      className={finalClassName}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

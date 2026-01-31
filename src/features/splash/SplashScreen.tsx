import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SplashScreen() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Анимация появления текста
    setIsVisible(true)

    // Переход на главный экран через 2.5 секунды
    const timer = setTimeout(() => {
      navigate('/main', { replace: true })
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#1A3B14' }}
    >
      <div
        className={`flex flex-col items-center justify-center transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center px-7"
          style={{ color: '#A4E973' }}
        >
          You're looking great!
        </h1>
        <p
          className="text-lg md:text-xl text-center px-7"
          style={{ color: '#E8F2E1' }}
        >
          Nutrition Tracking
        </p>
      </div>
    </div>
  )
}

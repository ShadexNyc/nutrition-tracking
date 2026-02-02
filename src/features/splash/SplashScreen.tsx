import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/routes'

const SPLASH_SUBTITLES = [
  'Loading food standards',
  'Counted calories',
  'Burned a couple of extra numbers',
] as const

const SUBTITLE_INTERVAL_MS = 400

export interface SplashScreenProps {
  /** If provided, called after splash delay instead of navigating. Used when splash is shown as gate on every load. */
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps = {}) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [subtitleIndex, setSubtitleIndex] = useState(0)

  useEffect(() => {
    setIsVisible(true)

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete()
      } else {
        navigate(ROUTES.main, { replace: true })
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [navigate, onComplete])

  useEffect(() => {
    const id = setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % SPLASH_SUBTITLES.length)
    }, SUBTITLE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#D3C1FF' }}
    >
      <div
        className={`flex flex-col items-center justify-center transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center px-7"
          style={{ color: '#26222F' }}
        >
          You're looking great!
        </h1>
        <p
          className="text-lg md:text-xl text-center px-7 min-h-[1.5em]"
          style={{ color: '#26222F' }}
        >
          {SPLASH_SUBTITLES[subtitleIndex]}
        </p>
      </div>
    </div>
  )
}

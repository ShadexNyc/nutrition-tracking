import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { SplashScreen } from '@/features/splash'
import { MainScreen } from '@/features/nutrition'

/** Shows splash on every page load/reload, then renders app routes. */
export function AppRouter() {
  const navigate = useNavigate()
  const [splashDone, setSplashDone] = useState(false)

  if (!splashDone) {
    return (
      <SplashScreen
        onComplete={() => {
          navigate(ROUTES.main, { replace: true })
          setSplashDone(true)
        }}
      />
    )
  }

  return (
    <Routes>
      <Route path={ROUTES.splash} element={<Navigate to={ROUTES.main} replace />} />
      <Route path={ROUTES.main} element={<MainScreen />} />
      <Route path="*" element={<Navigate to={ROUTES.main} replace />} />
    </Routes>
  )
}

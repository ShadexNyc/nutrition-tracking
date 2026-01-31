import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { SplashScreen } from '@/features/splash'
import { MainScreen } from '@/features/nutrition'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.splash} element={<SplashScreen />} />
      <Route path={ROUTES.main} element={<MainScreen />} />
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
  )
}

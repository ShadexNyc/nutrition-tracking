import { Routes, Route, Navigate } from 'react-router-dom'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { MainScreen } from '@/features/nutrition/components/MainScreen'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/main" element={<MainScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

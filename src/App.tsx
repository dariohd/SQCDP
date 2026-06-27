import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { DashboardPage } from './pages/DashboardPage'
import { DailyPage } from './pages/DailyPage'
import { LoginPage } from './pages/LoginPage'
import { RoulettePage } from './pages/RoulettePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LegalPage } from './pages/LegalPage'
import { WeekPage } from './pages/WeekPage'

function LoginRedirect() {
  const { isConfigured } = useAuth()
  if (!isConfigured) return <Navigate to="/" replace />
  return <LoginPage />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth()
  if (!isConfigured) return <>{children}</>
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/mentions-legales" element={<LegalPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/semaine" element={<ProtectedRoute><WeekPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/daily" element={<ProtectedRoute><DailyPage /></ProtectedRoute>} />
      <Route path="/roulette" element={<ProtectedRoute><RoulettePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

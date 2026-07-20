import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { DemoShell } from './components/DemoShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { APP_ROUTES, DEMO_ROUTES, ROUTES } from './lib/routes'
import { DashboardPage } from './pages/DashboardPage'
import { DailyPage } from './pages/DailyPage'
import { DirectionPage } from './pages/DirectionPage'
import { HelpPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RoulettePage } from './pages/RoulettePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LegalPage } from './pages/LegalPage'
import { WeekPage } from './pages/WeekPage'

function isDeployedHost() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h !== 'localhost' && h !== '127.0.0.1'
}

function ProdMisconfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-bold text-primary">Configuration Supabase manquante</h1>
        <p className="mt-3 text-sm text-slate-600">
          Cette instance de production n&apos;a pas <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> /
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>. L&apos;application est bloquée
          volontairement pour éviter un mode local ouvert sans authentification.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Ajoutez les variables sur Vercel, redéployez, puis reconnectez-vous.
        </p>
      </div>
    </div>
  )
}

function LoginRedirect() {
  const { isConfigured } = useAuth()
  if (!isConfigured) {
    if (isDeployedHost()) return <ProdMisconfigured />
    return <Navigate to={APP_ROUTES.home} replace />
  }
  return <LoginPage />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth()
  if (!isConfigured) {
    if (isDeployedHost()) return <ProdMisconfigured />
    return <>{children}</>
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: 'app' }} />
  return <>{children}</>
}

function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<LandingPage />} />
      <Route path={ROUTES.login} element={<LoginRedirect />} />
      <Route path={ROUTES.legal} element={<LegalPage />} />

      <Route path={DEMO_ROUTES.home} element={<DemoShell />}>
        <Route index element={<HomePage />} />
        <Route path="mois" element={<DashboardPage />} />
        <Route path="semaine" element={<WeekPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="daily" element={<DailyPage />} />
        <Route path="direction" element={<DirectionPage />} />
        <Route path="aide" element={<HelpPage />} />
        <Route path="roulette" element={<RoulettePage />} />
      </Route>

      <Route path={APP_ROUTES.home} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.mois} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.semaine} element={<ProtectedRoute><WeekPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.analytics} element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.daily} element={<ProtectedRoute><DailyPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.direction} element={<ProtectedRoute><DirectionPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.aide} element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path={APP_ROUTES.roulette} element={<ProtectedRoute><RoulettePage /></ProtectedRoute>} />

      <Route path="/mois" element={<LegacyRedirect to={APP_ROUTES.mois} />} />
      <Route path="/semaine" element={<LegacyRedirect to={APP_ROUTES.semaine} />} />
      <Route path="/analytics" element={<LegacyRedirect to={APP_ROUTES.analytics} />} />
      <Route path="/daily" element={<LegacyRedirect to={APP_ROUTES.daily} />} />
      <Route path="/direction" element={<LegacyRedirect to={APP_ROUTES.direction} />} />
      <Route path="/aide" element={<LegacyRedirect to={APP_ROUTES.aide} />} />
      <Route path="/roulette" element={<LegacyRedirect to={APP_ROUTES.roulette} />} />

      <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

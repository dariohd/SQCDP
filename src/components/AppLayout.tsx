import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutDashboard,
  Target,
  Bell,
  Sun,
  TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './ui/Button'
import { SyncStatusBar } from './SyncStatusBar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { APP_ROUTES, DEMO_ROUTES, ROUTES } from '../lib/routes'
import { isDemoMode } from '../lib/demoMode'

function useNavRoutes() {
  const loc = useLocation()
  return loc.pathname.startsWith(DEMO_ROUTES.home) ? DEMO_ROUTES : APP_ROUTES
}

const links = [
  { to: 'home', label: 'Accueil', icon: Home },
  { to: 'mois', label: 'Mois', icon: LayoutDashboard },
  { to: 'semaine', label: 'Semaine', icon: CalendarDays },
  { to: 'analytics', label: 'Pilotage', icon: BarChart3 },
  { to: 'daily', label: 'Daily', icon: Sun },
  { to: 'direction', label: 'Direction', icon: TrendingUp },
  { to: 'roulette', label: 'Roulette', icon: Target },
] as const

interface AppLayoutProps {
  children: ReactNode
  actions?: ReactNode
  notifCount?: number
  onNotifClick?: () => void
}

export function AppLayout({ children, actions, notifCount = 0, onNotifClick }: AppLayoutProps) {
  const loc = useLocation()
  const navRoutes = useNavRoutes()
  const { equipe, apiSlow, apiConnected, syncing, syncPending } = useApp()
  const { membershipError } = useAuth()
  const inDemo = isDemoMode()

  return (
    <div className="min-h-screen pb-12">
      {!inDemo && (
        <SyncStatusBar apiSlow={apiSlow} apiConnected={apiConnected} syncing={syncing} onRetrySync={() => syncPending()} />
      )}
      {!inDemo && membershipError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900" role="status">
          {membershipError}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const path = navRoutes[to]
              return (
              <Link key={path} to={path}>
                <Button
                  variant={loc.pathname === path ? 'primary' : 'ghost'}
                  className="!px-3 !py-2 text-xs"
                >
                  <Icon size={14} />
                  {label}
                </Button>
              </Link>
            )})}
            {onNotifClick && (
              <Button variant="ghost" className="relative !px-3" onClick={onNotifClick}>
                <Bell size={16} />
                {notifCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-delete text-[10px] font-bold text-white">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Button>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <span data-testid="active-equipe" className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {equipe}
            </span>
            {actions}
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200/80 bg-white/50 py-3 text-center text-xs text-slate-500">
        <Link to={ROUTES.legal} className="hover:text-primary hover:underline">
          Mentions légales &amp; confidentialité
        </Link>
      </footer>
    </div>
  )
}

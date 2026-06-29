import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { APP_ROUTES, DEMO_ROUTES } from '../lib/routes'

interface ShortcutHandlers {
  r?: () => void
  i?: () => void
  s?: () => void
  b?: () => void
  n?: () => void
  d?: () => void
}

function getRoutes(pathname: string) {
  return pathname.startsWith(DEMO_ROUTES.home) ? DEMO_ROUTES : APP_ROUTES
}

export function useGlobalKeyboardShortcuts(handlers: ShortcutHandlers) {
  const navigate = useNavigate()
  const location = useLocation()
  const routes = getRoutes(location.pathname)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()

      if (key === 'd' && !e.ctrlKey && !e.metaKey) {
        if (location.pathname !== routes.daily) {
          e.preventDefault()
          navigate(routes.daily)
        }
        handlers.d?.()
        return
      }

      if (location.pathname !== routes.mois && location.pathname !== routes.daily) return

      if (key === 'r' && handlers.r) { e.preventDefault(); handlers.r() }
      if (key === 'i' && handlers.i) { e.preventDefault(); handlers.i() }
      if (key === 's' && handlers.s) { e.preventDefault(); handlers.s() }
      if (key === 'b' && handlers.b) { e.preventDefault(); handlers.b() }
      if (key === 'n' && handlers.n) { e.preventDefault(); handlers.n() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers, navigate, location.pathname, routes])
}

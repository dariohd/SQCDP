import { Link } from 'react-router-dom'
import { Eye, LogIn, X } from 'lucide-react'
import { ROUTES } from '../lib/routes'
import { Button } from './ui/Button'

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-violet-200 bg-violet-50 px-4 py-2.5 text-xs text-violet-950">
      <Eye size={14} className="shrink-0" />
      <span>
        <strong>Mode démo</strong> — Usine Dupont, juin 2026 · consultation seule (données fictives)
      </span>
      <Link to={ROUTES.login}>
        <Button variant="primary" className="!px-3 !py-1.5 !text-xs">
          <LogIn size={12} />
          Créer mon espace
        </Button>
      </Link>
      <Link to={ROUTES.landing} className="inline-flex items-center gap-1 font-medium text-violet-800 hover:underline">
        <X size={12} />
        Quitter la démo
      </Link>
    </div>
  )
}

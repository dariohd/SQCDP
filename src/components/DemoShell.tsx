import { useLayoutEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DEFAULT_AXES } from '../lib/constants'
import { setDemoMode } from '../lib/demoMode'
import { registerDemoReadOnlyToast } from '../lib/demoToast'
import { api, initDemoStore, clearDemoStore } from '../lib/api'
import { DEMO_EQUIPE, DEMO_SITE } from '../lib/demoMode'
import { saveSettings } from '../lib/team'
import { useToast } from '../context/ToastContext'
import { DemoBanner } from './DemoBanner'

export function DemoShell() {
  const [ready, setReady] = useState(false)
  const toast = useToast()

  useLayoutEffect(() => {
    registerDemoReadOnlyToast((msg) => toast.toast(msg, 'info'))

    setDemoMode(true)
    saveSettings({ equipe: DEMO_EQUIPE, site: DEMO_SITE, equipes: ['Ligne 1', 'Ligne 2', 'Ligne 3'] })

    initDemoStore(DEFAULT_AXES)
      .then(() => {
        api.clearCache()
        window.dispatchEvent(new CustomEvent('sqcdp-demo-ready'))
        setReady(true)
      })
      .catch((err) => {
        console.error('[SQCDP] Démo non chargée', err)
        toast.error('Impossible de charger les données de démonstration')
        setReady(true)
      })

    return () => {
      setDemoMode(false)
      clearDemoStore()
      api.clearCache()
      registerDemoReadOnlyToast(() => {})
    }
  }, [toast])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-slate-500">Chargement de la démo usine…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DemoBanner />
      <Outlet />
    </>
  )
}

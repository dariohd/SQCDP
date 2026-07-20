import { Cloud, CloudOff, Database, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { clearFailedSyncJobs, retryFailedSyncJobs } from '../lib/syncQueue'

interface SyncStatusBarProps {
  apiSlow?: boolean
  apiConnected?: boolean
  onRetrySync?: () => void
  syncing?: boolean
}

export function SyncStatusBar({ apiSlow, apiConnected, onRetrySync, syncing }: SyncStatusBarProps) {
  const { online, pending, failed } = useSyncStatus()

  if (!online) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
        <CloudOff size={14} />
        <span>Mode hors ligne — modifications en attente de synchronisation</span>
      </div>
    )
  }

  if (failed > 0) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-900">
        <AlertTriangle size={14} />
        <span>{failed} synchronisation(s) échouée(s) — données locales conservées</span>
        <button
          type="button"
          className="font-semibold underline"
          onClick={() => {
            retryFailedSyncJobs()
            onRetrySync?.()
          }}
        >
          Réessayer
        </button>
        <button type="button" className="underline" onClick={() => clearFailedSyncJobs()}>
          Ignorer
        </button>
      </div>
    )
  }

  if (apiSlow) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-900">
        <Loader2 size={14} className="animate-spin" />
        <span>Connexion à Supabase…</span>
      </div>
    )
  }

  if (syncing) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-900">
        <RefreshCw size={14} className="animate-spin" />
        <span>Synchronisation en cours…</span>
      </div>
    )
  }

  if (pending > 0) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-900">
        <Cloud size={14} />
        <span>{pending} modification(s) en attente</span>
        {onRetrySync && (
          <button type="button" onClick={onRetrySync} className="font-semibold underline">
            Synchroniser
          </button>
        )}
      </div>
    )
  }

  if (apiConnected) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs text-emerald-900">
        <Database size={14} />
        <span>Données enregistrées sur le serveur — accessibles depuis tous les postes</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
      <CloudOff size={14} />
      <span>Supabase injoignable — vérifiez la connexion ou reconnectez-vous</span>
    </div>
  )
}

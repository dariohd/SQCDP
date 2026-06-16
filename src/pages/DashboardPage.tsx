import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  LogOut,
  Maximize2,
  PenLine,
  RefreshCw,
  Settings,
  Upload,
} from 'lucide-react'
import { AxisCard } from '../components/AxisCard'
import { AppLayout } from '../components/AppLayout'
import { GlobalSummary } from '../components/GlobalSummary'
import { Legend } from '../components/Legend'
import { MonthSelector } from '../components/MonthSelector'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { StandUpOverlay } from '../components/StandUpOverlay'
import { ActionDialog } from '../components/dialogs/ActionDialog'
import { BulkEntryDialog } from '../components/dialogs/BulkEntryDialog'
import { DayDialog } from '../components/dialogs/DayDialog'
import { MonthDetailsDialog } from '../components/dialogs/MonthDetailsDialog'
import { SettingsDialog } from '../components/dialogs/SettingsDialog'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Axe, DayData } from '../types'
import { api } from '../lib/api'
import { exportToCSV, importFromCSV } from '../lib/csv'
import { buildMonthDays } from '../hooks/useAxisData'
import { computeNotifications } from '../lib/notifications'
import { logAudit } from '../lib/auditLog'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function DashboardPage() {
  const { axes, actions, commentaires, monthKey, loading, refresh, colors, labels, dataVersion, bumpData } = useApp()
  const { signOut, isConfigured, user } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [standUp, setStandUp] = useState(false)
  const [daysByAxe, setDaysByAxe] = useState<Map<number, DayData[]>>(new Map())

  const [dayDialog, setDayDialog] = useState<{
    axe: Axe
    dayIndex: number
    days: DayData[]
  } | null>(null)
  const [monthDetails, setMonthDetails] = useState<{ axe: Axe; days: DayData[] } | null>(null)
  const [actionDialog, setActionDialog] = useState<{ axe: Axe; actionId?: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map = new Map<number, DayData[]>()
      for (const axe of axes) {
        map.set(axe.id, await buildMonthDays(axe, monthKey, actions, commentaires))
      }
      if (!cancelled) setDaysByAxe(map)
    }
    if (axes.length) load()
    return () => { cancelled = true }
  }, [axes, monthKey, actions, commentaires, dataVersion])

  const notifications = useMemo(
    () => computeNotifications(axes, actions, daysByAxe, monthKey),
    [axes, actions, daysByAxe, monthKey],
  )

  useKeyboardShortcuts({
    r: () => refresh(),
    i: () => fileInputRef.current?.click(),
    s: () => setStandUp(true),
    b: () => setShowBulk(true),
    n: () => setShowNotifs(true),
  })

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const result = await importFromCSV(file, axes)
      api.clearCache()
      await refresh()
      bumpData()
      logAudit('Import CSV', file.name, user?.email ?? 'Anonyme')
      toast.success(
        `Import : ${result.etats} états, ${result.actions} actions, ${result.comments} commentaires`,
      )
      if (result.errors.length) toast.warning(`${result.errors.length} avertissement(s)`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur import')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExport = async () => {
    const dayStates = await api.loadDayStates()
    exportToCSV(axes, actions, commentaires, dayStates)
    toast.success('Export CSV téléchargé')
  }

  return (
    <AppLayout
      notifCount={notifications.length}
      onNotifClick={() => setShowNotifs(true)}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={() => setStandUp(true)}>
            <Maximize2 size={14} />
            Stand-up
          </Button>
          <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={() => setShowBulk(true)}>
            <PenLine size={14} />
            Saisie
          </Button>
          <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={() => fileInputRef.current?.click()} loading={importing}>
            <Upload size={14} />
            Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
          <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={handleExport}>
            <Download size={14} />
            CSV
          </Button>
          <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={() => setShowSettings(true)}>
            <Settings size={14} />
          </Button>
          <Button variant="ghost" className="!px-2" onClick={() => refresh()}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          {isConfigured && (
            <Button variant="primary" className="!px-3 !py-2 text-xs" onClick={() => signOut()}>
              <LogOut size={14} />
            </Button>
          )}
        </div>
      }
    >
      <main className="mx-auto max-w-[1800px] px-4 pt-8">
        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-wide text-primary md:text-5xl">SQCDP</h1>
          <p className="mt-2 text-lg text-slate-500">Tableau de bord mensuel</p>
        </motion.div>
        <div className="mb-6"><Legend /></div>
        <div className="mb-6"><MonthSelector /></div>
        <div className="mb-8"><GlobalSummary /></div>
        {loading && axes.length === 0 ? (
          <div className="flex justify-center py-24">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" key={`${monthKey}-${dataVersion}`}>
            {axes.map((axe, i) => (
              <AxisCard
                key={axe.id}
                axe={axe}
                monthKey={monthKey}
                colors={colors}
                labels={labels}
                actions={actions}
                commentaires={commentaires}
                index={i}
                dataVersion={dataVersion}
                onDayClick={(a, d, days) => setDayDialog({ axe: a, dayIndex: d, days })}
                onMonthDetails={(a, days) => setMonthDetails({ axe: a, days })}
                onActionClick={(action) => {
                  const axeFound = axes.find((x) => x.id === action.axe_id)
                  if (axeFound) setActionDialog({ axe: axeFound, actionId: action.id })
                }}
              />
            ))}
          </div>
        )}
      </main>

      <NotificationsPanel open={showNotifs} onClose={() => setShowNotifs(false)} notifications={notifications} />
      <StandUpOverlay open={standUp} onClose={() => setStandUp(false)} axes={axes} monthKey={monthKey} colors={colors} labels={labels} daysByAxe={daysByAxe} />
      <DayDialog open={!!dayDialog} onClose={() => setDayDialog(null)} axe={dayDialog?.axe ?? null} dayIndex={dayDialog?.dayIndex ?? null} days={dayDialog?.days ?? []} monthKey={monthKey} onAddAction={() => { if (dayDialog) { setActionDialog({ axe: dayDialog.axe }); setDayDialog(null) } }} onEditAction={(id) => { if (dayDialog) setActionDialog({ axe: dayDialog.axe, actionId: id }) }} onRefresh={() => bumpData()} />
      <ActionDialog open={!!actionDialog} onClose={() => setActionDialog(null)} axe={actionDialog?.axe ?? null} actionId={actionDialog?.actionId} onSaved={() => bumpData()} />
      <MonthDetailsDialog open={!!monthDetails} onClose={() => setMonthDetails(null)} axe={monthDetails?.axe ?? null} days={monthDetails?.days ?? []} monthKey={monthKey} />
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      <BulkEntryDialog open={showBulk} onClose={() => setShowBulk(false)} onSaved={() => bumpData()} />
    </AppLayout>
  )
}

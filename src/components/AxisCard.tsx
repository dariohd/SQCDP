import { motion } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Axe, Action, DayData, StateColors, StateLabels } from '../types'
import { DonutChart } from './DonutChart'
import { Button } from './ui/Button'
import {
  buildMonthDays,
  computeStats,
  getClosedActions,
  getDueSoonActions,
  getOpenActions,
} from '../hooks/useAxisData'
import { formatDateJJMMAA } from '../lib/utils'

interface AxisCardProps {
  axe: Axe
  monthKey: string
  colors: StateColors
  labels: StateLabels
  actions: Action[]
  commentaires: import('../types').Comment[]
  index: number
  dataVersion: number
  onDayClick: (axe: Axe, dayIndex: number, days: DayData[]) => void
  onMonthDetails: (axe: Axe, days: DayData[]) => void
  onActionClick: (action: Action) => void
}

export function AxisCard({
  axe,
  monthKey,
  colors,
  labels,
  actions,
  commentaires,
  index,
  dataVersion,
  onDayClick,
  onMonthDetails,
  onActionClick,
}: AxisCardProps) {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [showClosed, setShowClosed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    buildMonthDays(axe, monthKey, actions, commentaires).then((d) => {
      if (!cancelled) {
        setDays(d)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [axe, monthKey, actions, commentaires, dataVersion])

  const stats = computeStats(days)
  const axeActions = actions.filter((a) => Number(a.axe_id) === axe.id)
  const openActions = getOpenActions(axeActions)
  const closedActions = getClosedActions(axeActions)
  const dueSoon = getDueSoonActions(axeActions)

  const statItems = [
    { key: 'vert' as const, label: labels.vert, color: colors.vert },
    { key: 'jaune' as const, label: labels.jaune, color: colors.jaune },
    { key: 'rouge' as const, label: labels.rouge, color: colors.rouge },
    { key: 'gris' as const, label: labels.gris, color: colors.gris },
  ]

  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-primary/10 transition-shadow hover:shadow-xl hover:shadow-primary/15"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">
            <span className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
              {axe.key}
            </span>
            {axe.label}
          </h3>
        </div>
        <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={() => onMonthDetails(axe, days)}>
          <Calendar size={14} />
          Détails mois
        </Button>
      </header>

      <div className="relative">
        {loading ? (
          <div className="flex h-[340px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <DonutChart
            days={days}
            axeKey={axe.key}
            monthKey={monthKey}
            colors={colors}
            onDayClick={(d) => onDayClick(axe, d, days)}
            onCenterClick={() => {
              const now = new Date()
              const paris = { timeZone: 'Europe/Paris' as const }
              const currentMonth = `${now.toLocaleString('fr-FR', { ...paris, year: 'numeric' })}-${String(parseInt(now.toLocaleString('fr-FR', { ...paris, month: 'numeric' }), 10)).padStart(2, '0')}`
              if (monthKey === currentMonth) {
                const dayIdx = parseInt(now.toLocaleString('fr-FR', { ...paris, day: 'numeric' }), 10) - 1
                onDayClick(axe, dayIdx, days)
              }
            }}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {statItems.map((s) => (
          <div
            key={s.key}
            className="rounded-xl bg-slate-50 p-2 text-center transition hover:bg-slate-100"
          >
            <div
              className="mx-auto mb-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <div className="text-lg font-bold text-slate-800">{stats.counts[s.key]}</div>
            <div className="text-[10px] font-medium text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {dueSoon.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#a26c1f]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-state-attention" />
            Échéance &lt; 7 jours ({dueSoon.length})
          </h4>
          <ActionList actions={dueSoon} onClick={onActionClick} highlight />
        </section>
      )}

      <section className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Actions ouvertes ({openActions.length})
        </h4>
        <ActionList actions={openActions} onClick={onActionClick} />
      </section>

      {closedActions.length > 0 && (
        <section className="mt-4">
          <button
            className="flex w-full items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary"
            onClick={() => setShowClosed(!showClosed)}
          >
            {showClosed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Actions fermées ({closedActions.length})
          </button>
          {showClosed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <ActionList actions={closedActions} onClick={onActionClick} muted />
            </motion.div>
          )}
        </section>
      )}
    </motion.article>
  )
}

function ActionList({
  actions,
  onClick,
  highlight,
  muted,
}: {
  actions: Action[]
  onClick: (a: Action) => void
  highlight?: boolean
  muted?: boolean
}) {
  if (actions.length === 0) {
    return <p className="text-sm italic text-slate-400">Aucune action</p>
  }
  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <button
          key={a.id ?? `${a.probleme}-${a.porteur}`}
          onClick={() => onClick(a)}
          className={`w-full rounded-xl border p-3 text-left text-sm transition hover:shadow-md ${
            highlight
              ? 'border-state-attention/50 bg-state-attention/10 hover:border-state-attention'
              : muted
                ? 'border-slate-100 bg-slate-50 opacity-70'
                : 'border-slate-100 bg-white hover:border-primary/30 hover:bg-primary/5'
          }`}
        >
          <div className="font-medium text-slate-800 line-clamp-1">{a.probleme}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>Porteur: {a.porteur}</span>
            {a.created_at && <span>Créée: {formatDateJJMMAA(a.created_at)}</span>}
            {a.echeance && <span>Échéance: {formatDateJJMMAA(a.echeance)}</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

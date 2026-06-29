import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { useApp } from '../context/AppContext'
import { computeTrends, computeKPIs } from '../lib/analytics'
import { buildMonthDays, computeStats } from '../hooks/useAxisData'
import { formatMonthLabel, getCurrentMonthYearKey } from '../lib/utils'
import { getCurrentEquipe } from '../lib/team'

const TARGET_KEY = 'sqcdp_axis_targets'
const DEFAULT_TARGET = 85

function getTargets(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(TARGET_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function DirectionPage() {
  const { axes, actions, commentaires, monthKey, colors, labels } = useApp()
  const [trends, setTrends] = useState<Awaited<ReturnType<typeof computeTrends>>>([])
  const [axisStats, setAxisStats] = useState<{ axe: typeof axes[0]; pctOk: number; counts: ReturnType<typeof computeStats>['counts'] }[]>([])
  const [loading, setLoading] = useState(true)
  const targets = getTargets()
  const kpis = computeKPIs(actions)
  const equipe = getCurrentEquipe()

  useEffect(() => {
    let cancelled = false
    async function load() {
      const stats = []
      for (const axe of axes) {
        const days = await buildMonthDays(axe, monthKey, actions, commentaires)
        const s = computeStats(days)
        const total = days.length
        const pctOk = total ? Math.round((s.counts.vert / total) * 100) : 0
        stats.push({ axe, pctOk, counts: s.counts })
      }
      const t = await computeTrends(axes, actions, commentaires, 6)
      if (!cancelled) {
        setAxisStats(stats)
        setTrends(t)
        setLoading(false)
      }
    }
    if (axes.length) load()
    return () => { cancelled = true }
  }, [axes, actions, commentaires, monthKey])

  const radarData = useMemo(
    () =>
      axisStats.map(({ axe, pctOk }) => ({
        axis: axe.key,
        label: `${axe.key} — ${axe.label}`,
        pctOk,
        cible: targets[axe.key] ?? DEFAULT_TARGET,
      })),
    [axisStats, targets],
  )

  const globalPct = axisStats.length
    ? Math.round(axisStats.reduce((a, s) => a + s.pctOk, 0) / axisStats.length)
    : 0

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Vue Direction</h1>
          <p className="mt-1 text-slate-500">
            {formatMonthLabel(monthKey)} · {equipe} · Synthèse management
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CheckCircle2, label: '% OK global', value: `${globalPct}%`, color: 'text-state-ok' },
            { icon: Target, label: 'Objectif', value: `${DEFAULT_TARGET}%`, color: 'text-primary' },
            { icon: AlertTriangle, label: 'Actions retard', value: kpis.lateActions, color: 'text-delete' },
            { icon: TrendingUp, label: 'Taux clôture actions', value: `${kpis.closureRate}%`, color: 'text-primary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-md">
              <Icon className={`mb-2 ${color}`} size={24} />
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 font-semibold text-primary">Radar SQCDP — % jours OK</h2>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Réalisé" dataKey="pctOk" stroke="#3A55A4" fill="#3A55A4" fillOpacity={0.4} />
                  <Radar name="Cible" dataKey="cible" stroke="#53c15e" fill="#53c15e" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 font-semibold text-primary">Tendance % OK (6 mois)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pctOk" stroke="#3A55A4" strokeWidth={2} dot={{ r: 4 }} name="% OK" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 font-semibold text-primary">Détail par axe — {formatMonthLabel(monthKey)}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Axe</th>
                  <th className="pb-3 pr-4">% OK</th>
                  <th className="pb-3 pr-4">Écart vs cible</th>
                  <th className="pb-3 pr-4">{labels.vert}</th>
                  <th className="pb-3 pr-4">{labels.jaune}</th>
                  <th className="pb-3 pr-4">{labels.rouge}</th>
                  <th className="pb-3">{labels.gris}</th>
                </tr>
              </thead>
              <tbody>
                {axisStats.map(({ axe, pctOk, counts }) => {
                  const cible = targets[axe.key] ?? DEFAULT_TARGET
                  const ecart = pctOk - cible
                  return (
                    <tr key={axe.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium">{axe.key} — {axe.label}</td>
                      <td className="py-3 font-bold text-primary">{pctOk}%</td>
                      <td className={`py-3 font-medium ${ecart >= 0 ? 'text-state-ok' : 'text-delete'}`}>
                        {ecart >= 0 ? '+' : ''}{ecart} pts
                      </td>
                      <td className="py-3">
                        <span className="inline-block h-3 w-3 rounded-full mr-1" style={{ background: colors.vert }} />
                        {counts.vert}
                      </td>
                      <td className="py-3">
                        <span className="inline-block h-3 w-3 rounded-full mr-1" style={{ background: colors.jaune }} />
                        {counts.jaune}
                      </td>
                      <td className="py-3">
                        <span className="inline-block h-3 w-3 rounded-full mr-1" style={{ background: colors.rouge }} />
                        {counts.rouge}
                      </td>
                      <td className="py-3">{counts.gris}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {monthKey !== getCurrentMonthYearKey() && (
          <p className="mt-4 text-center text-sm text-slate-400">
            Astuce : sélectionnez le mois courant sur le tableau mensuel pour une vue à jour.
          </p>
        )}
      </main>
    </AppLayout>
  )
}

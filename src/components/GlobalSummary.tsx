import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { buildMonthDays, computeStats } from '../hooks/useAxisData'

export function GlobalSummary() {
  const { axes, actions, commentaires, monthKey, colors, labels, dataVersion } = useApp()
  const [totals, setTotals] = useState({ vert: 0, jaune: 0, rouge: 0, gris: 0, actions: 0, comments: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const all = await Promise.all(
        axes.map((axe) => buildMonthDays(axe, monthKey, actions, commentaires)),
      )
      if (cancelled) return
      const agg = { vert: 0, jaune: 0, rouge: 0, gris: 0, actions: 0, comments: 0 }
      all.forEach((days) => {
        const s = computeStats(days)
        agg.vert += s.counts.vert
        agg.jaune += s.counts.jaune
        agg.rouge += s.counts.rouge
        agg.gris += s.counts.gris
        days.forEach((d) => {
          agg.actions += d.actions.length
          agg.comments += d.commentaires.length
        })
      })
      setTotals(agg)
    }
    if (axes.length) load()
    return () => { cancelled = true }
  }, [axes, monthKey, actions, commentaires, dataVersion])

  const items = [
    { label: labels.vert, value: totals.vert, color: colors.vert },
    { label: labels.jaune, value: totals.jaune, color: colors.jaune },
    { label: labels.rouge, value: totals.rouge, color: colors.rouge },
    { label: labels.gris, value: totals.gris, color: colors.gris },
    { label: 'Actions', value: totals.actions, color: '#3A55A4' },
    { label: 'Commentaires', value: totals.comments, color: '#1952a2' },
  ]

  return (
    <motion.div
      className="grid grid-cols-3 gap-3 sm:grid-cols-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl bg-white p-4 text-center shadow-md shadow-primary/5 transition hover:shadow-lg"
        >
          <div
            className="mx-auto mb-2 h-1 w-8 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <div className="text-2xl font-bold text-slate-800">{item.value}</div>
          <div className="text-xs font-medium text-slate-500">{item.label}</div>
        </div>
      ))}
    </motion.div>
  )
}

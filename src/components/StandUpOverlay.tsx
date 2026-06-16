import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Axe, DayData, StateColors, StateLabels } from '../types'
import { DonutChart } from './DonutChart'
import { Button } from './ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  axes: Axe[]
  monthKey: string
  colors: StateColors
  labels: StateLabels
  daysByAxe: Map<number, DayData[]>
}

export function StandUpOverlay({ open, onClose, axes, monthKey, colors, labels, daysByAxe }: Props) {
  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] bg-slate-900 text-white overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-2xl font-bold">Mode Stand-up — {monthKey}</h1>
          <Button variant="ghost" onClick={onClose} className="!text-white hover:!bg-white/10">
            <X size={20} />
            Quitter
          </Button>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {axes.map((axe) => {
            const days = daysByAxe.get(axe.id) ?? []
            const counts = days.reduce(
              (a, d) => { a[d.etat]++; return a },
              { vert: 0, jaune: 0, rouge: 0, gris: 0 },
            )
            return (
              <div key={axe.id} className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <h2 className="text-xl font-bold text-center mb-2 text-primary">
                  {axe.key} — {axe.label}
                </h2>
                <DonutChart
                  days={days}
                  axeKey={axe.key}
                  monthKey={monthKey}
                  colors={colors}
                  onDayClick={() => {}}
                />
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
                  {(['vert', 'jaune', 'rouge', 'gris'] as const).map((k) => (
                    <div key={k}>
                      <div className="font-bold text-lg">{counts[k]}</div>
                      <div className="text-xs opacity-70">{labels[k]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

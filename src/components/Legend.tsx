import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

export function Legend() {
  const { colors, labels } = useApp()

  const etats = [
    { key: 'vert', color: colors.vert, label: labels.vert },
    { key: 'jaune', color: colors.jaune, label: labels.jaune },
    { key: 'rouge', color: colors.rouge, label: labels.rouge },
    { key: 'gris', color: colors.gris, label: labels.gris },
  ]

  return (
    <motion.div
      className="rounded-2xl bg-white/80 p-4 shadow-md shadow-primary/5 backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-600">États:</span>
          {etats.map((e) => (
            <span key={e.key} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: e.color }}
              />
              <span className="text-slate-700">{e.label}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-600">Indicateurs:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-6 rounded bg-primary" />
            <span>Commentaire</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 bg-primary" />
            <span>Jour actuel</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-600">Jours:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#f0f0f0] ring-1 ring-slate-200" />
            Travail
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#d0d0d0]" />
            Weekend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#bbb]" />
            Férié
          </span>
        </div>
      </div>
    </motion.div>
  )
}

import type { Axe, DayData } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { formatMonthLabel } from '../../lib/utils'

interface MonthDetailsDialogProps {
  open: boolean
  onClose: () => void
  axe: Axe | null
  days: DayData[]
  monthKey: string
}

export function MonthDetailsDialog({ open, onClose, axe, days, monthKey }: MonthDetailsDialogProps) {
  const { labels, colors } = useApp()
  if (!axe) return null

  const etatLabel = (e: string) => {
    const map: Record<string, string> = {
      vert: labels.vert,
      jaune: labels.jaune,
      rouge: labels.rouge,
      gris: labels.gris,
    }
    return map[e] ?? e
  }

  const etatColor = (e: string) => {
    const map: Record<string, string> = {
      vert: colors.vert,
      jaune: colors.jaune,
      rouge: colors.rouge,
      gris: colors.gris,
    }
    return map[e] ?? colors.gris
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Détails mensuels — ${axe.label} (${formatMonthLabel(monthKey)})`}
      size="xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-600">
              <th className="px-3 py-2 font-semibold">Jour</th>
              <th className="px-3 py-2 font-semibold">État</th>
              <th className="px-3 py-2 font-semibold">Actions</th>
              <th className="px-3 py-2 font-semibold">Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="px-3 py-2 font-medium">{i + 1}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${etatColor(d.etat)}33`, color: '#333' }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: etatColor(d.etat) }} />
                    {etatLabel(d.etat)}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{d.actions.length}</td>
                <td className="px-3 py-2 text-slate-600">{d.commentaires.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </Modal>
  )
}

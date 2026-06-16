import { useState } from 'react'
import type { Axe, EtatKey } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { saveDayEtat } from '../../hooks/useAxisData'
import { getParisDateParts } from '../../lib/utils'

interface BulkEntryDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function BulkEntryDialog({ open, onClose, onSaved }: BulkEntryDialogProps) {
  const { axes, labels, colors, refresh } = useApp()
  const { day } = getParisDateParts()
  const [etats, setEtats] = useState<Record<number, EtatKey>>({})
  const [saving, setSaving] = useState(false)

  const etatOptions: EtatKey[] = ['vert', 'jaune', 'rouge', 'gris']
  const etatLabel = (k: EtatKey) => labels[k]

  const handleSave = async () => {
    setSaving(true)
    try {
      const monthKey = `${getParisDateParts().year}-${String(getParisDateParts().month).padStart(2, '0')}`
      await Promise.all(
        Object.entries(etats).map(([axeId, etat]) =>
          saveDayEtat(Number(axeId), monthKey, day, etat),
        ),
      )
      await refresh()
      onSaved()
      onClose()
      setEtats({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Saisie rapide — Jour ${day}`} size="md">
      <p className="mb-4 text-sm text-slate-500">
        Définissez l'état du jour actuel pour chaque axe en une seule fois.
      </p>
      <div className="space-y-4">
        {axes.map((axe: Axe) => (
          <div key={axe.id} className="rounded-xl border border-slate-100 p-4">
            <div className="mb-2 font-semibold text-primary">
              {axe.key} — {axe.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {etatOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEtats({ ...etats, [axe.id]: e })}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition ${
                    etats[axe.id] === e
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[e] }} />
                  {etatLabel(e)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={Object.keys(etats).length === 0}
        >
          Enregistrer tout
        </Button>
      </div>
    </Modal>
  )
}

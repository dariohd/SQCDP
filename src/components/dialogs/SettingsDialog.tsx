import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { getSettings, saveSettings } from '../../lib/team'
import type { StateColors, StateLabels } from '../../types'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { colors, labels, axes, updateColors, updateLabels, refresh } = useApp()
  const [localColors, setLocalColors] = useState<StateColors>(colors)
  const [localLabels, setLocalLabels] = useState<StateLabels>(labels)
  const [equipe, setEquipe] = useState(getSettings().equipe)
  const [site, setSite] = useState(getSettings().site)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const s = getSettings()
      setEquipe(s.equipe)
      setSite(s.site)
      setLocalColors(colors)
      setLocalLabels(labels)
    }
  }, [open, colors, labels])

  const handleSave = async () => {
    setSaving(true)
    try {
      updateColors(localColors)
      updateLabels(localLabels)
      saveSettings({ equipe, site })
      await api.saveParams({
        axes: axes.map((a) => ({ key: a.key, label: a.label })),
        colors: localColors,
        labels: localLabels,
      })
      await refresh()
      onClose()
    } catch {
      updateColors(localColors)
      updateLabels(localLabels)
      saveSettings({ equipe, site })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const colorFields: (keyof StateColors)[] = ['vert', 'jaune', 'rouge', 'gris']

  return (
    <Modal open={open} onClose={onClose} title="Paramètres" size="md">
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 font-semibold text-slate-700">Équipe & site</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Équipe active</label>
              <select value={equipe} onChange={(e) => setEquipe(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                {getSettings().equipes.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
                <option value={equipe}>{equipe}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Site</label>
              <input value={site} onChange={(e) => setSite(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-700">Couleurs des états</h3>
          <div className="grid grid-cols-2 gap-4">
            {colorFields.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={localColors[key]} onChange={(e) => setLocalColors({ ...localColors, [key]: e.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border-0" />
                <span className="text-sm capitalize text-slate-600">{key}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-700">Libellés</h3>
          <div className="grid grid-cols-2 gap-3">
            {colorFields.map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-slate-500 capitalize">{key}</label>
                <input value={localLabels[key]} onChange={(e) => setLocalLabels({ ...localLabels, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} loading={saving}>Enregistrer</Button>
        </div>
      </div>
    </Modal>
  )
}

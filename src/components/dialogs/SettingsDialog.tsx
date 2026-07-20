import { useEffect, useState } from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { getSettings, saveSettings } from '../../lib/team'
import { getMySiteRole, inviteSiteMember, listSiteMembers, type SiteMemberRow } from '../../lib/membership'
import { isSupabaseConfigured } from '../../lib/supabase'
import type { StateColors, StateLabels } from '../../types'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { colors, labels, axes, updateColors, updateLabels, refresh, setEquipe: applyEquipe } = useApp()
  const toast = useToast()
  const { membershipError } = useAuth()
  const [localColors, setLocalColors] = useState<StateColors>(colors)
  const [localLabels, setLocalLabels] = useState<StateLabels>(labels)
  const [equipe, setEquipe] = useState(getSettings().equipe)
  const [site, setSite] = useState(getSettings().site)
  const [equipeNames, setEquipeNames] = useState<string[]>(getSettings().equipes)
  const [newEquipe, setNewEquipe] = useState('')
  const [saving, setSaving] = useState(false)
  const [addingEquipe, setAddingEquipe] = useState(false)
  const [siteRole, setSiteRole] = useState<'admin' | 'member' | null>(null)
  const [members, setMembers] = useState<SiteMemberRow[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (!open) return
    const s = getSettings()
    setEquipe(s.equipe)
    setSite(s.site)
    setLocalColors(colors)
    setLocalLabels(labels)
    api.loadOrganisation().then((org) => {
      setEquipeNames(org.equipes.map((e) => e.name))
      // Ne pas écraser le site choisi s'il est déjà cohérent
      if (!s.site || org.equipes.some((e) => e.site === s.site) || org.site === s.site) {
        /* keep settings site */
      } else if (org.site) {
        setSite(org.site)
      }
    })
    if (isSupabaseConfigured()) {
      void getMySiteRole(s.site).then(setSiteRole)
      void listSiteMembers(s.site)
        .then(setMembers)
        .catch(() => setMembers([]))
    }
  }, [open, colors, labels])

  const handleAddEquipe = async () => {
    const name = newEquipe.trim()
    if (!name || equipeNames.includes(name)) return
    setAddingEquipe(true)
    try {
      await api.saveEquipe(name)
      setEquipeNames((prev) => [...prev, name])
      saveSettings({ equipes: [...equipeNames, name] })
      setNewEquipe('')
      toast.success(`Équipe « ${name} » enregistrée`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ajouter l'équipe")
    } finally {
      setAddingEquipe(false)
    }
  }

  const handleInvite = async () => {
    const email = inviteEmail.trim()
    if (!email) return
    setInviting(true)
    try {
      await inviteSiteMember(email, inviteRole, site)
      toast.success(`Accès accordé à ${email}`)
      setInviteEmail('')
      setMembers(await listSiteMembers(site))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invitation impossible")
    } finally {
      setInviting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      updateColors(localColors)
      updateLabels(localLabels)
      applyEquipe(equipe)
      saveSettings({ equipe, site, equipes: equipeNames })
      await api.saveParams({
        axes: axes.map((a) => ({ key: a.key, label: a.label })),
        colors: localColors,
        labels: localLabels,
      })
      await refresh()
      toast.success('Paramètres enregistrés')
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Enregistrement cloud échoué — valeurs locales conservées')
    } finally {
      setSaving(false)
    }
  }

  const colorFields: (keyof StateColors)[] = ['vert', 'jaune', 'rouge', 'gris']

  return (
    <Modal open={open} onClose={onClose} title="Paramètres" size="md">
      <div className="space-y-6">
        {membershipError && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900" role="alert">
            {membershipError}
          </p>
        )}

        <section>
          <h3 className="mb-3 font-semibold text-slate-700">Équipe & site</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-equipe" className="mb-1 block text-xs text-slate-500">Équipe active</label>
              <select id="settings-equipe" value={equipe} onChange={(e) => setEquipe(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                {equipeNames.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="settings-site" className="mb-1 block text-xs text-slate-500">Site</label>
              <input id="settings-site" value={site} onChange={(e) => setSite(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newEquipe}
              onChange={(e) => setNewEquipe(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEquipe()}
              placeholder="Nouvelle équipe / ligne"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              aria-label="Nouvelle équipe"
            />
            <Button variant="secondary" onClick={handleAddEquipe} loading={addingEquipe} className="!px-3">
              <Plus size={16} />
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Les équipes sont synchronisées avec Supabase (cache local si hors ligne).
          </p>
        </section>

        {isSupabaseConfigured() && siteRole === 'admin' && (
          <section>
            <h3 className="mb-3 font-semibold text-slate-700">Membres du site</h3>
            <ul className="mb-3 max-h-32 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-2 text-sm">
              {members.length === 0 && <li className="text-xs text-slate-400">Aucun membre listé (appliquez la migration 004).</li>}
              {members.map((m) => (
                <li key={m.user_id} className="flex justify-between gap-2 px-1 py-0.5">
                  <span className="truncate">{m.email}</span>
                  <span className="text-xs text-slate-500">{m.role}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@entreprise.com"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                aria-label="Email à inviter"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                aria-label="Rôle"
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
              <Button variant="secondary" onClick={handleInvite} loading={inviting} className="!px-3">
                <UserPlus size={16} />
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              L&apos;utilisateur doit déjà exister dans Supabase Authentication.
            </p>
          </section>
        )}

        <section>
          <h3 className="mb-3 font-semibold text-slate-700">Couleurs des états</h3>
          <div className="grid grid-cols-2 gap-4">
            {colorFields.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={localColors[key]} onChange={(e) => setLocalColors({ ...localColors, [key]: e.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border-0" aria-label={`Couleur ${key}`} />
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
                <label htmlFor={`label-${key}`} className="mb-1 block text-xs text-slate-500 capitalize">{key}</label>
                <input id={`label-${key}`} value={localLabels[key]} onChange={(e) => setLocalLabels({ ...localLabels, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
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

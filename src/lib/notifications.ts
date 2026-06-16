import type { Action, Axe, DayData, EtatKey } from '../types'
import { daysUntil } from './utils'

export type NotificationLevel = 'info' | 'warning' | 'danger'

export interface AppNotification {
  id: string
  level: NotificationLevel
  title: string
  message: string
  axeKey?: string
  date?: string
}

export function computeNotifications(
  axes: Axe[],
  actions: Action[],
  allDaysByAxe: Map<number, DayData[]>,
  monthKey: string,
): AppNotification[] {
  const notifs: AppNotification[] = []

  actions.filter((a) => a.statut === 'ouverte').forEach((a) => {
    const days = daysUntil(a.echeance)
    const axe = axes.find((x) => x.id === a.axe_id)
    if (days !== null && days < 0) {
      notifs.push({
        id: `late-${a.id}`,
        level: 'danger',
        title: 'Action en retard',
        message: `${a.probleme} (${a.porteur}) — échéance dépassée`,
        axeKey: axe?.key,
      })
    } else if (days !== null && days <= 3) {
      notifs.push({
        id: `due-${a.id}`,
        level: 'warning',
        title: 'Échéance proche',
        message: `${a.probleme} — J-${days}`,
        axeKey: axe?.key,
      })
    }
  })

  axes.forEach((axe) => {
    const days = allDaysByAxe.get(axe.id) ?? []
    let consecutiveJaune = 0
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i]
      if (d.etat === 'jaune') consecutiveJaune++
      else if (d.etat !== 'gris') break
    }
    if (consecutiveJaune >= 3) {
      notifs.push({
        id: `esc-${axe.id}`,
        level: 'warning',
        title: 'Escalade — Attention récurrente',
        message: `${axe.label} : ${consecutiveJaune} jours consécutifs en Attention`,
        axeKey: axe.key,
      })
    }

    const blocages = days.filter((d) => d.etat === 'rouge').length
    if (blocages >= 2) {
      notifs.push({
        id: `bloc-${axe.id}-${monthKey}`,
        level: 'danger',
        title: 'Blocages multiples',
        message: `${axe.label} : ${blocages} jour(s) en blocage ce mois`,
        axeKey: axe.key,
      })
    }
  })

  const emptyDays = axes.reduce((acc, axe) => {
    const days = allDaysByAxe.get(axe.id) ?? []
    return acc + days.filter((d) => d.etat === 'gris').length
  }, 0)
  if (emptyDays > 50) {
    notifs.push({
      id: 'empty-many',
      level: 'info',
      title: 'Saisie incomplète',
      message: `${emptyDays} jours non renseignés sur le mois`,
    })
  }

  return notifs
}

export function checkEscalation(dayHistory: EtatKey[]): boolean {
  const recent = dayHistory.slice(-3)
  return recent.length === 3 && recent.every((e) => e === 'jaune')
}

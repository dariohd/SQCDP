import { useMemo } from 'react'
import type { Axe, Action, Comment, DayData, StateColors } from '../types'
import type { AxeKey } from '../types'
import { api } from '../lib/api'
import { ETAT_KEY_TO_API } from '../lib/constants'
import { getJoursFeriesFrance, isJourFerie, isWeekend } from '../lib/holidays'
import {
  dateForDay,
  daysInMonth,
  etatApiToKey,
  getCurrentMonthYearKey,
  getTodayIdxFrance,
} from '../lib/utils'

export function useAxisMonthData(monthKey: string) {
  return useMemo(() => {
    const [year, month] = monthKey.split('-').map(Number)
    const days = daysInMonth(year, month - 1)
    return { year, month: month - 1, days }
  }, [monthKey])
}

export async function buildMonthDays(
  axe: Axe,
  monthKey: string,
  actions: Action[],
  commentaires: Comment[],
): Promise<DayData[]> {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const days = daysInMonth(year, month)

  const dayStates = await api.loadDayStates(axe.id)

  const result: DayData[] = []
  for (let i = 0; i < days; i++) {
    const dayNum = i + 1
    const dateStr = dateForDay(monthKey, dayNum)

    const dayState = dayStates.find(
      (ds) =>
        Number(ds.axe_id) === axe.id &&
        ds.date?.slice(0, 10) === dateStr,
    )
    const etat = dayState?.etat ? etatApiToKey(dayState.etat) : 'gris'

    const dayComments = commentaires.filter(
      (c) => Number(c.axe_id) === axe.id && c.date?.slice(0, 10) === dateStr,
    )

    const dayActions = actions.filter((a) => {
      if (Number(a.axe_id) !== axe.id) return false
      const created = a.created_at?.slice(0, 10)
      return created === dateStr
    })

    result.push({ etat, commentaires: dayComments, actions: dayActions })
  }
  return result
}

export function computeStats(days: DayData[]) {
  const counts = { vert: 0, jaune: 0, rouge: 0, gris: 0 }
  const toutesActions: (Action & { jour: number })[] = []
  days.forEach((d, i) => {
    counts[d.etat]++
    d.actions.forEach((a) => toutesActions.push({ ...a, jour: i + 1 }))
  })
  return { counts, toutesActions }
}

export async function saveDayEtat(
  axeId: number,
  monthKey: string,
  day: number,
  etatKey: keyof typeof ETAT_KEY_TO_API,
) {
  const etat = ETAT_KEY_TO_API[etatKey]
  const date = dateForDay(monthKey, day)
  await api.saveDayState(day, axeId, etat, date)
}

export function getOpenActions(actions: Action[]) {
  return actions.filter((a) => a.statut === 'ouverte')
}

export function getClosedActions(actions: Action[]) {
  return actions.filter((a) => a.statut === 'fermee')
}

export function getDueSoonActions(actions: Action[], days = 7) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const limit = new Date(now)
  limit.setDate(limit.getDate() + days)
  return actions.filter((a) => {
    if (a.statut !== 'ouverte' || !a.echeance) return false
    const d = new Date(a.echeance)
    d.setHours(0, 0, 0, 0)
    return d >= now && d <= limit
  })
}

export {
  getCurrentMonthYearKey,
  getTodayIdxFrance,
  getJoursFeriesFrance,
  isJourFerie,
  isWeekend,
}

export type { AxeKey, StateColors }

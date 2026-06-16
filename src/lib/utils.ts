import type { EtatApi, EtatKey } from '../types'
import { ETAT_API_TO_KEY } from './constants'

const PARIS = { timeZone: 'Europe/Paris' } as const

export function getParisDateParts(date = new Date()) {
  const fmt = (opt: Intl.DateTimeFormatOptions) =>
    parseInt(date.toLocaleString('fr-FR', { ...PARIS, ...opt }), 10)
  return {
    year: fmt({ year: 'numeric' }),
    month: fmt({ month: 'numeric' }),
    day: fmt({ day: 'numeric' }),
  }
}

export function getCurrentMonthYearKey(): string {
  const { year, month } = getParisDateParts()
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getTodayIdxFrance(): number {
  return getParisDateParts().day - 1
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date
    .toLocaleString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function formatDateJJMMAA(dateStr?: string | null): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y.slice(2)}`
  }
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
  }
  return ''
}

export function etatApiToKey(etat: EtatApi | string): EtatKey {
  const key = etat.trim().toLowerCase() as EtatApi
  return ETAT_API_TO_KEY[key] ?? 'gris'
}

export function dateForDay(monthKey: string, day: number): string {
  const [y, m] = monthKey.split('-').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function generateMonthOptions(): { value: string; label: string }[] {
  const now = getParisDateParts()
  const options: { value: string; label: string }[] = []
  for (let offset = -12; offset <= 36; offset++) {
    const d = new Date(now.year, now.month - 1 + offset, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: formatMonthLabel(value) })
  }
  return options
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

export function getJoursFeriesFrance(year: number): Date[] {
  const holidays = [
    new Date(year, 0, 1),
    new Date(year, 4, 1),
    new Date(year, 4, 8),
    new Date(year, 6, 14),
    new Date(year, 7, 15),
    new Date(year, 10, 1),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
  ]
  const easter = calculateEaster(year)
  holidays.push(
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 39),
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 49),
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 50),
  )
  return holidays
}

export function isJourFerie(date: Date, joursFeries: Date[]): boolean {
  return joursFeries.some(
    (f) =>
      f.getDate() === date.getDate() &&
      f.getMonth() === date.getMonth() &&
      f.getFullYear() === date.getFullYear(),
  )
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

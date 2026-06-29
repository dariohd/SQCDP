/** Mode démo publique (/demo) — données en mémoire, lecture seule */
let active = false

export const DEMO_MONTH_KEY = '2026-06'
export const DEMO_EQUIPE = 'Ligne 1'
export const DEMO_SITE = 'Site principal'

export function setDemoMode(value: boolean) {
  active = value
}

export function isDemoMode() {
  return active
}

export class DemoReadOnlyError extends Error {
  constructor() {
    super('Mode démo : créez un compte pour modifier les données')
    this.name = 'DemoReadOnlyError'
  }
}

export function assertDemoWritable() {
  if (isDemoMode()) throw new DemoReadOnlyError()
}

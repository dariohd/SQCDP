/** Routes publiques */
export const ROUTES = {
  landing: '/',
  login: '/login',
  legal: '/mentions-legales',
} as const

/** Préfixe application authentifiée */
export const APP = '/app'

export const APP_ROUTES = {
  home: `${APP}`,
  mois: `${APP}/mois`,
  semaine: `${APP}/semaine`,
  analytics: `${APP}/analytics`,
  daily: `${APP}/daily`,
  direction: `${APP}/direction`,
  aide: `${APP}/aide`,
  roulette: `${APP}/roulette`,
} as const

export const DEMO = '/demo'

export const DEMO_ROUTES = {
  home: `${DEMO}`,
  mois: `${DEMO}/mois`,
  semaine: `${DEMO}/semaine`,
  analytics: `${DEMO}/analytics`,
  daily: `${DEMO}/daily`,
  direction: `${DEMO}/direction`,
  aide: `${DEMO}/aide`,
  roulette: `${DEMO}/roulette`,
} as const

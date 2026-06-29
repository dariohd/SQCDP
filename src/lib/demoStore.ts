import type { Action, Axe, Comment, DayState, AppParams, DailyReportRecord, EquipeRecord, Organisation } from '../types'
import { DEFAULT_AXES, DEFAULT_COLORS, DEFAULT_LABELS } from './constants'
import { importCsvRowsToData, parseCsvText } from './csv'
import { DEMO_EQUIPE, DEMO_SITE } from './demoMode'

const DEMO_FILES = [
  'demo_01_etats_juin2026.csv',
  'demo_02_actions_commentaires.csv',
  'demo_03_mise_a_jour_etats.csv',
]

interface DemoStore {
  actions: Action[]
  comments: Comment[]
  dayStates: DayState[]
  loaded: boolean
}

let store: DemoStore = {
  actions: [],
  comments: [],
  dayStates: [],
  loaded: false,
}

export async function initDemoStore(axes: Axe[] = DEFAULT_AXES): Promise<void> {
  const allActions: Action[] = []
  const allComments: Comment[] = []
  const allDayStates: DayState[] = []
  const errors: string[] = []

  for (const file of DEMO_FILES) {
    const res = await fetch(`/demo-data/${file}`)
    if (!res.ok) throw new Error(`Fichier démo introuvable : ${file}`)
    const text = await res.text()
    const rows = parseCsvText(text)
    const data = importCsvRowsToData(rows, axes, DEMO_EQUIPE)
    allActions.push(...data.actions)
    allComments.push(...data.comments)
    allDayStates.push(...data.dayStates)
    errors.push(...data.errors)
  }

  // États : dernière valeur gagne par axe+date
  const stateMap = new Map<string, DayState>()
  allDayStates.forEach((s) => {
    stateMap.set(`${s.axe_id}-${s.date.slice(0, 10)}`, s)
  })

  store = {
    actions: allActions,
    comments: allComments,
    dayStates: Array.from(stateMap.values()),
    loaded: true,
  }
}

export function clearDemoStore() {
  store = { actions: [], comments: [], dayStates: [], loaded: false }
}

export function isDemoStoreReady() {
  return store.loaded
}

export function getDemoActions(equipe = DEMO_EQUIPE): Action[] {
  return store.actions.filter((a) => !a.equipe || a.equipe === equipe)
}

export function getDemoComments(equipe = DEMO_EQUIPE): Comment[] {
  return store.comments.filter((c) => !c.equipe || c.equipe === equipe)
}

export function getDemoDayStates(equipe = DEMO_EQUIPE, axeId?: number): DayState[] {
  let states = store.dayStates.filter((s) => !s.equipe || s.equipe === equipe)
  if (axeId != null) states = states.filter((s) => Number(s.axe_id) === axeId)
  return states
}

export function getDemoOrganisation(): Organisation {
  return {
    site: DEMO_SITE,
    equipes: [
      { name: 'Ligne 1', site: DEMO_SITE },
      { name: 'Ligne 2', site: DEMO_SITE },
      { name: 'Ligne 3', site: DEMO_SITE },
    ],
  }
}

export function getDemoParams(): AppParams {
  return {
    axes: DEFAULT_AXES.map((a) => ({ key: a.key, label: a.label })),
    colors: DEFAULT_COLORS,
    labels: DEFAULT_LABELS,
  }
}

export function getDemoDailyReports(): DailyReportRecord[] {
  return []
}

export function getDemoAction(id: number): Action | undefined {
  return store.actions.find((a) => a.id === id)
}

export async function saveDemoEquipe(name: string): Promise<EquipeRecord> {
  return { name, site: DEMO_SITE }
}

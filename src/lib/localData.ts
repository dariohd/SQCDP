import type { Action, Comment, DayState } from '../types'

const STORAGE_KEY = 'sqcdp_local_data'

interface LocalData {
  dayStates: DayState[]
  actions: Action[]
  comments: Comment[]
}

function read(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { dayStates: [], actions: [], comments: [] }
    const parsed = JSON.parse(raw) as LocalData
    return {
      dayStates: parsed.dayStates ?? [],
      actions: parsed.actions ?? [],
      comments: parsed.comments ?? [],
    }
  } catch {
    return { dayStates: [], actions: [], comments: [] }
  }
}

function write(data: LocalData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getLocalDayStates(axeId?: number): DayState[] {
  const states = read().dayStates
  if (axeId == null) return states
  return states.filter((s) => Number(s.axe_id) === axeId)
}

export function upsertLocalDayState(state: DayState) {
  const data = read()
  const date = state.date.slice(0, 10)
  const idx = data.dayStates.findIndex(
    (s) => Number(s.axe_id) === Number(state.axe_id) && s.date.slice(0, 10) === date,
  )
  const entry = { ...state, date }
  if (idx >= 0) data.dayStates[idx] = entry
  else data.dayStates.push(entry)
  write(data)
}

export function getLocalActions(): Action[] {
  return read().actions
}

export function addLocalAction(action: Action) {
  const data = read()
  const id = action.id ?? Date.now() + Math.floor(Math.random() * 1000)
  data.actions.push({ ...action, id })
  write(data)
}

export function getLocalComments(): Comment[] {
  return read().comments
}

export function addLocalComment(comment: Comment) {
  const data = read()
  const date = comment.date.slice(0, 10)
  data.comments = data.comments.filter(
    (c) => !(Number(c.axe_id) === Number(comment.axe_id) && c.date.slice(0, 10) === date),
  )
  const id = comment.id ?? Date.now() + Math.floor(Math.random() * 1000)
  data.comments.push({ ...comment, id, date })
  write(data)
}

export function clearLocalData() {
  localStorage.removeItem(STORAGE_KEY)
}

export function mergeDayStates(apiStates: DayState[], axeId: number): DayState[] {
  const local = getLocalDayStates(axeId)
  const map = new Map<string, DayState>()
  apiStates
    .filter((s) => Number(s.axe_id) === axeId)
    .forEach((s) => map.set(s.date.slice(0, 10), s))
  local.forEach((s) => map.set(s.date.slice(0, 10), s))
  return Array.from(map.values())
}

export function mergeActions(apiActions: Action[]): Action[] {
  const local = getLocalActions()
  const merged = [...apiActions]
  const keys = new Set(
    apiActions.map((a) => `${a.axe_id}-${a.created_at}-${a.probleme}`),
  )
  local.forEach((a) => {
    const key = `${a.axe_id}-${a.created_at}-${a.probleme}`
    if (!keys.has(key)) merged.push(a)
  })
  return merged
}

export function mergeComments(apiComments: Comment[]): Comment[] {
  const local = getLocalComments()
  const byAxeDate = new Map<string, Comment>()
  apiComments.forEach((c) => {
    byAxeDate.set(`${c.axe_id}-${c.date.slice(0, 10)}`, c)
  })
  local.forEach((c) => {
    byAxeDate.set(`${c.axe_id}-${c.date.slice(0, 10)}`, c)
  })
  return Array.from(byAxeDate.values())
}

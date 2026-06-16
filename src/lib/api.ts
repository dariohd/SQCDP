import type { Action, Axe, Comment, DayState, AppParams } from '../types'
import {
  API_BASE_URL,
  DEFAULT_AXES,
  DEFAULT_COLORS,
  DEFAULT_LABELS,
} from './constants'
import {
  addLocalAction,
  addLocalComment,
  mergeActions,
  mergeComments,
  mergeDayStates,
  upsertLocalDayState,
} from './localData'

class ApiCache {
  private cache = new Map<string, unknown>()

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined
  }

  set(key: string, value: unknown) {
    this.cache.set(key, value)
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  invalidate(...keys: string[]) {
    keys.forEach((k) => this.cache.delete(k))
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new ApiCache()

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  invalidate(...keys: string[]) {
    cache.invalidate(...keys)
  },

  clearCache() {
    cache.clear()
  },

  async loadAxes(): Promise<Axe[]> {
    const cached = cache.get<Axe[]>('axes')
    if (cached) return cached
    try {
      const axes = await fetchJson<Axe[]>(`${API_BASE_URL}/axes`)
      if (Array.isArray(axes) && axes.length > 0) {
        const filtered = axes.filter((a) => (a.key as string) !== 'DCP')
        cache.set('axes', filtered)
        return filtered
      }
    } catch {
      /* fallback */
    }
    cache.set('axes', DEFAULT_AXES)
    return DEFAULT_AXES
  },

  async loadDayStates(axeId?: number): Promise<DayState[]> {
    const key = axeId ? `jour_etats_${axeId}` : 'jour_etats'
    const cached = cache.get<DayState[]>(key)
    if (cached) return cached
    let apiStates: DayState[] = []
    try {
      apiStates = await fetchJson<DayState[]>(`${API_BASE_URL}/jour_etats`)
      if (axeId) apiStates = apiStates.filter((s) => Number(s.axe_id) === axeId)
    } catch {
      apiStates = []
    }
    const merged = axeId ? mergeDayStates(apiStates, axeId) : apiStates
    cache.set(key, merged)
    return merged
  },

  async saveDayState(jour: number, axe_id: number, etat: string, date?: string): Promise<void> {
    const payload: Record<string, unknown> = { jour, axe_id, etat }
    if (date) payload.date = date

    try {
      await fetchJson(`${API_BASE_URL}/jour_etats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      /* fallback local ci-dessous */
    }

    const dateStr =
      date ??
      (() => {
        const now = new Date()
        const p = { timeZone: 'Europe/Paris' as const }
        const y = now.toLocaleString('fr-FR', { ...p, year: 'numeric' })
        const m = now.toLocaleString('fr-FR', { ...p, month: '2-digit' })
        return `${y}-${m}-${String(jour).padStart(2, '0')}`
      })()

    upsertLocalDayState({ axe_id, date: dateStr, etat: etat as DayState['etat'] })
    cache.invalidate('jour_etats', `jour_etats_${axe_id}`, 'monthlyData')
  },

  async loadActions(): Promise<Action[]> {
    const cached = cache.get<Action[]>('actions')
    if (cached) return cached
    let apiActions: Action[] = []
    try {
      const actions = await fetchJson<Action[]>(`${API_BASE_URL}/actions`)
      apiActions = Array.isArray(actions) ? actions : []
    } catch {
      apiActions = []
    }
    const merged = mergeActions(apiActions)
    cache.set('actions', merged)
    return merged
  },

  async getAction(id: number): Promise<Action> {
    return fetchJson<Action>(`${API_BASE_URL}/actions/${id}`)
  },

  async saveAction(action: Action): Promise<Action> {
    const isUpdate = !!action.id
    let result = action
    try {
      const url = isUpdate
        ? `${API_BASE_URL}/actions/${action.id}`
        : `${API_BASE_URL}/actions`
      result = await fetchJson<Action>(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
    } catch {
      addLocalAction(action)
      result = action
    }
    cache.invalidate('actions', 'monthlyData')
    return result
  },

  async deleteAction(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/actions/${id}`, { method: 'DELETE' })
    cache.invalidate('actions', 'monthlyData')
  },

  async loadCommentaires(): Promise<Comment[]> {
    const cached = cache.get<Comment[]>('commentaires')
    if (cached) return cached
    let apiComments: Comment[] = []
    try {
      const comments = await fetchJson<Comment[]>(`${API_BASE_URL}/commentaires`)
      apiComments = Array.isArray(comments) ? comments : []
    } catch {
      apiComments = []
    }
    const merged = mergeComments(apiComments)
    cache.set('commentaires', merged)
    return merged
  },

  async addComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    let result: Comment
    try {
      result = await fetchJson<Comment>(`${API_BASE_URL}/commentaires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      })
    } catch {
      result = { ...comment, id: Date.now() }
      addLocalComment(result)
    }
    cache.invalidate('commentaires', 'monthlyData')
    return result
  },

  async deleteComment(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/commentaires/${id}`, { method: 'DELETE' })
    cache.invalidate('commentaires', 'monthlyData')
  },

  async saveParams(params: AppParams): Promise<void> {
    await fetchJson(`${API_BASE_URL}/params`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    cache.set('params', params)
  },

  getColors() {
    return cache.get('colors') ?? DEFAULT_COLORS
  },

  getLabels() {
    return cache.get('labels') ?? DEFAULT_LABELS
  },

  setLocalParams(colors: typeof DEFAULT_COLORS, labels: typeof DEFAULT_LABELS) {
    cache.set('colors', colors)
    cache.set('labels', labels)
  },
}

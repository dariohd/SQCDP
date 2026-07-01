import type {
  Action,
  Axe,
  Comment,
  DayState,
  AppParams,
  DailyReportRecord,
  EquipeRecord,
  Organisation,
} from '../types'
import {
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
  removeLocalAction,
  removeLocalComment,
  updateLocalAction,
  upsertLocalDayState,
} from './localData'
import {
  addLocalDailyReport,
  getLocalDailyReports,
  mergeOrganisation,
  saveLocalOrganisation,
} from './organisation'
import { enqueueSync, readQueue, writeQueue, MAX_JOB_ATTEMPTS, type SyncJob } from './syncQueue'
import { getCurrentEquipe, getSettings } from './team'
import { isDemoMode } from './demoMode'
import { notifyDemoReadOnly } from './demoToast'
import {
  clearDemoStore,
  getDemoAction,
  getDemoActions,
  getDemoComments,
  getDemoDailyReports,
  getDemoDayStates,
  getDemoOrganisation,
  getDemoParams,
  initDemoStore,
  isDemoStoreReady,
} from './demoStore'
import { isSupabaseConfigured } from './supabase'
import { clearEquipeCache, supabaseData } from './data/supabaseRepo'
import { checkRemoteHealth, isRemoteHealthy, useRemoteAsSource } from './api/connection'

export { initDemoStore, clearDemoStore, isDemoStoreReady }
export { checkRemoteHealth as checkApiHealth, isRemoteHealthy }
export function wasLastApiSlow() {
  return false
}

class ApiCache {
  private cache = new Map<string, unknown>()
  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined
  }
  set(key: string, value: unknown) {
    this.cache.set(key, value)
  }
  invalidate(...keys: string[]) {
    keys.forEach((k) => this.cache.delete(k))
  }
  clear() {
    this.cache.clear()
  }
}

const cache = new ApiCache()

function useCloud() {
  return isSupabaseConfigured() && !isDemoMode()
}

function blockDemoWrite() {
  if (!isDemoMode()) return false
  notifyDemoReadOnly()
  return true
}

async function executeSyncJob(job: SyncJob): Promise<void> {
  const p = job.payload
  if (!useCloud()) throw new Error('Sync requires Supabase')

  switch (job.type) {
    case 'dayState': {
      const equipe = String(p.equipe ?? getCurrentEquipe())
      const date =
        (p.date as string) ??
        (() => {
          const now = new Date()
          const tz = { timeZone: 'Europe/Paris' as const }
          const y = now.toLocaleString('fr-FR', { ...tz, year: 'numeric' })
          const m = now.toLocaleString('fr-FR', { ...tz, month: '2-digit' })
          return `${y}-${m}-${String(p.jour).padStart(2, '0')}`
        })()
      await supabaseData.saveDayState(equipe, p.axe_id as number, p.etat as string, date)
      break
    }
    case 'action':
      await supabaseData.saveAction(p as unknown as Action)
      break
    case 'actionDelete':
      await supabaseData.deleteAction(p.id as number)
      break
    case 'comment':
      await supabaseData.addComment(p as unknown as Omit<Comment, 'id'>)
      break
    case 'commentDelete':
      await supabaseData.deleteComment(p.id as number)
      break
    case 'params':
      await supabaseData.saveParams(p as unknown as AppParams)
      break
    case 'dailyReport':
      await supabaseData.saveDailyReport(p as unknown as DailyReportRecord)
      break
    case 'equipe':
      await supabaseData.saveEquipe(String(p.name))
      break
  }
}

export async function processSyncQueue(): Promise<number> {
  if (isDemoMode() || !useCloud()) return 0
  const jobs = readQueue()
  if (jobs.length === 0) return 0

  const remaining: SyncJob[] = []
  let processed = 0
  for (const job of jobs) {
    try {
      await executeSyncJob(job)
      processed++
    } catch (err) {
      const attempts = (job.attempts ?? 0) + 1
      console.error('[SQCDP] Échec sync', job.type, err)
      if (attempts < MAX_JOB_ATTEMPTS) {
        remaining.push({ ...job, attempts })
      } else {
        console.error('[SQCDP] Job abandonné après', MAX_JOB_ATTEMPTS, 'tentatives', job.id)
      }
    }
  }
  writeQueue(remaining)
  window.dispatchEvent(new CustomEvent('sqcdp-sync-change'))
  if (processed > 0) cache.clear()
  return processed
}

export const api = {
  invalidate(...keys: string[]) {
    cache.invalidate(...keys)
  },

  clearCache() {
    cache.clear()
    clearEquipeCache()
  },

  async loadOrganisation(): Promise<Organisation> {
    const cached = cache.get<Organisation>('organisation')
    if (cached) return cached

    if (isDemoMode()) {
      const org = getDemoOrganisation()
      cache.set('organisation', org)
      return org
    }

    if (useCloud()) {
      try {
        const org = await supabaseData.loadOrganisation()
        const merged = mergeOrganisation(org)
        cache.set('organisation', merged)
        return merged
      } catch {
        /* fallback local */
      }
    }

    const merged = mergeOrganisation(null)
    cache.set('organisation', merged)
    return merged
  },

  async saveEquipe(name: string): Promise<EquipeRecord> {
    if (blockDemoWrite()) return { name, site: getSettings().site }
    const site = getSettings().site
    if (useCloud()) {
      try {
        const result = await supabaseData.saveEquipe(name)
        cache.invalidate('organisation')
        return result
      } catch {
        enqueueSync('equipe', { name, site })
      }
    }
    const org = mergeOrganisation(null)
    const next = { site: org.site, equipes: [...org.equipes, { name, site }] }
    saveLocalOrganisation(next)
    cache.invalidate('organisation')
    return { name, site }
  },

  async loadDailyReports(limit = 20): Promise<DailyReportRecord[]> {
    const equipe = getCurrentEquipe()
    const key = `daily_reports_${equipe}`
    const cached = cache.get<DailyReportRecord[]>(key)
    if (cached) return cached

    if (isDemoMode()) {
      const reports = getDemoDailyReports().slice(0, limit)
      cache.set(key, reports)
      return reports
    }

    if (useCloud()) {
      try {
        const reports = await supabaseData.loadDailyReports(equipe, limit)
        cache.set(key, reports)
        return reports
      } catch {
        /* local fallback */
      }
    }

    const local = getLocalDailyReports(equipe).slice(0, limit)
    cache.set(key, local)
    return local
  },

  async saveDailyReport(report: DailyReportRecord): Promise<DailyReportRecord> {
    if (blockDemoWrite()) return report
    const equipe = report.equipe || getCurrentEquipe()
    const payload: DailyReportRecord = {
      ...report,
      equipe,
      site: report.site ?? getSettings().site,
    }

    if (useCloud()) {
      try {
        const result = await supabaseData.saveDailyReport(payload)
        cache.invalidate(`daily_reports_${equipe}`)
        return result
      } catch {
        enqueueSync('dailyReport', payload as unknown as Record<string, unknown>)
      }
    }

    addLocalDailyReport(payload)
    cache.invalidate(`daily_reports_${equipe}`)
    return payload
  },

  async loadAxes(): Promise<Axe[]> {
    const cached = cache.get<Axe[]>('axes')
    if (cached) return cached

    if (isDemoMode()) {
      cache.set('axes', DEFAULT_AXES)
      return DEFAULT_AXES
    }

    if (useCloud()) {
      try {
        const axes = await supabaseData.loadAxes()
        if (axes.length > 0) {
          cache.set('axes', axes)
          return axes
        }
      } catch {
        /* fallback */
      }
    }

    cache.set('axes', DEFAULT_AXES)
    return DEFAULT_AXES
  },

  async loadParams(): Promise<AppParams | null> {
    const cached = cache.get<AppParams>('params')
    if (cached) return cached

    if (isDemoMode()) {
      const params = getDemoParams()
      cache.set('params', params)
      cache.set('colors', params.colors)
      cache.set('labels', params.labels)
      return params
    }

    if (useCloud()) {
      try {
        const params = await supabaseData.loadParams()
        if (params) {
          cache.set('params', params)
          cache.set('colors', params.colors)
          cache.set('labels', params.labels)
          return params
        }
      } catch {
        /* local */
      }
    }

    try {
      const stored = localStorage.getItem('sqcdp_params_local')
      if (stored) {
        const params = JSON.parse(stored) as AppParams
        cache.set('params', params)
        cache.set('colors', params.colors)
        cache.set('labels', params.labels)
        return params
      }
    } catch { /* ignore */ }
    return null
  },

  async loadDayStates(axeId?: number): Promise<DayState[]> {
    const equipe = getCurrentEquipe()
    const key = axeId ? `jour_etats_${axeId}_${equipe}` : `jour_etats_${equipe}`
    const cached = cache.get<DayState[]>(key)
    if (cached) return cached

    if (isDemoMode()) {
      const states = getDemoDayStates(equipe, axeId)
      cache.set(key, states)
      return states
    }

    let remoteStates: DayState[] = []
    if (useCloud()) {
      try {
        remoteStates = await supabaseData.loadDayStates(equipe, axeId)
      } catch {
        remoteStates = []
      }
    }

    const merged = useRemoteAsSource()
      ? remoteStates
      : axeId
        ? mergeDayStates(remoteStates, axeId, equipe)
        : remoteStates

    cache.set(key, merged)
    return merged
  },

  async saveDayState(jour: number, axe_id: number, etat: string, date?: string): Promise<void> {
    if (blockDemoWrite()) return
    const equipe = getCurrentEquipe()
    const site = getSettings().site

    const dateStr =
      date ??
      (() => {
        const now = new Date()
        const p = { timeZone: 'Europe/Paris' as const }
        const y = now.toLocaleString('fr-FR', { ...p, year: 'numeric' })
        const m = now.toLocaleString('fr-FR', { ...p, month: '2-digit' })
        return `${y}-${m}-${String(jour).padStart(2, '0')}`
      })()

    if (useCloud()) {
      try {
        await supabaseData.saveDayState(equipe, axe_id, etat, dateStr)
      } catch {
        enqueueSync('dayState', { jour, axe_id, etat, equipe, site, date: dateStr })
        upsertLocalDayState({ axe_id, date: dateStr, etat: etat as DayState['etat'], equipe })
      }
    } else {
      upsertLocalDayState({ axe_id, date: dateStr, etat: etat as DayState['etat'], equipe })
    }

    cache.invalidate('jour_etats', `jour_etats_${axe_id}`, `jour_etats_${axe_id}_${equipe}`, 'monthlyData')
  },

  async loadActions(): Promise<Action[]> {
    const equipe = getCurrentEquipe()
    const key = `actions_${equipe}`
    const cached = cache.get<Action[]>(key)
    if (cached) return cached

    if (isDemoMode()) {
      const list = getDemoActions(equipe)
      cache.set(key, list)
      return list
    }

    let remoteActions: Action[] = []
    if (useCloud()) {
      try {
        remoteActions = await supabaseData.loadActions(equipe)
      } catch {
        remoteActions = []
      }
    }

    const merged = useRemoteAsSource() ? remoteActions : mergeActions(remoteActions, equipe)
    cache.set(key, merged)
    return merged
  },

  async getAction(id: number): Promise<Action> {
    if (isDemoMode()) {
      const action = getDemoAction(id)
      if (!action) throw new Error('Action introuvable')
      return action
    }
    if (useCloud()) return supabaseData.getAction(id)
    throw new Error('Action introuvable')
  },

  async saveAction(action: Action): Promise<Action> {
    if (blockDemoWrite()) return { ...action, equipe: action.equipe ?? getCurrentEquipe() }
    const equipe = action.equipe ?? getCurrentEquipe()
    const withEquipe: Action = { ...action, equipe }

    if (useCloud()) {
      try {
        const result = await supabaseData.saveAction(withEquipe)
        cache.invalidate('actions', `actions_${equipe}`, 'monthlyData')
        return result
      } catch {
        enqueueSync('action', withEquipe as unknown as Record<string, unknown>)
        if (withEquipe.id) updateLocalAction(withEquipe)
        else addLocalAction(withEquipe)
      }
    } else {
      if (withEquipe.id) updateLocalAction(withEquipe)
      else addLocalAction(withEquipe)
    }

    cache.invalidate('actions', `actions_${equipe}`, 'monthlyData')
    return withEquipe
  },

  async deleteAction(id: number): Promise<void> {
    if (blockDemoWrite()) return
    const equipe = getCurrentEquipe()
    if (useCloud()) {
      try {
        await supabaseData.deleteAction(id)
      } catch {
        enqueueSync('actionDelete', { id })
        removeLocalAction(id)
      }
    } else {
      removeLocalAction(id)
    }
    cache.invalidate('actions', `actions_${equipe}`, 'monthlyData')
  },

  async loadCommentaires(): Promise<Comment[]> {
    const equipe = getCurrentEquipe()
    const key = `commentaires_${equipe}`
    const cached = cache.get<Comment[]>(key)
    if (cached) return cached

    if (isDemoMode()) {
      const list = getDemoComments(equipe)
      cache.set(key, list)
      return list
    }

    let remoteComments: Comment[] = []
    if (useCloud()) {
      try {
        remoteComments = await supabaseData.loadCommentaires(equipe)
      } catch {
        remoteComments = []
      }
    }

    const merged = useRemoteAsSource() ? remoteComments : mergeComments(remoteComments, equipe)
    cache.set(key, merged)
    return merged
  },

  async addComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    if (blockDemoWrite()) return { ...comment, id: 0, equipe: comment.equipe ?? getCurrentEquipe() }
    const equipe = comment.equipe ?? getCurrentEquipe()
    const withEquipe = { ...comment, equipe }

    if (useCloud()) {
      try {
        const result = await supabaseData.addComment(withEquipe)
        cache.invalidate('commentaires', `commentaires_${equipe}`, 'monthlyData')
        return result
      } catch {
        enqueueSync('comment', withEquipe as unknown as Record<string, unknown>)
        const local = { ...withEquipe, id: Date.now() }
        addLocalComment(local)
        cache.invalidate('commentaires', `commentaires_${equipe}`, 'monthlyData')
        return local
      }
    }

    const local = { ...withEquipe, id: Date.now() }
    addLocalComment(local)
    cache.invalidate('commentaires', `commentaires_${equipe}`, 'monthlyData')
    return local
  },

  async deleteComment(id: number): Promise<void> {
    if (blockDemoWrite()) return
    const equipe = getCurrentEquipe()
    if (useCloud()) {
      try {
        await supabaseData.deleteComment(id)
      } catch {
        enqueueSync('commentDelete', { id })
        removeLocalComment(id)
      }
    } else {
      removeLocalComment(id)
    }
    cache.invalidate('commentaires', `commentaires_${equipe}`, 'monthlyData')
  },

  async saveParams(params: AppParams): Promise<void> {
    if (blockDemoWrite()) return
    if (useCloud()) {
      try {
        await supabaseData.saveParams(params)
      } catch {
        enqueueSync('params', params as unknown as Record<string, unknown>)
      }
    }
    localStorage.setItem('sqcdp_params_local', JSON.stringify(params))
    cache.set('params', params)
    cache.set('colors', params.colors)
    cache.set('labels', params.labels)
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

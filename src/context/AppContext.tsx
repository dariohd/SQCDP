import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Axe, Action, Comment, StateColors, StateLabels } from '../types'
import { api, processSyncQueue, wasLastApiSlow, checkApiHealth } from '../lib/api'
import { DEFAULT_COLORS, DEFAULT_LABELS } from '../lib/constants'
import { filterActionsForEquipe } from '../lib/filters'
import { getCurrentMonthYearKey } from '../lib/utils'
import { getCurrentEquipe, setEquipe as saveEquipe } from '../lib/team'
import { isDemoMode, DEMO_MONTH_KEY } from '../lib/demoMode'
import { useToast } from './ToastContext'

interface AppContextValue {
  axes: Axe[]
  colors: StateColors
  labels: StateLabels
  actions: Action[]
  allActions: Action[]
  commentaires: Comment[]
  monthKey: string
  equipe: string
  setMonthKey: (key: string) => void
  setEquipe: (equipe: string) => void
  loading: boolean
  apiSlow: boolean
  apiConnected: boolean
  syncing: boolean
  dataVersion: number
  isReadOnly: boolean
  refresh: () => Promise<void>
  syncPending: () => Promise<void>
  bumpData: () => void
  updateColors: (c: StateColors) => void
  updateLabels: (l: StateLabels) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [axes, setAxes] = useState<Axe[]>([])
  const [colors, setColors] = useState<StateColors>(DEFAULT_COLORS)
  const [labels, setLabels] = useState<StateLabels>(DEFAULT_LABELS)
  const [allActions, setAllActions] = useState<Action[]>([])
  const [commentaires, setCommentaires] = useState<Comment[]>([])
  const [monthKey, setMonthKey] = useState(getCurrentMonthYearKey)
  const [equipe, setEquipeState] = useState(getCurrentEquipe)
  const [loading, setLoading] = useState(true)
  const [apiSlow, setApiSlow] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  const actions = filterActionsForEquipe(allActions, equipe)
  const effectiveMonthKey = isDemoMode() ? DEMO_MONTH_KEY : monthKey

  const bumpData = useCallback(() => setDataVersion((v) => v + 1), [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const healthy = await checkApiHealth()
      setApiConnected(healthy)
      await api.loadOrganisation()
      await api.loadParams()
      const [axesData, actionsData, commentsData] = await Promise.all([
        api.loadAxes(),
        api.loadActions(),
        api.loadCommentaires(),
      ])
      setAxes(axesData)
      setAllActions(actionsData)
      setCommentaires(commentsData)
      setColors(api.getColors() as StateColors)
      setLabels(api.getLabels() as StateLabels)
      setApiSlow(wasLastApiSlow())
    } finally {
      setLoading(false)
    }
  }, [])

  const syncPending = useCallback(async () => {
    if (!navigator.onLine) return
    setSyncing(true)
    try {
      const n = await processSyncQueue()
      if (n > 0) await refresh()
    } finally {
      setSyncing(false)
    }
  }, [refresh])

  const setEquipe = useCallback((eq: string) => {
    saveEquipe(eq)
    setEquipeState(eq)
    api.clearCache()
    bumpData()
  }, [bumpData])

  useEffect(() => {
    refresh().then(() => syncPending())
  }, [refresh, syncPending])

  useEffect(() => {
    const onDemoReady = () => {
      refresh()
      bumpData()
    }
    window.addEventListener('sqcdp-demo-ready', onDemoReady)
    return () => window.removeEventListener('sqcdp-demo-ready', onDemoReady)
  }, [refresh, bumpData])

  useEffect(() => {
    const onEquipe = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail) {
        setEquipeState(detail)
        api.clearCache()
        bumpData()
        refresh()
      }
    }
    window.addEventListener('sqcdp-equipe-change', onEquipe)
    return () => window.removeEventListener('sqcdp-equipe-change', onEquipe)
  }, [refresh, bumpData])

  useEffect(() => {
    const onOnline = () => syncPending()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [syncPending])

  useEffect(() => {
    const onQueued = () => toast.warning('Hors ligne ou erreur cloud — modification mise en file')
    const onFailed = () => toast.error('Synchronisation définitivement échouée — voir la barre de statut')
    const onFallback = () => toast.warning('Lecture cloud échouée — affichage du cache local')
    window.addEventListener('sqcdp-sync-queued', onQueued)
    window.addEventListener('sqcdp-sync-failed', onFailed)
    window.addEventListener('sqcdp-cloud-fallback', onFallback)
    return () => {
      window.removeEventListener('sqcdp-sync-queued', onQueued)
      window.removeEventListener('sqcdp-sync-failed', onFailed)
      window.removeEventListener('sqcdp-cloud-fallback', onFallback)
    }
  }, [toast])

  const updateColors = useCallback((c: StateColors) => {
    setColors(c)
    api.setLocalParams(c, labels)
  }, [labels])

  const updateLabels = useCallback((l: StateLabels) => {
    setLabels(l)
    api.setLocalParams(colors, l)
  }, [colors])

  return (
    <AppContext.Provider
      value={{
        axes,
        colors,
        labels,
        actions,
        allActions,
        commentaires,
        monthKey: effectiveMonthKey,
        equipe,
        setMonthKey,
        setEquipe,
        loading,
        apiSlow,
        apiConnected,
        syncing,
        dataVersion,
        isReadOnly: isDemoMode(),
        refresh,
        syncPending,
        bumpData,
        updateColors,
        updateLabels,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

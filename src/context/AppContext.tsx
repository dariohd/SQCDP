import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Axe, Action, Comment, StateColors, StateLabels } from '../types'
import { api } from '../lib/api'
import { DEFAULT_COLORS, DEFAULT_LABELS } from '../lib/constants'
import { getCurrentMonthYearKey } from '../lib/utils'

interface AppContextValue {
  axes: Axe[]
  colors: StateColors
  labels: StateLabels
  actions: Action[]
  commentaires: Comment[]
  monthKey: string
  setMonthKey: (key: string) => void
  loading: boolean
  dataVersion: number
  refresh: () => Promise<void>
  bumpData: () => void
  updateColors: (c: StateColors) => void
  updateLabels: (l: StateLabels) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [axes, setAxes] = useState<Axe[]>([])
  const [colors, setColors] = useState<StateColors>(DEFAULT_COLORS)
  const [labels, setLabels] = useState<StateLabels>(DEFAULT_LABELS)
  const [actions, setActions] = useState<Action[]>([])
  const [commentaires, setCommentaires] = useState<Comment[]>([])
  const [monthKey, setMonthKey] = useState(getCurrentMonthYearKey)
  const [loading, setLoading] = useState(true)
  const [dataVersion, setDataVersion] = useState(0)

  const bumpData = useCallback(() => setDataVersion((v) => v + 1), [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [axesData, actionsData, commentsData] = await Promise.all([
        api.loadAxes(),
        api.loadActions(),
        api.loadCommentaires(),
      ])
      setAxes(axesData)
      setActions(actionsData)
      setCommentaires(commentsData)
      setColors(api.getColors() as StateColors)
      setLabels(api.getLabels() as StateLabels)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

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
        commentaires,
        monthKey,
        setMonthKey,
        loading,
        dataVersion,
        refresh,
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

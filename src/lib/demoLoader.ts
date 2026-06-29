import type { Axe } from '../types'
import { importFromCSV, type ImportResult } from './csv'
import { api } from './api'

const DEMO_FILES = [
  'demo_01_etats_juin2026.csv',
  'demo_02_actions_commentaires.csv',
  'demo_03_mise_a_jour_etats.csv',
]

export async function loadDemoDataset(axes: Axe[]): Promise<ImportResult> {
  const total: ImportResult = { etats: 0, actions: 0, comments: 0, errors: [] }

  for (const file of DEMO_FILES) {
    const res = await fetch(`/demo-data/${file}`)
    if (!res.ok) throw new Error(`Fichier démo introuvable : ${file}`)
    const blob = await res.blob()
    const result = await importFromCSV(new File([blob], file, { type: 'text/csv' }), axes)
    total.etats += result.etats
    total.actions += result.actions
    total.comments += result.comments
    total.errors.push(...result.errors)
  }

  api.clearCache()
  return total
}

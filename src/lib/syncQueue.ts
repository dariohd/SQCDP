const QUEUE_KEY = 'sqcdp_sync_queue'
const MAX_QUEUE_SIZE = 100
const MAX_JOB_ATTEMPTS = 5

export type SyncJobType =
  | 'dayState'
  | 'action'
  | 'actionDelete'
  | 'comment'
  | 'commentDelete'
  | 'params'
  | 'dailyReport'
  | 'equipe'

export interface SyncJob {
  id: string
  type: SyncJobType
  payload: Record<string, unknown>
  createdAt: string
  attempts?: number
}

function readQueue(): SyncJob[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as SyncJob[]) : []
  } catch {
    return []
  }
}

function writeQueue(jobs: SyncJob[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(jobs.slice(0, MAX_QUEUE_SIZE)))
}

function jobKey(type: SyncJobType, payload: Record<string, unknown>): string {
  return `${type}:${JSON.stringify(payload)}`
}

export function getPendingSyncCount(): number {
  return readQueue().length
}

export function enqueueSync(type: SyncJobType, payload: Record<string, unknown>) {
  const jobs = readQueue()
  const key = jobKey(type, payload)
  if (jobs.some((j) => jobKey(j.type, j.payload) === key)) {
    return jobs.find((j) => jobKey(j.type, j.payload) === key)!.id
  }

  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  jobs.push({ id, type, payload, createdAt: new Date().toISOString(), attempts: 0 })
  if (jobs.length > MAX_QUEUE_SIZE) {
    console.warn('[SQCDP] File de sync pleine — anciens jobs ignorés')
  }
  writeQueue(jobs)
  window.dispatchEvent(new CustomEvent('sqcdp-sync-change'))
  return id
}

export function clearSyncQueue() {
  writeQueue([])
  window.dispatchEvent(new CustomEvent('sqcdp-sync-change'))
}

export { readQueue, writeQueue, MAX_JOB_ATTEMPTS }

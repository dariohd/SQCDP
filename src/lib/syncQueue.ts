const QUEUE_KEY = 'sqcdp_sync_queue'
const FAILED_KEY = 'sqcdp_sync_failed'
const MAX_QUEUE_SIZE = 100
const MAX_FAILED_SIZE = 50
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
  lastError?: string
  failedAt?: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function readQueue(): SyncJob[] {
  return readJson<SyncJob[]>(QUEUE_KEY, [])
}

function writeQueue(jobs: SyncJob[]) {
  // Garder les jobs les plus récents (drop les plus anciens si pleine).
  localStorage.setItem(QUEUE_KEY, JSON.stringify(jobs.slice(-MAX_QUEUE_SIZE)))
}

function readFailed(): SyncJob[] {
  return readJson<SyncJob[]>(FAILED_KEY, [])
}

function writeFailed(jobs: SyncJob[]) {
  localStorage.setItem(FAILED_KEY, JSON.stringify(jobs.slice(-MAX_FAILED_SIZE)))
}

function jobKey(type: SyncJobType, payload: Record<string, unknown>): string {
  return `${type}:${JSON.stringify(payload)}`
}

function emitChange() {
  window.dispatchEvent(new CustomEvent('sqcdp-sync-change'))
}

export function getPendingSyncCount(): number {
  return readQueue().length
}

export function getFailedSyncCount(): number {
  return readFailed().length
}

export function getFailedSyncJobs(): SyncJob[] {
  return readFailed()
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
    console.warn('[SQCDP] File de sync pleine — anciens jobs écartés')
  }
  writeQueue(jobs)
  emitChange()
  window.dispatchEvent(new CustomEvent('sqcdp-sync-queued', { detail: { type } }))
  return id
}

export function markSyncJobFailed(job: SyncJob, error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? 'Erreur inconnue')
  const failed = readFailed().filter((j) => j.id !== job.id)
  failed.push({
    ...job,
    lastError: message,
    failedAt: new Date().toISOString(),
  })
  writeFailed(failed)
  emitChange()
  window.dispatchEvent(
    new CustomEvent('sqcdp-sync-failed', { detail: { id: job.id, type: job.type, message } })
  )
}

export function retryFailedSyncJobs() {
  const failed = readFailed()
  if (failed.length === 0) return 0
  const jobs = readQueue()
  for (const job of failed) {
    jobs.push({ ...job, attempts: 0, lastError: undefined, failedAt: undefined })
  }
  writeQueue(jobs)
  writeFailed([])
  emitChange()
  return failed.length
}

export function clearFailedSyncJobs() {
  writeFailed([])
  emitChange()
}

export function clearSyncQueue() {
  writeQueue([])
  emitChange()
}

export { readQueue, writeQueue, MAX_JOB_ATTEMPTS, MAX_QUEUE_SIZE }

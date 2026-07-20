import { describe, expect, it, beforeEach } from 'vitest'
import {
  clearFailedSyncJobs,
  clearSyncQueue,
  enqueueSync,
  getFailedSyncCount,
  getPendingSyncCount,
  markSyncJobFailed,
  readQueue,
  retryFailedSyncJobs,
  MAX_QUEUE_SIZE,
} from './syncQueue'

describe('syncQueue', () => {
  beforeEach(() => {
    localStorage.clear()
    clearSyncQueue()
    clearFailedSyncJobs()
  })

  it('enqueue and count pending jobs', () => {
    enqueueSync('action', { id: 1 })
    enqueueSync('dayState', { jour: 1, axe_id: 1, etat: 'vert' })
    expect(getPendingSyncCount()).toBe(2)
  })

  it('deduplicates identical jobs', () => {
    enqueueSync('action', { id: 1 })
    enqueueSync('action', { id: 1 })
    expect(getPendingSyncCount()).toBe(1)
  })

  it('drops oldest jobs when queue is full', () => {
    for (let i = 0; i < MAX_QUEUE_SIZE + 5; i++) {
      enqueueSync('action', { id: i })
    }
    expect(getPendingSyncCount()).toBe(MAX_QUEUE_SIZE)
    const jobs = readQueue()
    expect(jobs[0].payload.id).toBe(5)
    expect(jobs[jobs.length - 1].payload.id).toBe(MAX_QUEUE_SIZE + 4)
  })

  it('keeps failed jobs in a DLQ instead of dropping them', () => {
    const id = enqueueSync('comment', { text: 'x' })
    const job = readQueue().find((j) => j.id === id)!
    clearSyncQueue()
    markSyncJobFailed(job, new Error('boom'))
    expect(getFailedSyncCount()).toBe(1)
    expect(getPendingSyncCount()).toBe(0)
    expect(retryFailedSyncJobs()).toBe(1)
    expect(getFailedSyncCount()).toBe(0)
    expect(getPendingSyncCount()).toBe(1)
  })
})

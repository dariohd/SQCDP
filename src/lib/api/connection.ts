import { getSupabase, isSupabaseConfigured } from '../supabase'
import { isDemoMode } from '../demoMode'
import { isDemoStoreReady } from '../demoStore'

let remoteHealthy = false

export function isRemoteHealthy() {
  return remoteHealthy
}

export async function checkRemoteHealth(): Promise<boolean> {
  if (isDemoMode()) {
    remoteHealthy = isDemoStoreReady()
    return remoteHealthy
  }

  if (!isSupabaseConfigured()) {
    remoteHealthy = false
    return false
  }
  try {
    const sb = getSupabase()
    const { data: session } = await sb.auth.getSession()
    if (!session.session) {
      remoteHealthy = false
      return false
    }
    const { error } = await sb.from('axes').select('id').limit(1)
    remoteHealthy = !error
    return remoteHealthy
  } catch {
    remoteHealthy = false
    return false
  }
}

export function useRemoteAsSource() {
  if (isDemoMode()) return isDemoStoreReady()
  return isSupabaseConfigured() && remoteHealthy
}

export const checkApiHealth = checkRemoteHealth

export function setPreferRemoteData(_value: boolean) {
  /* géré automatiquement */
}

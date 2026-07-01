import { getSupabase } from './supabase'
import { getSettings } from './team'

/** Assure l'accès au site courant (RPC Supabase). */
export async function ensureSiteMembership(): Promise<void> {
  const siteName = getSettings().site
  if (!siteName) return

  const sb = getSupabase()
  const { error } = await sb.rpc('ensure_site_membership', { p_site_name: siteName })
  if (error) {
    console.warn('[SQCDP] ensure_site_membership:', error.message)
  }
}

import { getSupabase } from './supabase'
import { getSettings } from './team'

export type MembershipResult =
  | { ok: true; siteId: string | null }
  | { ok: false; message: string }

/** Assure l'accès au site courant (RPC Supabase). */
export async function ensureSiteMembership(): Promise<MembershipResult> {
  const siteName = getSettings().site
  if (!siteName) return { ok: true, siteId: null }

  const sb = getSupabase()
  const { data, error } = await sb.rpc('ensure_site_membership', { p_site_name: siteName })
  if (error) {
    console.warn('[SQCDP] ensure_site_membership:', error.message)
    return {
      ok: false,
      message:
        "Impossible de rejoindre ce site. Demandez à un administrateur de vous inviter, ou vérifiez le nom du site.",
    }
  }
  if (data == null) {
    // Site absent : sera créé au premier enregistrement. Site peuplé sans invite : vrai refus.
    const { data: site } = await sb.from('sites').select('id').eq('name', siteName).maybeSingle()
    if (!site) {
      return { ok: true, siteId: null }
    }
    return {
      ok: false,
      message:
        "Ce site existe déjà et vous n'y êtes pas membre. Un administrateur doit vous inviter (Paramètres > Membres).",
    }
  }
  return { ok: true, siteId: String(data) }
}

export async function getMySiteRole(siteName = getSettings().site): Promise<'admin' | 'member' | null> {
  if (!siteName) return null
  const sb = getSupabase()
  const { data, error } = await sb.rpc('get_my_site_role', { p_site_name: siteName })
  if (error) return null
  if (data === 'admin' || data === 'member') return data
  return null
}

export type SiteMemberRow = { email: string; role: string; user_id: string }

export async function listSiteMembers(siteName = getSettings().site): Promise<SiteMemberRow[]> {
  if (!siteName) return []
  const sb = getSupabase()
  const { data, error } = await sb.rpc('list_site_members', { p_site_name: siteName })
  if (error) throw error
  return (data ?? []) as SiteMemberRow[]
}

export async function inviteSiteMember(
  email: string,
  role: 'admin' | 'member' = 'member',
  siteName = getSettings().site
): Promise<void> {
  if (!siteName) throw new Error('Site non défini')
  const sb = getSupabase()
  const { error } = await sb.rpc('invite_site_member', {
    p_site_name: siteName,
    p_email: email.trim(),
    p_role: role,
  })
  if (error) throw error
}

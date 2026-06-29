import type {
  Action,
  Axe,
  Comment,
  DayState,
  AppParams,
  DailyReportRecord,
  EquipeRecord,
  Organisation,
  SiteRecord,
} from '../../types'
import { DEFAULT_COLORS, DEFAULT_LABELS } from '../constants'
import { getSupabase } from '../supabase'
import { getCurrentEquipe, getSettings } from '../team'

const equipeIdCache = new Map<string, string>()

function equipeNameFromJoin(raw: unknown, fallback: string): string {
  if (!raw) return fallback
  if (Array.isArray(raw)) return (raw[0] as { name?: string })?.name ?? fallback
  return (raw as { name?: string }).name ?? fallback
}

function cacheKey(site: string, equipe: string) {
  return `${site}:${equipe}`
}

export function clearEquipeCache() {
  equipeIdCache.clear()
}

async function ensureSite(name: string): Promise<string> {
  const sb = getSupabase()
  const { data: existing } = await sb.from('sites').select('id').eq('name', name).maybeSingle()
  if (existing?.id) return existing.id

  const { data, error } = await sb.from('sites').insert({ name }).select('id').single()
  if (error) throw error
  return data.id
}

export async function resolveEquipeId(equipeName: string, siteName: string): Promise<string> {
  const key = cacheKey(siteName, equipeName)
  const cached = equipeIdCache.get(key)
  if (cached) return cached

  const siteId = await ensureSite(siteName)
  const sb = getSupabase()

  const { data: existing } = await sb
    .from('equipes')
    .select('id')
    .eq('site_id', siteId)
    .eq('name', equipeName)
    .maybeSingle()

  if (existing?.id) {
    equipeIdCache.set(key, existing.id)
    return existing.id
  }

  const { data, error } = await sb
    .from('equipes')
    .insert({ site_id: siteId, name: equipeName })
    .select('id')
    .single()

  if (error) throw error
  equipeIdCache.set(key, data.id)
  return data.id
}

async function ensureDefaultEquipes(siteName: string) {
  for (const name of ['Ligne 1', 'Ligne 2', 'Ligne 3']) {
    await resolveEquipeId(name, siteName)
  }
}

function mapAction(row: Record<string, unknown>): Action {
  const eq = row.equipes
  const equipeName = equipeNameFromJoin(eq, '')
  return {
    id: row.id as number,
    axe_id: row.axe_id as number,
    probleme: row.probleme as string,
    titre: (row.titre as string) ?? undefined,
    categorie: (row.categorie as string) ?? undefined,
    criticite: (row.criticite as string) ?? undefined,
    cause: (row.cause as string) ?? undefined,
    auteur: (row.auteur as string) ?? undefined,
    porteur: row.porteur as string,
    solution: (row.solution as string) ?? undefined,
    echeance: row.echeance ? String(row.echeance).slice(0, 10) : null,
    created_at: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
    statut: row.statut as Action['statut'],
    code: (row.code as string) ?? undefined,
    equipe: equipeName || undefined,
    pdca_plan: (row.pdca_plan as string) ?? undefined,
    pdca_do: (row.pdca_do as string) ?? undefined,
    pdca_check: (row.pdca_check as string) ?? undefined,
    pdca_act: (row.pdca_act as string) ?? undefined,
    d1_equipe: (row.d1_equipe as string) ?? undefined,
    d2_probleme: (row.d2_probleme as string) ?? undefined,
    d3_containment: (row.d3_containment as string) ?? undefined,
    d4_cause_racine: (row.d4_cause_racine as string) ?? undefined,
    d5_actions_correctives: (row.d5_actions_correctives as string) ?? undefined,
    d6_validation: (row.d6_validation as string) ?? undefined,
    d7_prevention: (row.d7_prevention as string) ?? undefined,
    d8_cloture: (row.d8_cloture as string) ?? undefined,
  }
}

function actionToRow(action: Action, equipeId: string) {
  return {
    axe_id: action.axe_id,
    equipe_id: equipeId,
    probleme: action.probleme,
    titre: action.titre ?? null,
    categorie: action.categorie ?? null,
    criticite: action.criticite ?? null,
    cause: action.cause ?? null,
    auteur: action.auteur ?? null,
    porteur: action.porteur,
    solution: action.solution ?? null,
    echeance: action.echeance || null,
    created_at: action.created_at ?? new Date().toISOString().slice(0, 10),
    statut: action.statut ?? 'ouverte',
    code: action.code ?? null,
    pdca_plan: action.pdca_plan ?? null,
    pdca_do: action.pdca_do ?? null,
    pdca_check: action.pdca_check ?? null,
    pdca_act: action.pdca_act ?? null,
    d1_equipe: action.d1_equipe ?? null,
    d2_probleme: action.d2_probleme ?? null,
    d3_containment: action.d3_containment ?? null,
    d4_cause_racine: action.d4_cause_racine ?? null,
    d5_actions_correctives: action.d5_actions_correctives ?? null,
    d6_validation: action.d6_validation ?? null,
    d7_prevention: action.d7_prevention ?? null,
    d8_cloture: action.d8_cloture ?? null,
  }
}

export const supabaseData = {
  async loadOrganisation(): Promise<Organisation> {
    const site = getSettings().site
    await ensureDefaultEquipes(site)
    const sb = getSupabase()

    const { data: sites } = await sb.from('sites').select('id, name').order('name')
    const siteName = sites?.[0]?.name ?? site
    const siteId = sites?.[0]?.id ?? (await ensureSite(site))

    const { data: equipes } = await sb
      .from('equipes')
      .select('id, name, active, sites(name)')
      .eq('site_id', siteId)
      .eq('active', true)
      .order('name')

    return {
      site: siteName,
      equipes: (equipes ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        active: e.active,
        site: equipeNameFromJoin(e.sites, siteName),
      })),
    }
  },

  async saveEquipe(name: string): Promise<EquipeRecord> {
    const site = getSettings().site
    const id = await resolveEquipeId(name, site)
    return { id, name, site }
  },

  async loadAxes(): Promise<Axe[]> {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('axes')
      .select('id, key, label')
      .order('sort_order')
      .order('id')

    if (error) throw error
    return (data ?? []).filter((a) => a.key !== 'DCP') as Axe[]
  },

  async loadParams(): Promise<AppParams | null> {
    const site = getSettings().site
    const siteId = await ensureSite(site)
    const sb = getSupabase()

    const { data: axes } = await sb.from('axes').select('key, label').order('sort_order')
    const { data: params } = await sb
      .from('app_params')
      .select('colors, labels')
      .eq('site_id', siteId)
      .maybeSingle()

    if (params?.colors && params?.labels) {
      return {
        axes: axes ?? [],
        colors: params.colors as AppParams['colors'],
        labels: params.labels as AppParams['labels'],
      }
    }

    return {
      axes: axes ?? [],
      colors: DEFAULT_COLORS,
      labels: DEFAULT_LABELS,
    }
  },

  async saveParams(params: AppParams): Promise<void> {
    const site = getSettings().site
    const siteId = await ensureSite(site)
    const sb = getSupabase()

    const { error } = await sb.from('app_params').upsert(
      {
        site_id: siteId,
        colors: params.colors,
        labels: params.labels,
        axes_labels: params.axes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'site_id' },
    )
    if (error) throw error
  },

  async loadDayStates(equipeName: string, axeId?: number): Promise<DayState[]> {
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    let query = sb
      .from('jour_etats')
      .select('axe_id, date, etat, equipes(name)')
      .eq('equipe_id', equipeId)
      .order('date')

    if (axeId != null) query = query.eq('axe_id', axeId)

    const { data, error } = await query
    if (error) throw error

    return (data ?? []).map((row) => ({
      axe_id: row.axe_id,
      date: String(row.date).slice(0, 10),
      etat: row.etat as DayState['etat'],
      equipe: equipeNameFromJoin(row.equipes, equipeName),
    }))
  },

  async saveDayState(
    equipeName: string,
    axe_id: number,
    etat: string,
    date: string,
  ): Promise<void> {
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { error } = await sb.from('jour_etats').upsert(
      {
        axe_id,
        equipe_id: equipeId,
        date,
        etat,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'axe_id,equipe_id,date' },
    )
    if (error) throw error
  },

  async loadActions(equipeName: string): Promise<Action[]> {
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { data, error } = await sb
      .from('actions')
      .select('*, equipes(name)')
      .eq('equipe_id', equipeId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

    if (error) throw error
    return (data ?? []).map((row) => mapAction(row as Record<string, unknown>))
  },

  async getAction(id: number): Promise<Action> {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('actions')
      .select('*, equipes(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapAction(data as Record<string, unknown>)
  },

  async saveAction(action: Action): Promise<Action> {
    const equipeName = action.equipe ?? getCurrentEquipe()
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()
    const row = actionToRow(action, equipeId)

    if (action.id) {
      const { data, error } = await sb
        .from('actions')
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq('id', action.id)
        .select('*, equipes(name)')
        .single()
      if (error) throw error
      return mapAction(data as Record<string, unknown>)
    }

    const { data, error } = await sb
      .from('actions')
      .insert(row)
      .select('*, equipes(name)')
      .single()

    if (error) throw error
    return mapAction(data as Record<string, unknown>)
  },

  async deleteAction(id: number): Promise<void> {
    const sb = getSupabase()
    const { error } = await sb.from('actions').delete().eq('id', id)
    if (error) throw error
  },

  async loadCommentaires(equipeName: string): Promise<Comment[]> {
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { data, error } = await sb
      .from('commentaires')
      .select('id, axe_id, date, content, equipes(name)')
      .eq('equipe_id', equipeId)
      .order('date', { ascending: false })

    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      axe_id: row.axe_id,
      date: String(row.date).slice(0, 10),
      content: row.content,
      equipe: equipeNameFromJoin(row.equipes, equipeName),
    }))
  },

  async addComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    const equipeName = comment.equipe ?? getCurrentEquipe()
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { data, error } = await sb
      .from('commentaires')
      .insert({
        axe_id: comment.axe_id,
        equipe_id: equipeId,
        date: comment.date,
        content: comment.content,
      })
      .select('id, axe_id, date, content')
      .single()

    if (error) throw error
    return { ...data, date: String(data.date).slice(0, 10), equipe: equipeName }
  },

  async deleteComment(id: number): Promise<void> {
    const sb = getSupabase()
    const { error } = await sb.from('commentaires').delete().eq('id', id)
    if (error) throw error
  },

  async loadDailyReports(equipeName: string, limit = 20): Promise<DailyReportRecord[]> {
    const site = getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { data, error } = await sb
      .from('daily_reports')
      .select('id, date, timer_sec, roulette, checklist, today_states, summary_text, created_at')
      .eq('equipe_id', equipeId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data ?? []).map((r) => ({
      id: r.id,
      date: String(r.date).slice(0, 10),
      equipe: equipeName,
      site,
      timer_sec: r.timer_sec,
      roulette: r.roulette as DailyReportRecord['roulette'],
      checklist: r.checklist as DailyReportRecord['checklist'],
      today_states: r.today_states as DailyReportRecord['today_states'],
      summary_text: r.summary_text,
      created_at: r.created_at,
    }))
  },

  async saveDailyReport(report: DailyReportRecord): Promise<DailyReportRecord> {
    const equipeName = report.equipe || getCurrentEquipe()
    const site = report.site ?? getSettings().site
    const equipeId = await resolveEquipeId(equipeName, site)
    const sb = getSupabase()

    const { data: userData } = await sb.auth.getUser()

    const { data, error } = await sb
      .from('daily_reports')
      .upsert(
        {
          equipe_id: equipeId,
          date: report.date,
          timer_sec: report.timer_sec ?? 0,
          roulette: report.roulette ?? null,
          checklist: report.checklist ?? null,
          today_states: report.today_states ?? null,
          summary_text: report.summary_text,
          created_by: userData.user?.id ?? null,
        },
        { onConflict: 'equipe_id,date' },
      )
      .select('id, date, timer_sec, roulette, checklist, today_states, summary_text, created_at')
      .single()

    if (error) throw error

    return {
      id: data.id,
      date: String(data.date).slice(0, 10),
      equipe: equipeName,
      site,
      timer_sec: data.timer_sec,
      roulette: data.roulette as DailyReportRecord['roulette'],
      checklist: data.checklist as DailyReportRecord['checklist'],
      today_states: data.today_states as DailyReportRecord['today_states'],
      summary_text: data.summary_text,
      created_at: data.created_at,
    }
  },

  async loadSites(): Promise<SiteRecord[]> {
    const sb = getSupabase()
    const { data, error } = await sb.from('sites').select('id, name').order('name')
    if (error) throw error
    return data ?? []
  },
}

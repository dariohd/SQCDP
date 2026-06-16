export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  equipe: string
}

const KEY = 'sqcdp_audit_log'
const MAX = 500

export function logAudit(action: string, details: string, user = 'Anonyme', equipe = getEquipeFromSettings()) {
  const entries = getAuditLog()
  entries.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
    equipe,
  })
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)))
}

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function getEquipeFromSettings(): string {
  try {
    const s = JSON.parse(localStorage.getItem('sqcdp_settings') ?? '{}')
    return s.equipe ?? 'Défaut'
  } catch {
    return 'Défaut'
  }
}

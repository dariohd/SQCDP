import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { ensureSiteMembership } from '../lib/membership'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  membershipError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [membershipError, setMembershipError] = useState<string | null>(null)
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    const supabase = getSupabase()
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        const result = await ensureSiteMembership()
        setMembershipError(result.ok ? null : result.message)
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        const result = await ensureSiteMembership()
        setMembershipError(result.ok ? null : result.message)
      } else {
        setMembershipError(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [isConfigured])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password })
      if (!error) {
        const result = await ensureSiteMembership()
        setMembershipError(result.ok ? null : result.message)
      }
      return { error: error?.message ?? null }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erreur de connexion' }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const redirectTo = `${window.location.origin}/login`
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo })
      return { error: error?.message ?? null }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erreur de réinitialisation' }
    }
  }

  const signOut = async () => {
    await getSupabase().auth.signOut()
    setMembershipError(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, membershipError, signIn, resetPassword, signOut, isConfigured }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

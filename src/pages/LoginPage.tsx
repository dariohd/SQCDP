import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { APP_ROUTES, ROUTES } from '../lib/routes'

export function LoginPage() {
  const { signIn, resetPassword, isConfigured, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (user) navigate(APP_ROUTES.home, { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) setError(err)
    else navigate(APP_ROUTES.home, { replace: true })
    setLoading(false)
  }

  const handleReset = async () => {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Saisissez votre email pour réinitialiser le mot de passe.')
      return
    }
    setResetting(true)
    const { error: err } = await resetPassword(email)
    if (err) setError(err)
    else setInfo('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.')
    setResetting(false)
  }

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-primary">Configuration requise</h2>
          <p className="mt-3 text-sm text-slate-600">
            Créez un fichier <code className="rounded bg-slate-100 px-1">.env</code> avec :
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-green-400">
{`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon`}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="bg-gradient-to-r from-primary to-primary-hover px-8 py-10 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold backdrop-blur-sm"
          >
            S
          </motion.div>
          <h1 className="text-2xl font-bold">SQCDP</h1>
          <p className="mt-1 text-white/80">Tableau de bord de performance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-600">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
          {info && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              {info}
            </p>
          )}

          <Button type="submit" className="w-full !py-3" loading={loading}>
            Se connecter
          </Button>

          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={resetting}
            className="w-full text-center text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {resetting ? 'Envoi…' : 'Mot de passe oublié ?'}
          </button>
        </form>

        <p className="border-t border-slate-100 px-8 py-4 text-center text-xs text-slate-500">
          <Link to={ROUTES.landing} className="text-primary hover:underline">
            ← Retour au site
          </Link>
          {' · '}
          <Link to={ROUTES.legal} className="text-primary hover:underline">
            Mentions légales
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

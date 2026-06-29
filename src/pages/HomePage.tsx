import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  Sun,
  LayoutDashboard,
  TrendingUp,
  Upload,
  BookOpen,
  Play,
  Sparkles,
} from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { computeKPIs } from '../lib/analytics'
import { loadDemoDataset } from '../lib/demoLoader'
import { APP_ROUTES, DEMO_ROUTES } from '../lib/routes'
import { useNotifications } from '../hooks/useNotifications'

function usePageRoutes() {
  const loc = useLocation()
  return loc.pathname.startsWith(DEMO_ROUTES.home) ? DEMO_ROUTES : APP_ROUTES
}

export function HomePage() {
  const pageRoutes = usePageRoutes()
  const { axes, actions, equipe, refresh, bumpData, isReadOnly } = useApp()
  const toast = useToast()
  const { notifications } = useNotifications()
  const kpis = computeKPIs(actions)
  const [loadingDemo, setLoadingDemo] = useState(false)

  const cards = [
    {
      to: pageRoutes.daily,
      icon: Sun,
      title: 'Lancer la daily',
      desc: 'Réunion guidée en 6 étapes — rôles, saisie, alertes, clôture',
      color: 'from-amber-500 to-orange-600',
      primary: true,
    },
    {
      to: pageRoutes.mois,
      icon: LayoutDashboard,
      title: 'Tableau mensuel',
      desc: 'Les 5 donuts SQCDP, actions et commentaires du mois',
      color: 'from-primary to-blue-700',
    },
    {
      to: pageRoutes.direction,
      icon: TrendingUp,
      title: 'Vue direction',
      desc: 'Radar, tendances et KPIs pour le management',
      color: 'from-violet-600 to-purple-800',
    },
    {
      to: pageRoutes.aide,
      icon: BookOpen,
      title: 'Guide utilisateur',
      desc: 'Prise en main, raccourcis et bonnes pratiques',
      color: 'from-slate-600 to-slate-800',
    },
  ]

  async function handleDemo() {
    setLoadingDemo(true)
    try {
      const result = await loadDemoDataset(axes)
      await refresh()
      bumpData()
      toast.success(
        `Démo chargée : ${result.etats} états, ${result.actions} actions, ${result.comments} commentaires`,
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur chargement démo')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <AppLayout notifCount={notifications.length}>
      <main className="mx-auto max-w-[1200px] px-4 py-10">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-4xl font-bold text-white shadow-xl shadow-primary/30">
            S
          </div>
          <h1 className="text-4xl font-bold text-primary md:text-5xl">SQCDP</h1>
          <p className="mt-3 text-lg text-slate-500">
            {isReadOnly ? (
              <>Démo <strong>Usine Dupont</strong> — juin 2026 · équipe {equipe}</>
            ) : (
              <>Pilotez Sécurité, Qualité, Coût, Délai et Personnel — équipe <strong>{equipe}</strong></>
            )}
          </p>
        </motion.div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Actions ouvertes', value: kpis.openActions },
            { label: 'En retard', value: kpis.lateActions, warn: true },
            { label: 'Taux clôture', value: `${kpis.closureRate}%` },
            { label: 'Alertes', value: notifications.length },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-4 text-center shadow-md">
              <div className={`text-2xl font-bold ${k.warn ? 'text-delete' : 'text-primary'}`}>
                {k.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={c.to}
                className={`group flex min-h-[160px] flex-col rounded-2xl bg-gradient-to-br ${c.color} p-6 text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl`}
              >
                <c.icon size={32} className="mb-3 opacity-90" />
                <h2 className="text-xl font-bold">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm text-white/85">{c.desc}</p>
                {c.primary && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                    <Play size={16} /> Commencer
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {!isReadOnly && (
          <motion.div
            className="mt-10 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles className="mx-auto mb-3 text-primary" size={28} />
            <h3 className="text-lg font-bold text-primary">Essayer avec des données fictives</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Charge un jeu de démo « Usine Dupont » (juin 2026) dans votre espace connecté.
            </p>
            <Button className="mt-5" onClick={handleDemo} loading={loadingDemo} variant="secondary">
              <Upload size={16} />
              Charger la démo usine
            </Button>
          </motion.div>
        )}

        {isReadOnly && (
          <motion.p
            className="mt-10 text-center text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Consultation seule —{' '}
            <Link to={pageRoutes.mois} className="font-semibold text-primary hover:underline">
              ouvrir le tableau mensuel
            </Link>
          </motion.p>
        )}
      </main>
    </AppLayout>
  )
}

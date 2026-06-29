import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  LayoutDashboard,
  Mail,
  Shield,
  Sun,
  Target,
  Zap,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ROUTES, DEMO_ROUTES } from '../lib/routes'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Tableau SQCDP visuel',
    desc: '5 donuts interactifs — Sécurité, Qualité, Coût, Délai, Personnel. Un coup d’œil sur le mois.',
  },
  {
    icon: Sun,
    title: 'Daily guidée',
    desc: 'Réunion en 6 étapes : checklist, roulette des rôles, saisie, alertes, actions, compte-rendu PDF.',
  },
  {
    icon: Target,
    title: 'Actions PDCA & 8D',
    desc: 'Suivi des actions correctives, échéances, porteurs et clôture — directement liées aux axes.',
  },
  {
    icon: BarChart3,
    title: 'Vue direction',
    desc: 'Radar, tendances 6 mois et KPIs pour le management et les revues de performance.',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    desc: 'Authentification, base cloud partagée entre postes, mode hors ligne avec synchronisation.',
  },
  {
    icon: Zap,
    title: 'Prêt en usine',
    desc: 'PWA installable sur tablette ou PC atelier. Import/export CSV, paramétrage par équipe.',
  },
]

const steps = [
  'Chaque jour, l’équipe renseigne l’état des 5 axes',
  'La daily structure la réunion et attribue les rôles',
  'Les actions sont suivies jusqu’à clôture',
  'La direction pilote avec des indicateurs consolidés',
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-primary/5">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to={ROUTES.landing} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white">
              S
            </div>
            <span className="text-lg font-bold text-primary">SQCDP</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={ROUTES.legal} className="hidden text-sm text-slate-500 hover:text-primary sm:inline">
              Mentions légales
            </Link>
            <Link to={ROUTES.login}>
              <Button variant="primary" className="!text-sm">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary/80">
              Performance industrielle
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
              Pilotez votre usine avec{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                SQCDP
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              L’outil visuel pour vos réunions quotidiennes, le suivi Sécurité–Qualité–Coût–Délai–Personnel
              et le pilotage management — accessible depuis n’importe quel poste.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to={DEMO_ROUTES.mois}>
                <Button className="gap-2 !px-8 !py-3 text-base">
                  <Eye size={18} />
                  Essayer la démo interactive
                </Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button variant="secondary" className="gap-2 !px-8 !py-3 text-base">
                  Accéder à l’application
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="mailto:bulletonsite@gmail.com?subject=Démo%20SQCDP">
                <Button variant="ghost" className="gap-2 !px-8 !py-3 text-base">
                  <Mail size={18} />
                  Demander une démo
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-primary/10 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {[
                { k: 'S', label: 'Sécurité', c: 'from-emerald-400 to-emerald-600' },
                { k: 'Q', label: 'Qualité', c: 'from-blue-400 to-blue-600' },
                { k: 'C', label: 'Coût', c: 'from-amber-400 to-amber-600' },
                { k: 'D', label: 'Délai', c: 'from-violet-400 to-violet-600' },
                { k: 'P', label: 'Personnel', c: 'from-rose-400 to-rose-600' },
              ].map((axe) => (
                <div key={axe.k} className="text-center">
                  <div
                    className={`mx-auto mb-2 flex aspect-square max-w-[88px] items-center justify-center rounded-full bg-gradient-to-br ${axe.c} text-2xl font-bold text-white shadow-lg md:max-w-[110px] md:text-3xl`}
                  >
                    {axe.k}
                  </div>
                  <p className="text-xs font-medium text-slate-600 md:text-sm">{axe.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Aperçu visuel — connectez-vous pour accéder au tableau interactif complet
            </p>
          </motion.div>
        </section>

        <section className="border-y border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold text-slate-900">
              Tout ce dont une équipe usine a besoin
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
              Conçu pour les daily meets, les animateurs et la direction.
            </p>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <f.icon className="mb-4 text-primary" size={28} />
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Comment ça marche ?</h2>
                <ul className="mt-8 space-y-4">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-state-ok" size={20} />
                      <span className="text-slate-600">
                        <strong className="text-slate-800">{i + 1}.</strong> {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-primary to-blue-800 p-8 text-white shadow-xl">
                <h3 className="text-xl font-bold">Pour qui ?</h3>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  <li>• Équipes production &amp; amélioration continue</li>
                  <li>• Animateurs de daily SQCDP / OPS</li>
                  <li>• Managers et direction industrielles</li>
                  <li>• Consultants Lean &amp; déploiement 5S / PDCA</li>
                </ul>
            <Link to={DEMO_ROUTES.mois}>
              <Button variant="secondary" className="w-full justify-center">
                Essayer la démo
              </Button>
            </Link>
            <Link to={ROUTES.login} className="mt-3 block">
              <Button variant="ghost" className="w-full justify-center">
                Se connecter
              </Button>
            </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-primary/5 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold text-primary">Intéressé par SQCDP ?</h2>
            <p className="mt-4 text-slate-600">
              Demandez une démonstration personnalisée ou un devis pour votre site.
              L’application est déployée en cloud — vos équipes y accèdent depuis n’importe quel PC.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="mailto:bulletonsite@gmail.com?subject=Devis%20SQCDP">
                <Button variant="primary" className="gap-2 !px-8 !py-3">
                  <Mail size={18} />
                  Demander un devis
                </Button>
              </a>
              <Link to={ROUTES.login}>
                <Button variant="ghost" className="!px-8 !py-3">
                  J’ai déjà un compte
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <Link to={ROUTES.legal} className="hover:text-primary hover:underline">
          Mentions légales &amp; confidentialité
        </Link>
        <p className="mt-2">© {new Date().getFullYear()} SQCDP</p>
      </footer>
    </div>
  )
}

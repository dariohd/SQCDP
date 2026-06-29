import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { APP_ROUTES, DEMO_ROUTES } from '../lib/routes'
import {
  Sun,
  LayoutDashboard,
  Keyboard,
  Upload,
  Wifi,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/ui/Button'

const sections = [
  {
    title: 'Démarrer une daily',
    icon: Sun,
    steps: [
      'Depuis l’accueil, cliquez sur « Lancer la daily » ou appuyez sur D.',
      'Suivez les 6 étapes : checklist, roulette des rôles, saisie des états, revue, actions, clôture.',
      'À la clôture, un compte-rendu PDF est téléchargé et enregistré (si l’API est connectée).',
    ],
  },
  {
    title: 'Tableau mensuel',
    icon: LayoutDashboard,
    steps: [
      'Chaque donut représente un axe SQCDP (Sécurité, Qualité, Coût, Délai, Personnel).',
      'Cliquez sur un jour pour saisir l’état, ajouter un commentaire ou une action.',
      'Utilisez la saisie groupée (B) pour remplir plusieurs jours d’un coup.',
    ],
  },
  {
    title: 'Raccourcis clavier',
    icon: Keyboard,
    items: [
      ['D', 'Ouvrir le mode Daily'],
      ['R', 'Roulette (sur tableau mensuel)'],
      ['I', 'Importer CSV'],
      ['S', 'Exporter CSV'],
      ['B', 'Saisie groupée'],
      ['N', 'Nouvelle action'],
    ],
  },
  {
    title: 'Import / export',
    icon: Upload,
    steps: [
      'Export CSV : sauvegarde complète (états, actions, commentaires, PDCA).',
      'Import CSV : format Type;Axe;Date;Champ1… (voir fichiers demo-data/).',
      'Bouton « Charger la démo usine » sur l’accueil pour un jeu de données fictif.',
    ],
  },
  {
    title: 'Hors ligne & synchronisation',
    icon: Wifi,
    steps: [
      'L’application fonctionne en PWA : les modifications sont stockées localement.',
      'Si l’API est configurée, une file d’attente synchronise au retour du réseau.',
      'La barre en haut indique l’état de connexion et les éléments en attente.',
    ],
  },
]

export function HelpPage() {
  const loc = useLocation()
  const routes = loc.pathname.startsWith(DEMO_ROUTES.home) ? DEMO_ROUTES : APP_ROUTES

  return (
    <AppLayout>
      <main className="mx-auto max-w-[900px] px-4 py-10">
        <Link to={routes.home} className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Retour à l’accueil
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <HelpCircle className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-primary">Guide utilisateur</h1>
          </div>
          <p className="mt-2 text-slate-500">
            Prise en main de SQCDP — réunions daily, pilotage et vue direction.
          </p>
        </motion.div>

        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <motion.section
              key={s.title}
              className="rounded-2xl bg-white p-6 shadow-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <s.icon className="text-primary" size={22} />
                <h2 className="text-lg font-semibold text-primary">{s.title}</h2>
              </div>
              {'items' in s && s.items ? (
                <table className="w-full text-sm">
                  <tbody>
                    {s.items.map(([key, desc]) => (
                      <tr key={key} className="border-b border-slate-50">
                        <td className="py-2 pr-4">
                          <kbd className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold">
                            {key}
                          </kbd>
                        </td>
                        <td className="py-2 text-slate-600">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  {s.steps?.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </motion.section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm text-slate-600">
            Documentation technique (BDD, API, déploiement) :{' '}
            <code className="rounded bg-white px-2 py-0.5 text-xs">docs/INSTALLATION-BDD.md</code>
          </p>
          <Link to={routes.daily}>
            <Button className="mt-4" variant="primary">
              <Sun size={16} /> Lancer une daily
            </Button>
          </Link>
        </div>
      </main>
    </AppLayout>
  )
}

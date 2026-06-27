import { Link } from 'react-router-dom'

const AGENCY = {
  name: 'Bulle ton site',
  contact: 'Hugo DAVION',
  email: 'bulletonsite@gmail.com',
  url: 'https://bulletonsite.com',
}

export function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl shadow-primary/5 md:p-12">
        <Link
          to="/login"
          className="mb-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">Mentions légales &amp; confidentialité</h1>
        <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : juin 2026</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">1. Éditeur de l'application</h2>
          <p>
            <strong>SQCDP</strong> — application de suivi de performance (Sécurité, Qualité, Coût, Délai, Personnel)
            <br />
            Édité par {AGENCY.name} — {AGENCY.contact}
            <br />
            <a className="text-primary hover:underline" href={`mailto:${AGENCY.email}`}>
              {AGENCY.email}
            </a>
            {' · '}
            <a className="text-primary hover:underline" href={AGENCY.url} target="_blank" rel="noopener noreferrer">
              bulletonsite.com
            </a>
          </p>
          <p>
            Lors d'un déploiement pour un client professionnel, l'éditeur peut être précisé dans le contrat de
            prestation. Les données métier saisies dans l'application appartiennent à l'organisation utilisatrice.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">2. Hébergement &amp; sous-traitants</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Vercel Inc.</strong> — hébergement de l'application web (
              <a className="text-primary hover:underline" href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                vercel.com
              </a>
              )
            </li>
            <li>
              <strong>Supabase Inc.</strong> — authentification et base de données (si configuré), conforme RGPD (
              <a
                className="text-primary hover:underline"
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                politique de confidentialité
              </a>
              )
            </li>
            <li>
              <strong>Render</strong> — API backend optionnelle (
              <a className="text-primary hover:underline" href="https://render.com" target="_blank" rel="noopener noreferrer">
                render.com
              </a>
              )
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">3. Données personnelles (RGPD)</h2>
          <p>Données susceptibles d'être traitées :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Identifiants de connexion (email, mot de passe hashé via Supabase Auth)</li>
            <li>Données métier saisies dans les tableaux SQCDP (indicateurs, actions, commentaires)</li>
            <li>Données techniques de connexion (logs hébergeur, adresse IP)</li>
          </ul>
          <p>
            <strong>Finalité :</strong> fourniture du service de pilotage SQCDP aux équipes autorisées.
          </p>
          <p>
            <strong>Base légale :</strong> exécution du contrat et intérêt légitime de l'employeur ou du responsable de
            traitement client.
          </p>
          <p>
            <strong>Vos droits :</strong> accès, rectification, effacement, limitation — contactez l'administrateur de
            votre organisation ou{' '}
            <a className="text-primary hover:underline" href={`mailto:${AGENCY.email}`}>
              {AGENCY.email}
            </a>
            . Réclamation possible auprès de la{' '}
            <a className="text-primary hover:underline" href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              CNIL
            </a>
            .
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">4. Cookies &amp; stockage local</h2>
          <p>Ce site n'utilise pas de cookies publicitaires ni de mesure d'audience tierce.</p>
          <p>Peuvent être utilisés :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Cookies d'authentification Supabase</strong> — strictement nécessaires à la connexion sécurisée
              (exemptés de consentement préalable, cookies fonctionnels).
            </li>
            <li>
              <strong>Stockage local (localStorage / IndexedDB)</strong> — préférences, cache hors-ligne et file de
              synchronisation pour le mode PWA.
            </li>
          </ul>
          <p>Aucun bandeau de consentement n'est requis tant qu'aucun traceur non essentiel n'est ajouté.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">5. Propriété intellectuelle</h2>
          <p>
            L'application SQCDP, son interface et son code sont la propriété de {AGENCY.name}. Toute reproduction ou
            réutilisation sans autorisation est interdite.
          </p>
        </section>

        <section className="mt-8 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">6. Contact</h2>
          <p>
            <a className="text-primary hover:underline" href={`mailto:${AGENCY.email}`}>
              {AGENCY.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

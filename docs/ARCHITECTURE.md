# Notes techniques

Application React (Vite + TypeScript) pour le pilotage SQCDP en atelier. Les données vivent dans
**Supabase** (PostgreSQL + Auth + Row Level Security) : le navigateur y appelle directement via
`@supabase/supabase-js`, sans serveur applicatif intermédiaire. Le front garde une copie locale et
une file de sync pour tenir quand le réseau coupe ou quand Supabase n'est pas configuré (mode
local, voir [MULTI_TENANT.md](./MULTI_TENANT.md)). Le dossier `sqcdp-api/` (Express + PostgreSQL,
Render) est un ancien backend conservé pour référence mais non appelé par le code actuel.

## Organisation du code

Les pages (`DashboardPage`, `WeekPage`, `DailyPage`, etc.) s'appuient sur `AppContext` pour axes, actions, commentaires et le filtre équipe courant. `AuthContext` gère la session Supabase.

La couche `lib/api.ts` centralise les appels vers `lib/data/supabaseRepo.ts` (Supabase) et un petit cache mémoire. En cas d'échec, hors ligne, ou si Supabase n'est pas configuré, les écritures passent par `localData` / `organisation` puis `enqueueSync` dans `syncQueue`. Au retour réseau, `processSyncQueue` rejoue les jobs ; `SyncStatusBar` affiche l'état.

Exports PDF et CSV sont faits côté navigateur (`jspdf`, `html2canvas`, `lib/csv`).

## Mode Daily

`DailyPage` suit le déroulé d'une réunion : ordre du jour, rôles, saisie par axe, reprise des actions ouvertes, clôture. Le compte-rendu est géré dans `lib/dailyReport.ts`.

## Déploiement

- Front : Vercel, build `tsc -b && vite build`
- BDD + Auth : Supabase, variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- CI : build + Playwright sur `main` (sans secret Supabase, donc en mode local), déploiement GitHub Pages en plus

PWA via Workbox (precache du bundle). Variables : `.env.example`.

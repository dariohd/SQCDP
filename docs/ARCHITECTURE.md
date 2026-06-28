# Notes techniques

Application React (Vite + TypeScript) pour le pilotage SQCDP en atelier. Les données vivent sur une API Express + PostgreSQL hébergée sur Render (`sqcdp-api`, repo séparé). Le front garde une copie locale et une file de sync pour tenir quand le réseau coupe.

## Organisation du code

Les pages (`DashboardPage`, `WeekPage`, `DailyPage`, etc.) s'appuient sur `AppContext` pour axes, actions, commentaires et le filtre équipe courant. `AuthContext` gère Supabase si l'auth est activée.

La couche `lib/api.ts` centralise les appels REST et un petit cache mémoire. En cas d'échec ou hors ligne, les écritures passent par `localData` / `organisation` puis `enqueueSync` dans `syncQueue`. Au retour réseau, `processSyncQueue` rejoue les jobs ; `SyncStatusBar` affiche l'état.

Exports PDF et CSV sont faits côté navigateur (`jspdf`, `html2canvas`, `lib/csv`).

## Mode Daily

`DailyPage` suit le déroulé d'une réunion : ordre du jour, rôles, saisie par axe, reprise des actions ouvertes, clôture. Le compte-rendu est géré dans `lib/dailyReport.ts`.

## Déploiement

- Front : Vercel, build `tsc -b && vite build`
- API : Render, URL dans `VITE_API_BASE_URL`
- CI : build + Playwright sur `main`, déploiement GitHub Pages en plus

PWA via Workbox (precache du bundle). Variables : `.env.example`.

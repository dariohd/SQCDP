# SQCDP WebApp — Premium

Application SQCDP (Sécurité, Qualité, Coût, Délai, Personnel) — React + Vite + TypeScript.

**Sans base de données** : données via API Render + cache localStorage (offline/PWA).

## Fonctionnalités

- Tableau de bord mensuel (5 donuts interactifs animés)
- Vue **semaine** et **pilotage** (tendances, KPIs, benchmark équipes)
- Actions **PDCA** + **8D**, modèles prédéfinis
- Alertes (retards, escalade 3 jours Attention, blocages)
- Export **CSV** / **PDF** mensuel
- Import CSV avec écrasement local
- Mode **Stand-up** plein écran
- **Roulette** réunion (historique, timer, projection)
- Journal d'audit local
- PWA hors-ligne
- Raccourcis clavier : `R` refresh, `I` import, `S` stand-up, `B` saisie, `N` alertes

## Démarrage

```bash
npm install
cp .env.example .env   # optionnel — Supabase auth
npm run dev
```

## Scripts

```bash
npm run build      # production
npm run test:e2e   # Playwright
npm run preview    # preview build
```

## Démo CSV

Fichiers dans `demo-data/` — importer dans l'ordre 01 → 04 pour tester la synchro.

## Déploiement

GitHub Actions (`.github/workflows/ci.yml`) : build, tests E2E, GitHub Pages.

Secrets : `SUPABASE_URL`, `SUPABASE_KEY`

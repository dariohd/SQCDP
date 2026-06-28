# SQCDP WebApp — Premium

[![CI](https://github.com/dariohd/SQCDP/actions/workflows/ci.yml/badge.svg)](https://github.com/dariohd/SQCDP/actions/workflows/ci.yml)

![sqcdp.vercel.app](docs/screenshot.png)

> Backend API : Express + PostgreSQL (dossier `sqcdp-api` en local, déployé sur Render). Schéma : `database/schema.sql`.

Application SQCDP (Sécurité, Qualité, Coût, Délai, Personnel) — React + Vite + TypeScript.

Production : https://sqcdp.vercel.app — dépôt : [github.com/dariohd/SQCDP](https://github.com/dariohd/SQCDP). Détails techniques : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Pas de base embarquée côté client : données via API Render + cache localStorage (offline/PWA).

## Fonctionnalités

- Tableau de bord mensuel (5 donuts interactifs animés)
- Vue **semaine** et **pilotage** (tendances, KPIs, benchmark équipes)
- **Mode Daily** guidé (ordre du jour, rôles, saisie, revue, clôture + compte-rendu)
- Actions **PDCA** + **8D**, modèles prédéfinis
- Alertes cliquables (retards, escalade, blocages)
- Filtrage par **équipe / ligne**
- Export **CSV** (PDCA inclus) / **PDF** mensuel
- Import CSV avec écrasement local
- Mode **Stand-up** interactif (plein écran + actions ouvertes)
- **Roulette** réunion (rôles distincts, historique, timer)
- Synchronisation offline (file d'attente + indicateur réseau)
- Journal d'audit local
- PWA hors-ligne
- Raccourcis clavier : `R` refresh, `I` import, `S` stand-up, `B` saisie, `N` alertes, `D` daily

## Démarrage

```bash
npm install
cp .env.example .env   # optionnel — Supabase auth + URL API
npm run dev
```

Voir [.env.example](.env.example) pour `VITE_SUPABASE_*` et `VITE_API_BASE_URL`.

## Scripts

```bash
npm run build      # production
npm run test:e2e   # Playwright
npm run preview    # preview build
```

## Démo CSV

Fichiers dans `demo-data/` — importer dans l'ordre 01 → 04 pour tester la synchro.

## Déploiement

Vercel sur `main`. GitHub Actions : build, tests E2E, GitHub Pages.

Secrets CI : `SUPABASE_URL`, `SUPABASE_KEY`, `VITE_API_BASE_URL` (optionnel)

## Base de données

Le schéma PostgreSQL attendu est dans [`database/schema.sql`](../database/schema.sql) (monorepo local).
Le contrat REST est documenté dans [`database/API.md`](../database/API.md).

Backend API : [`sqcdp-api/README.md`](../sqcdp-api/README.md) (Node + Express + PostgreSQL).

L'app tourne aussi en fallback localStorage + file de sync si l'API n'est pas dispo.

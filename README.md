# SQCDP

Suite **SQCDP** (Sécurité, Qualité, Coût, Délai, Personnel) pour le pilotage industriel en atelier.

| | |
|---|---|
| **App production** | https://sqcdp.vercel.app |
| **Dépôt** | [github.com/dariohd/SQCDP](https://github.com/dariohd/SQCDP) |

Ce dépôt regroupe l'application React (racine), un schéma SQL Supabase (`supabase/`, `database/`)
et une ancienne API Express (`sqcdp-api/`, voir `sqcdp-api/ARCHIVED.md`) non utilisée en production.

## Backend de référence : Supabase

**Supabase (PostgreSQL + Auth + Row Level Security) est l'unique source de vérité.** Le navigateur
appelle directement Supabase via `@supabase/supabase-js` (`src/lib/data/supabaseRepo.ts`) ; il n'y a
pas de serveur applicatif intermédiaire en production. `localStorage` sert uniquement de **cache
hors-ligne et de file de synchronisation** (`src/lib/localData.ts`, `src/lib/syncQueue.ts`) : si
Supabase n'est pas joignable, les écritures sont rejouées au retour du réseau.

Guide de mise en route complet : [docs/DEPLOIEMENT-VERCEL-SUPABASE.md](docs/DEPLOIEMENT-VERCEL-SUPABASE.md).
Modèle d'isolation multi-site / multi-équipe et angles morts connus : [docs/MULTI_TENANT.md](docs/MULTI_TENANT.md).

> **`sqcdp-api/` (Express + PostgreSQL) est un backend historique, non déployé et non appelé par
> le frontend actuel.** Le code source y fait toujours référence à `VITE_API_BASE_URL`, mais aucun
> appel réseau vers cette variable n'existe plus dans `src/`. Ce dossier reste dans le dépôt à titre
> de référence ; ne pas s'appuyer sur `docs/DEPLOIEMENT-PRODUCTION.md` ou `docs/INSTALLATION-BDD.md`
> pour un nouveau déploiement (voir la note en tête de ces deux fichiers).

| Dossier | Rôle | Doc |
|---------|------|-----|
| **Racine** (`src/`, `package.json`…) | PWA React, seule brique déployée | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **`supabase/`**, **`database/`** | Schéma SQL + policies RLS (source de vérité) | [database/API.md](database/API.md), [schema.sql](database/schema.sql) |
| **`sqcdp-api/`** | Ancienne API REST Express, non utilisée | [sqcdp-api/README.md](sqcdp-api/README.md) |

---

## Application frontend

[![CI](https://github.com/dariohd/SQCDP/actions/workflows/ci.yml/badge.svg)](https://github.com/dariohd/SQCDP/actions/workflows/ci.yml)

![sqcdp.vercel.app](docs/screenshot.png)

React + Vite + TypeScript. Aucune base embarquée côté client : Supabase en source de vérité, cache local (PWA) pour le hors-ligne.

### Fonctionnalités

- Tableau de bord mensuel (5 donuts interactifs animés)
- Vue **semaine** et **pilotage** (tendances, KPIs, benchmark équipes)
- **Mode Daily** guidé (ordre du jour, rôles, saisie, revue, clôture + compte-rendu)
- Actions **PDCA** + **8D**, modèles prédéfinis
- Alertes cliquables (retards, escalade, blocages)
- Filtrage par **équipe / ligne**
- Export **CSV** / **PDF** mensuel, import CSV
- Mode **Stand-up**, **Roulette** réunion, sync offline, journal d'audit
- Raccourcis : `R` refresh, `I` import, `S` stand-up, `B` saisie, `N` alertes, `D` daily

### Démarrage

```bash
npm install
cp .env.example .env
# renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (voir docs/DEPLOIEMENT-VERCEL-SUPABASE.md)
npm run dev
```

→ http://localhost:5173 — variables : [.env.example](.env.example)

Sans ces deux variables, l'app démarre quand même en **mode local** : les pages `/app/*`
restent accessibles sans connexion et les données ne quittent jamais le navigateur (aucune
frontière d'authentification n'est appliquée dans ce mode, voir [docs/MULTI_TENANT.md](docs/MULTI_TENANT.md)).
Ce mode est pratique pour développer sans base, mais ne doit pas être confondu avec un
déploiement de production.

```bash
npm run build
npm run test:e2e
```

Démo CSV : `demo-data/` (importer 01 → 04), ou bouton « Charger la démo usine » sur l'accueil.

---

## Déploiement production

| Composant | Cible |
|-----------|--------|
| **App** (racine) | Vercel — https://sqcdp.vercel.app |
| **BDD + Auth** | Supabase (PostgreSQL + RLS), migrations dans `supabase/migrations/` |

Secrets Vercel : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Détail pas-à-pas :
[docs/DEPLOIEMENT-VERCEL-SUPABASE.md](docs/DEPLOIEMENT-VERCEL-SUPABASE.md).

CI GitHub : build + tests Playwright (`.github/workflows/ci.yml`), sans secret Supabase (le
build et les tests s'exécutent donc en mode local, cf. [docs/MULTI_TENANT.md](docs/MULTI_TENANT.md)).

`sqcdp-api/` (Render, Express, `VITE_API_BASE_URL`) est une ancienne piste de déploiement,
non utilisée par le frontend actuel : ignorez `docs/DEPLOIEMENT-PRODUCTION.md` et
`docs/INSTALLATION-BDD.md` pour un nouveau déploiement.

---

## Contact

Hugo Davion — [bulletonsite.com](https://bulletonsite.com)

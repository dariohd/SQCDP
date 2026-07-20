# Créer et connecter la base de données SQCDP (ancienne stack, non utilisée)

> **Doc obsolète.** Ce guide décrit la stack `sqcdp-api` (Express + PostgreSQL, `VITE_API_BASE_URL`),
> que le frontend actuel n'appelle plus. Pour créer la base réellement utilisée en production,
> voir [DEPLOIEMENT-VERCEL-SUPABASE.md](./DEPLOIEMENT-VERCEL-SUPABASE.md) (migrations SQL dans
> `supabase/migrations/`). Ce fichier reste ici pour référence sur l'ancienne architecture ; voir
> aussi [MULTI_TENANT.md](./MULTI_TENANT.md) pour le modèle d'isolation réellement en vigueur.

Ce guide explique comment créer une base PostgreSQL, l’initialiser avec le schéma SQCDP, la relier à l’API et au frontend, puis charger des **données fictives** pour tester ou faire une démo.

---

## Architecture

```
Frontend (sqcdp-app)  ──HTTP──►  API (sqcdp-api)  ──SQL──►  PostgreSQL
     VITE_API_BASE_URL              DATABASE_URL
```

Sans API configurée, le frontend fonctionne en **mode local** (données uniquement sur ce navigateur).

**Pour une BDD en ligne accessible depuis n’importe quel PC** → voir [DEPLOIEMENT-PRODUCTION.md](./DEPLOIEMENT-PRODUCTION.md).

---

## Option 1 — Docker (recommandé en local)

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé.

```powershell
cd C:\Projets\Sites\SQCDP\sqcdp-api
docker compose up --build
```

Cela démarre :
- **PostgreSQL** sur le port `5432`
- **API** sur `http://localhost:3001`

Vérification :

```powershell
curl http://localhost:3001/health
```

Réponse attendue : `{"status":"ok"}`

---

## Option 2 — PostgreSQL manuel (Supabase, Neon, Render, serveur local)

### 1. Créer la base

| Service | Action |
|---------|--------|
| **Supabase** | Projet → Settings → Database → copier l’URL `postgresql://...` |
| **Neon** | Nouveau projet → Connection string |
| **Render** | New → PostgreSQL → Internal/External URL |
| **Local** | `createdb sqcdp` puis `postgresql://user:pass@localhost:5432/sqcdp` |

### 2. Configurer l’API

```powershell
cd C:\Projets\Sites\SQCDP\sqcdp-api
copy .env.example .env
```

Éditez `.env` :

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/sqcdp
PORT=3001
CORS_ORIGINS=http://localhost:5173
DEFAULT_SITE=Site principal
```

### 3. Initialiser le schéma

```powershell
npm install
npm run db:init
npm run dev
```

Le script `db:init` exécute `database/init.sql` et crée les équipes par défaut (Ligne 1, 2, 3) et les 5 axes SQCDP.

---

## Relier le frontend à l’API

```powershell
cd C:\Projets\Sites\SQCDP\sqcdp-app
copy .env.example .env
```

Dans `.env` :

```env
VITE_API_BASE_URL=http://localhost:3001
```

Puis :

```powershell
npm install
npm run dev
```

Ouvrez `http://localhost:5173`. Les requêtes partent vers l’API ; l’équipe active est envoyée via l’en-tête `X-SQCDP-Equipe`.

### Auth Supabase (optionnel)

Si vous utilisez la connexion utilisateur :

**Frontend** :
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**API** :
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=votre_jwt_secret
```

Sans ces variables, l’API accepte les requêtes sans JWT (pratique en dev).

---

## Données fictives (démo usine)

Deux méthodes complémentaires :

### A — Depuis l’interface (frontend)

1. Allez sur l’**accueil** (`/`)
2. Cliquez sur **« Charger la démo usine »**
3. Les CSV de `public/demo-data/` sont importés (états juin 2026, actions, commentaires)

Fichiers sources : `sqcdp-app/demo-data/demo_01_*.csv` à `demo_03_*.csv`.

### B — Depuis l’API (seed PostgreSQL)

Après `npm run db:init` :

```powershell
cd C:\Projets\Sites\SQCDP\sqcdp-api
npm run seed:demo
```

Variables optionnelles dans `.env` :

```env
SEED_SITE=Site principal
SEED_EQUIPE=Ligne 1
```

Le script lit les mêmes CSV et insère directement en base (idéal pour un environnement partagé ou une démo sans passer par le navigateur).

---

## Déploiement production (aperçu)

| Composant | Suggestion |
|-----------|------------|
| Frontend | Vercel / Netlify — `VITE_API_BASE_URL` = URL API prod |
| API | Render / Railway / Fly.io — `DATABASE_URL` = Postgres managé |
| BDD | Supabase / Neon / Render Postgres |

Fichier `sqcdp-api/render.yaml` fourni pour un déploiement Render type blueprint.

---

## Dépannage

| Problème | Piste |
|----------|-------|
| `ECONNREFUSED` sur l’API | Vérifier que `npm run dev` tourne dans `sqcdp-api` |
| Données non visibles | Vérifier l’équipe (paramètres ⚙) = celle du seed (`Ligne 1`) |
| CORS bloqué | Ajouter l’URL du frontend dans `CORS_ORIGINS` |
| SSL Postgres | Ajouter `?sslmode=require` à `DATABASE_URL` (Neon, Supabase) |

---

## Commandes utiles

```powershell
# API — init schéma
npm run db:init

# API — données fictives
npm run seed:demo

# API — dev
npm run dev

# Frontend — dev
npm run dev

# Frontend — build prod
npm run build
```

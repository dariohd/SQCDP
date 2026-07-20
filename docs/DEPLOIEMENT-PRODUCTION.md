# Mise en ligne — BDD persistante accessible partout (ancienne stack, non utilisée)

> **Doc obsolète.** Ce guide décrit la stack Render (API Express + PostgreSQL) via
> `VITE_API_BASE_URL`. Le frontend actuel (`src/`) n'appelle plus cette API : il parle
> directement à Supabase (voir [DEPLOIEMENT-VERCEL-SUPABASE.md](./DEPLOIEMENT-VERCEL-SUPABASE.md),
> le guide à suivre pour un nouveau déploiement). Ce fichier est conservé pour référence sur
> l'ancienne architecture (`sqcdp-api/`) ; voir aussi [MULTI_TENANT.md](./MULTI_TENANT.md) pour
> le modèle d'isolation réellement en vigueur.

Ce guide configure une **base PostgreSQL hébergée** + une **API en ligne** + le **frontend Vercel**.  
Toutes les saisies sont stockées en base : accessibles depuis n’importe quel PC via l’URL du site.

```
PC bureau ──┐
PC atelier ─┼──► https://votre-sqcdp.vercel.app ──► API Render ──► PostgreSQL (persistant)
Téléphone ──┘
```

---

## Vue d’ensemble (≈ 30 min, gratuit pour démarrer)

| Étape | Service | Rôle | Coût départ |
|-------|---------|------|-------------|
| 1 | **Render** | API + PostgreSQL | Gratuit (limites) |
| 2 | **Vercel** | Site React | Gratuit |
| 3 | Variables d’env | Relier front ↔ API | — |

> **Alternative BDD** : [Neon](https://neon.tech) ou [Supabase](https://supabase.com) si vous préférez une base séparée (souvent plus stable en gratuit que Render Postgres).

---

## Étape 1 — Déployer l’API + PostgreSQL sur Render

### 1.1 Créer le compte

1. Allez sur [render.com](https://render.com) et créez un compte (GitHub recommandé).
2. Poussez le projet sur GitHub si ce n’est pas déjà fait.

### 1.2 Blueprint (déploiement en 1 clic)

1. Render → **New** → **Blueprint**
2. Connectez le repo `SQCDP`
3. Render détecte `sqcdp-api/render.yaml`
4. **Avant de déployer**, modifiez dans le blueprint :
   - `CORS_ORIGINS` → remplacez `VOTRE-APP.vercel.app` par votre futur domaine Vercel (ex. `sqcdp.vercel.app`)
5. Lancez le déploiement

Render crée automatiquement :
- Une base **`sqcdp-db`** (PostgreSQL persistant)
- Le service **`sqcdp-api`** (Docker)

### 1.3 Vérifier

Une fois déployé, notez l’URL de l’API, par ex. :

```
https://sqcdp-api.onrender.com
```

Test dans le navigateur :

```
https://sqcdp-api.onrender.com/health
```

Réponse attendue :

```json
{"status":"ok","db":true}
```

> Le plan gratuit Render **endort l’API** après ~15 min sans trafic. Le premier chargement peut prendre 30–60 s (barre « Réveil du serveur » dans l’app). La **base de données reste active** et conserve toutes les données.

### 1.4 Données initiales (fictives ou vides)

Au **premier déploiement**, `RUN_SEED_DEMO=true` dans `render.yaml` charge automatiquement le jeu « Usine Dupont » (juin 2026).

Après le premier déploiement réussi :
1. Render → service `sqcdp-api` → **Environment**
2. Passez `RUN_SEED_DEMO` à `false` (évite de recharger la démo à chaque redémarrage)
3. **Save & redeploy**

Pour recharger la démo plus tard (sans redéployer) :

```powershell
curl -X POST https://VOTRE-API.onrender.com/admin/seed-demo -H "X-Admin-Secret: VOTRE_ADMIN_SECRET"
```

Le secret `ADMIN_SECRET` est visible dans les variables d’environnement Render.

---

## Étape 2 — Déployer le frontend sur Vercel

### 2.1 Importer le projet

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Importez le repo GitHub
3. **Root Directory** : `sqcdp-app`
4. Framework : Vite (détecté automatiquement)

### 2.2 Variable d’environnement (obligatoire)

Dans **Settings → Environment Variables** :

| Nom | Valeur | Environnements |
|-----|--------|----------------|
| `VITE_API_BASE_URL` | `https://sqcdp-api.onrender.com` | Production, Preview, Development |

Remplacez par **votre** URL Render exacte.

### 2.3 Déployer

Cliquez **Deploy**. Vous obtenez une URL du type :

```
https://sqcdp.vercel.app
```

### 2.4 Finaliser CORS sur Render

Retournez sur Render → `sqcdp-api` → **Environment** → `CORS_ORIGINS` :

```
https://sqcdp.vercel.app,http://localhost:5173
```

(ajoutez votre domaine custom si vous en avez un)

**Save & redeploy**.

---

## Étape 3 — Vérifier que tout est partagé

1. Ouvrez `https://votre-app.vercel.app` sur le **PC 1**
2. Une fine barre verte doit afficher :  
   **« Données enregistrées sur le serveur — accessibles depuis tous les postes »**
3. Saisissez un état sur le tableau mensuel (`/mois`)
4. Ouvrez la **même URL** sur le **PC 2** (ou en navigation privée)
5. La saisie doit apparaître (même équipe : **Ligne 1** par défaut)

Si la barre orange « Serveur injoignable » s’affiche :
- Vérifiez `VITE_API_BASE_URL` sur Vercel
- Attendez le réveil de l’API Render (première requête lente)
- Vérifiez `/health` dans le navigateur

---

## Option B — Neon (PostgreSQL) + Render (API seule)

Si vous voulez une BDD plus fiable en gratuit :

### B.1 Créer la base Neon

1. [neon.tech](https://neon.tech) → nouveau projet `sqcdp`
2. Copiez la connection string :  
   `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/sqcdp?sslmode=require`

### B.2 API Render sans base Render

1. Render → **New Web Service** (Docker, dossier `sqcdp-api`)
2. Variables :
   ```env
   DATABASE_URL=postgresql://...neon...?sslmode=require
   CORS_ORIGINS=https://votre-app.vercel.app
   DEFAULT_SITE=Site principal
   RUN_SEED_DEMO=true
   ```
3. Pas besoin de créer une base Render

L’API exécute le schéma au démarrage (`init.sql`).

---

## Auth utilisateurs (optionnel)

Sans Supabase, l’API est ouverte (OK pour réseau interne / VPN).

Pour restreindre l’accès :
1. Créez un projet [Supabase](https://supabase.com)
2. **Frontend** Vercel :
   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. **API** Render :
   ```env
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_JWT_SECRET=votre-jwt-secret
   ```

---

## Récap des URLs à retenir

| Élément | Où le trouver |
|---------|---------------|
| Site public | `https://xxx.vercel.app` |
| API | `https://xxx.onrender.com` |
| BDD | Render Dashboard → `sqcdp-db` → Connection (admin seulement) |
| Santé API | `https://xxx.onrender.com/health` |

---

## Commandes utiles en local (tests avant prod)

```powershell
# Frontend pointant vers l’API en ligne
cd sqcdp-app
# .env : VITE_API_BASE_URL=https://sqcdp-api.onrender.com
npm run dev
```

---

## Limites plan gratuit & montée en charge

| Limite | Impact | Solution |
|--------|--------|----------|
| API Render endormie | 1er chargement lent | Plan payant Render (~7$/mois) ou API sur Railway/Fly |
| Postgres Render gratuit | Expire après 90 j | Migrer vers Neon/Supabase |
| Pas d’auth | Site public = données visibles | Activer Supabase auth |

---

## Checklist finale

- [ ] `/health` retourne `db: true`
- [ ] `VITE_API_BASE_URL` configuré sur Vercel
- [ ] `CORS_ORIGINS` contient l’URL Vercel
- [ ] Barre verte « Données enregistrées sur le serveur » visible
- [ ] Test cross-PC : même donnée visible sur 2 navigateurs
- [ ] `RUN_SEED_DEMO=false` après le premier seed (prod réelle)

Une fois ces points validés, vos données **restent en ligne** et sont **partagées entre tous les postes** qui ouvrent l’application.

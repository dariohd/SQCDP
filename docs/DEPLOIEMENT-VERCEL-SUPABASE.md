# Déploiement Vercel + Supabase

Stack cible : **2 services seulement**, 0 € pour démarrer.

```
Navigateur  →  Vercel (site React)  →  Supabase (PostgreSQL + Auth)
```

Plus besoin de Render ni d’API Express pour le fonctionnement normal.

---

## Étape 1 — Créer le projet Supabase (5 min)

1. [supabase.com](https://supabase.com) → **New project**
2. Choisissez un nom (`sqcdp`), mot de passe BDD, région **Europe** (ex. Frankfurt)
3. Attendez la fin du provisioning

### Créer les tables

1. Supabase → **SQL Editor** → **New query**
2. Collez le contenu de `supabase/migrations/001_schema.sql` → **Run**
3. Collez le contenu de `supabase/migrations/002_rls.sql` → **Run**

Cela crée : sites, équipes, axes, états, actions, commentaires, daily reports + sécurité RLS.

### Créer les utilisateurs

1. Supabase → **Authentication** → **Users** → **Add user**
2. Créez un compte par animateur / pilote (email + mot de passe)
3. Les utilisateurs doivent être connectés pour lire/écrire (RLS)

### Récupérer les clés

Supabase → **Project Settings** → **API** :

| Clé | Usage |
|-----|--------|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon public** | `VITE_SUPABASE_ANON_KEY` |

---

## Étape 2 — Déployer sur Vercel (5 min)

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Importez le repo GitHub
3. **Root Directory** : `sqcdp-app`
4. **Environment Variables** :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

5. **Deploy**

Votre URL : `https://sqcdp.vercel.app` (ou nom choisi)

### Auth : URLs autorisées

Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : `https://votre-app.vercel.app`
- **Redirect URLs** : `https://votre-app.vercel.app/**`

### Pages publiques vs application

| URL | Accès |
|-----|--------|
| `/` | **Vitrine** publique (prospects, pas de données) |
| `/login` | Connexion |
| `/app/*` | **Application** (login requis) |

---

## Étape 3 — Tester

1. Ouvrez l’URL Vercel
2. Page **login** → connectez-vous avec un utilisateur Supabase
3. Barre verte : *« Données enregistrées sur le serveur »*
4. Saisissez un état sur `/mois`
5. Ouvrez la même URL sur un **autre PC** → même donnée visible

---

## Développement local

```powershell
cd C:\Projets\Sites\SQCDP\sqcdp-app
copy .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

---

## Données fictives (démo)

**Option A — Interface** : Accueil → « Charger la démo usine »

**Option B — SQL** : importer les CSV via l’app après connexion

Les données sont stockées dans **Supabase PostgreSQL**, pas dans le navigateur.

---

## Coûts

| Service | Plan gratuit | Limites |
|---------|--------------|---------|
| **Vercel** | Hobby 0 € | Usage perso / PME légère |
| **Supabase** | Free 0 € | 500 Mo BDD, pause après 7 j inactivité (réactivable) |

**Total démarrage : 0 €**

Montée en charge (~25 €/mois) : Supabase Pro + Vercel Pro si besoin.

---

## Sécurité

- Seuls les utilisateurs **connectés** accèdent aux données (RLS)
- La clé `anon` est publique — c’est normal, RLS protège la BDD
- Ne jamais exposer la clé `service_role` dans le frontend

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Configuration Supabase manquante » | Variables Vercel + redéployer |
| Erreur RLS / permission denied | Utilisateur non connecté, ou migrations 002 non exécutées |
| Données vides | Vérifier équipe = Ligne 1 (paramètres) |
| Login boucle | Vérifier Redirect URLs dans Supabase |

---

## Ancienne stack (Render)

Le dossier `sqcdp-api/` reste dans le repo pour référence mais **n’est plus nécessaire** avec Vercel + Supabase.

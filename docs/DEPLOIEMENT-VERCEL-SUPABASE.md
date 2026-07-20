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
4. Collez le contenu de `supabase/migrations/003_site_members_rls.sql` → **Run** (**obligatoire** : isolation multi-site)
5. Collez le contenu de `supabase/migrations/004_site_invites.sql` → **Run** (invitations membres + durcissement)

Sans **003**, tout utilisateur authentifié peut lire/écrire toutes les données.
Sans **004**, impossible d'inviter un collègue depuis l'UI (Paramètres > Membres).

Cela crée : sites, équipes, axes, états, actions, commentaires, daily reports, `site_members`, RLS et RPC d'invitation.

### Créer les utilisateurs

1. Supabase → **Authentication** → **Users** → **Add user**
2. Créez le **premier** compte (il devient admin du site au premier accès si le site n'a pas encore de membres)
3. Pour les suivants : créez le user Auth, puis dans l'app **Paramètres > Membres** invitez son email (admin requis)

### Mot de passe oublié

Sur `/login`, le lien « Mot de passe oublié » utilise `resetPasswordForEmail` Supabase.
Vérifiez que **Site URL** / **Redirect URLs** incluent votre domaine Vercel.

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

## Keep-alive (plan Free)

Supabase **pause** les projets Free après ~7 jours sans activité API.
Ce dépôt inclut un workflow GitHub Actions (`.github/workflows/keep-supabase-alive.yml`)
qui ping la table `axes` **3 fois par semaine**.

À configurer une fois dans GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|--------|--------|
| `SUPABASE_URL` | Project URL (identique à `VITE_SUPABASE_URL`) |
| `SUPABASE_ANON_KEY` | clé `anon` (identique à `VITE_SUPABASE_ANON_KEY`) |

Puis **Actions → Keep Supabase alive → Run workflow** pour tester.

Alternative payante : passer en **Pro** (pas de pause automatique).

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
| Erreur RLS / permission denied | Utilisateur non connecté, ou migrations **002/003/004** non exécutées |
| Accès site refusé / bandeau membership | Admin doit inviter l'email (Paramètres > Membres) après création Auth |
| Données vides | Vérifier équipe = Ligne 1 (paramètres) et membership site |
| Sync échouée (barre rouge) | Réessayer ; sinon Ignorer puis ressaisir |
| Login boucle | Vérifier Redirect URLs dans Supabase |

---

## Ancienne stack (Render)

Le dossier `sqcdp-api/` reste dans le repo pour référence mais **n’est plus nécessaire** avec Vercel + Supabase.

# Multi-tenant SQCDP : modèle, isolation, angles morts

Ce document décrit comment SQCDP isole les données entre sites (usines) et équipes (lignes),
ce qui est réellement testé aujourd'hui, et ce qui ne l'est pas.

## Modèle de données

Deux niveaux d'isolation existent dans le schéma (`database/schema.sql`, `supabase/migrations/`) :

- **Site** (`sites`) : une usine / un client. Toutes les équipes, actions, commentaires,
  états journaliers et daily reports remontent à un site via `equipes.site_id`.
- **Équipe** (`equipes`, colonne `equipe_id` sur les tables de données) : une ligne / un atelier
  à l'intérieur d'un site. C'est la granularité de filtrage utilisée au quotidien dans l'UI.

Un utilisateur devient membre d'un site via la table `site_members` (voir
`supabase/migrations/003_site_members_rls.sql`). Le premier utilisateur à rejoindre un site vide
en devient automatiquement `admin` (fonction `ensure_site_membership`) ; un site déjà peuplé
ne permet plus l'auto-adhésion (il faut une invitation manuelle, non implémentée côté UI).

## Frontière d'isolation réelle : Supabase RLS

Quand `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sont configurées, le navigateur appelle
Supabase directement (`src/lib/data/supabaseRepo.ts`), et c'est **Postgres Row Level Security**
qui garantit l'isolation :

- `sites_select` / `equipes_select` / `jour_etats_all` / etc. filtrent par
  `site_id IN (SELECT public.user_site_ids())`, où `user_site_ids()` lit `site_members`
  pour l'utilisateur connecté (voir `002_rls.sql` puis `003_site_members_rls.sql`).
- Sans session Supabase valide, toutes les policies échouent (`TO authenticated`) : un
  utilisateur non connecté ne peut rien lire ni écrire côté Supabase.

C'est cette frontière RLS qui constitue la vraie isolation multi-tenant en production.

## Ce que l'app fait quand Supabase n'est pas configuré

Si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sont absentes (poste de dev sans `.env`, ou CI
sans secret) :

- `isSupabaseConfigured()` renvoie `false`.
- `ProtectedRoute` (voir `src/App.tsx`) **laisse passer tout le monde** sur `/app/*` sans
  connexion : c'est un choix délibéré pour permettre un mode local mono-poste (données dans
  `localStorage` uniquement, cf. `docs/ARCHITECTURE.md`), mais cela veut dire qu'il n'y a alors
  **aucune** frontière d'auth ni de site à cette étape.
- Le filtrage reste actif à l'échelle de l'équipe uniquement : `getCurrentEquipe()`
  (`src/lib/team.ts`, valeur stockée dans `localStorage`) sert de clé de filtrage dans
  `filterActionsForEquipe` / `mergeActions` / `mergeComments` / `getLocalDayStates`.

C'est ce mécanisme de filtrage par équipe, actif dans les deux modes (Supabase ou local), qui
est couvert par `e2e/multi-tenant.spec.ts`.

## Ce qui est couvert par les tests e2e

`e2e/multi-tenant.spec.ts` exécute l'app **sans** Supabase configuré (comme en CI aujourd'hui,
cf. `.github/workflows/ci.yml`, qui ne définit aucune variable `VITE_SUPABASE_*`) et vérifie :

- qu'une action créée sous l'équipe active (« Ligne 1 ») disparaît de l'écran dès qu'on bascule
  vers une autre équipe (« Ligne 2 ») depuis les Paramètres, puis réapparaît en revenant sur
  « Ligne 1 » ;
- que le champ « Site » des Paramètres est bien pris en compte et persiste après enregistrement.

Ces tests exercent le même code de filtrage (`equipe_id` / `site_id` en base, `equipe` / `site`
côté client) que celui utilisé par les policies RLS, mais **pas** les policies RLS elles-mêmes :
sans base Supabase de test provisionnée en CI, on ne peut pas simuler deux comptes appartenant
à deux sites différents et vérifier qu'une requête Supabase échoue réellement pour l'un des deux.

## Angles morts connus (non couverts aujourd'hui)

1. **Isolation RLS non testée en CI.** Aucun projet Supabase de test n'est provisionné dans
   `.github/workflows/ci.yml` : la garantie d'isolation entre sites n'est vérifiée qu'à la lecture
   du SQL, pas par un test automatisé bout-en-bout. Pour combler ce point, il faudrait un projet
   Supabase dédié aux tests (ou un Postgres local + `supabase-js` pointé dessus), deux comptes
   seedés sur deux sites distincts, et un test qui vérifie qu'un compte ne peut ni lire ni écrire
   les données de l'autre site.
2. **Auth totalement absente quand Supabase n'est pas configuré.** C'est un choix de design pour
   le mode local, mais un déploiement en production qui oublierait `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` exposerait `/app/*` sans aucune authentification. Rien ne le détecte
   automatiquement aujourd'hui (pas d'avertissement de build, pas de test).
3. **Le nom de site est un champ libre côté client.** Le champ « Site » des Paramètres
   (`src/components/dialogs/SettingsDialog.tsx`) accepte n'importe quelle chaîne ; `ensureSite()`
   crée la ligne `sites` correspondante si elle n'existe pas. Il n'y a pas d'écran d'administration
   des sites, ni de flux d'invitation : le seul contrôle est la règle « premier arrivé = admin »
   côté RPC `ensure_site_membership`.
4. **Pas de sélecteur multi-site dans l'UI.** `getSettings().site` (`src/lib/team.ts`) ne stocke
   qu'une seule valeur ; un utilisateur membre de plusieurs sites ne peut pas basculer de l'un à
   l'autre depuis l'interface aujourd'hui.
5. **Isolation par équipe non appliquée par RLS.** Les policies Supabase isolent par `site_id`,
   pas par `equipe_id` : n'importe quel membre d'un site voit et modifie toutes les équipes de ce
   site. Le filtrage par équipe (« Ligne 1 » vs « Ligne 2 ») est une commodité d'affichage côté
   client, pas une frontière de sécurité.
6. **`sqcdp-api` (dossier `sqcdp-api/`, Express + PostgreSQL) n'implémente pas cette isolation.**
   Ce backend n'est plus appelé par le frontend actuel (voir README, section « Backend de
   référence ») ; s'il était un jour réactivé, il faudrait lui ajouter l'équivalent de la RLS
   Supabase avant de le considérer comme une source de vérité pour l'isolation multi-tenant.

## Pour aller plus loin

Si une isolation multi-site testée de bout en bout devient nécessaire, l'option la plus simple
est de provisionner un projet Supabase de test (ou un conteneur Postgres + PostgREST), d'y jouer
les migrations `supabase/migrations/`, de seeder deux sites avec un compte chacun via l'API Admin
Supabase, puis d'écrire un test Playwright qui se connecte avec chaque compte et vérifie qu'aucune
donnée de l'autre site n'est visible ni modifiable (y compris via des IDs d'objets deviné/forcés,
pour couvrir l'IDOR).

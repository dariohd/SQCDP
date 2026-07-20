# ARCHIVÉ — ne pas déployer

`sqcdp-api/` est l'**ancienne** API Express + PostgreSQL.

- **Non utilisée** par le frontend actuel (Supabase direct)
- **Non déployée** en production
- Conservée uniquement comme référence historique

Toute nouvelle installation doit suivre `docs/DEPLOIEMENT-VERCEL-SUPABASE.md`.

Ne pas reconnecter `VITE_API_BASE_URL` : ce chemin n'existe plus dans `src/`.

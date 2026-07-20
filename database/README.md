# Schéma API Render / PostgreSQL

- **`schema.sql`** — tables pour `sqcdp-api` (Express + JWT optionnel Supabase), backend legacy
  non appelé par le frontend actuel (voir README racine, section « Backend de référence »)
- **RLS multi-tenant Supabase (source de vérité en production)** → voir `../supabase/migrations/`
  (notamment `003_site_members_rls.sql`) et `../docs/MULTI_TENANT.md`

-- SQCDP — Schéma PostgreSQL pour Supabase
-- Exécuter dans Supabase → SQL Editor (ou via supabase db push)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS sites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, name)
);

CREATE TABLE IF NOT EXISTS axes (
  id          SERIAL PRIMARY KEY,
  key         CHAR(1) NOT NULL CHECK (key IN ('S','Q','C','D','P')),
  label       TEXT NOT NULL,
  site_id     UUID REFERENCES sites(id) ON DELETE CASCADE,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS axes_site_key_idx ON axes (site_id, key) WHERE site_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS axes_global_key_idx ON axes (key) WHERE site_id IS NULL;

CREATE TABLE IF NOT EXISTS jour_etats (
  id          BIGSERIAL PRIMARY KEY,
  axe_id      INT NOT NULL REFERENCES axes(id),
  equipe_id   UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  etat        TEXT NOT NULL CHECK (etat IN ('ok','attention','blocage','non rempli')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id),
  UNIQUE (axe_id, equipe_id, date)
);

CREATE INDEX IF NOT EXISTS idx_jour_etats_equipe_date ON jour_etats (equipe_id, date);

CREATE TABLE IF NOT EXISTS commentaires (
  id          BIGSERIAL PRIMARY KEY,
  axe_id      INT NOT NULL REFERENCES axes(id),
  equipe_id   UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_commentaires_equipe_date ON commentaires (equipe_id, date);

CREATE TABLE IF NOT EXISTS actions (
  id                     BIGSERIAL PRIMARY KEY,
  axe_id                 INT NOT NULL REFERENCES axes(id),
  equipe_id              UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  probleme               TEXT NOT NULL,
  titre                  TEXT,
  categorie              TEXT,
  criticite              TEXT,
  cause                  TEXT,
  auteur                 TEXT,
  porteur                TEXT NOT NULL,
  solution               TEXT,
  echeance               DATE,
  created_at             DATE NOT NULL DEFAULT CURRENT_DATE,
  statut                 TEXT NOT NULL DEFAULT 'ouverte' CHECK (statut IN ('ouverte','fermee')),
  code                   TEXT,
  pdca_plan              TEXT,
  pdca_do                TEXT,
  pdca_check             TEXT,
  pdca_act               TEXT,
  d1_equipe              TEXT,
  d2_probleme            TEXT,
  d3_containment         TEXT,
  d4_cause_racine        TEXT,
  d5_actions_correctives TEXT,
  d6_validation          TEXT,
  d7_prevention          TEXT,
  d8_cloture             TEXT,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_equipe_statut ON actions (equipe_id, statut);

CREATE TABLE IF NOT EXISTS app_params (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  colors      JSONB NOT NULL,
  labels      JSONB NOT NULL,
  axes_labels JSONB,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id       UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  timer_sec       INT NOT NULL DEFAULT 0,
  roulette        JSONB,
  checklist       JSONB,
  today_states    JSONB,
  summary_text    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id),
  UNIQUE (equipe_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_equipe ON daily_reports (equipe_id, date DESC);

CREATE TABLE IF NOT EXISTS roulette_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id   UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  results     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Données initiales
INSERT INTO sites (name) VALUES ('Site principal') ON CONFLICT (name) DO NOTHING;

INSERT INTO axes (key, label, sort_order) VALUES
  ('S', 'Sécurité', 1),
  ('Q', 'Qualité', 2),
  ('C', 'Coût', 3),
  ('D', 'Délai', 4),
  ('P', 'Personnel', 5)
ON CONFLICT DO NOTHING;

INSERT INTO equipes (site_id, name)
SELECT s.id, v.name
FROM sites s
CROSS JOIN (VALUES ('Ligne 1'), ('Ligne 2'), ('Ligne 3')) AS v(name)
WHERE s.name = 'Site principal'
ON CONFLICT (site_id, name) DO NOTHING;

INSERT INTO app_params (site_id, colors, labels)
SELECT s.id,
  '{"vert":"#53c15e","jaune":"#ffe066","rouge":"#ec5353","gris":"#e0e0e0"}'::jsonb,
  '{"vert":"OK","jaune":"Attention","rouge":"Blocage","gris":"Non rempli"}'::jsonb
FROM sites s
WHERE s.name = 'Site principal'
ON CONFLICT (site_id) DO NOTHING;

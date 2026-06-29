-- SQCDP — Données de démo « Usine Dupont »
-- Supabase → SQL Editor → coller tout → Run
--
-- Cible : Site principal, équipes Ligne 1 / 2 / 3
-- Mois : juin 2025 (mois courant à l'ouverture) + juin 2026 (scénario démo)
-- Ré-exécutable : supprime d'abord les lignes marquées SEED-*

-- ─── Helpers ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sqcdp_equipe_id(p_site TEXT, p_equipe TEXT)
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT e.id
  FROM equipes e
  JOIN sites s ON s.id = e.site_id
  WHERE s.name = p_site AND e.name = p_equipe
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sqcdp_axe_id(p_key CHAR(1))
RETURNS INT LANGUAGE sql STABLE AS $$
  SELECT id FROM axes WHERE key = p_key AND site_id IS NULL LIMIT 1;
$$;

-- ─── Nettoyage (ré-exécution) ────────────────────────────────────────────────

DELETE FROM commentaires
WHERE equipe_id IN (
  SELECT sqcdp_equipe_id('Site principal', n) FROM unnest(ARRAY['Ligne 1','Ligne 2','Ligne 3']) AS n
)
AND content LIKE '[Démo]%';

DELETE FROM actions WHERE code LIKE 'SEED-%';

DELETE FROM daily_reports
WHERE equipe_id = sqcdp_equipe_id('Site principal', 'Ligne 1')
  AND summary_text LIKE '[Démo]%';

DELETE FROM roulette_history
WHERE equipe_id = sqcdp_equipe_id('Site principal', 'Ligne 1');

DELETE FROM jour_etats
WHERE equipe_id IN (
  SELECT sqcdp_equipe_id('Site principal', n) FROM unnest(ARRAY['Ligne 1','Ligne 2']) AS n
)
AND date BETWEEN '2025-06-01' AND '2026-06-30';

-- ─── États journaliers — Ligne 1, juin 2025 ────────────────────────────────

INSERT INTO jour_etats (axe_id, equipe_id, date, etat) VALUES
-- Sécurité (S)
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-02', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-03', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-04', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-06', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', 'blocage'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-11', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-12', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-13', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-17', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', 'blocage'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-23', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-24', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-25', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-26', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-27', 'ok'),
-- Qualité (Q)
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-02', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-03', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-04', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-06', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-11', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-12', 'blocage'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-13', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-17', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', 'blocage'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-23', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-24', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-25', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-26', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-27', 'ok'),
-- Coût (C)
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-02', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-03', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-04', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', 'attention'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-11', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', 'attention'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-17', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', 'attention'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', 'blocage'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-23', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-24', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-25', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-26', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-27', 'attention'),
-- Délai (D)
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-02', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-03', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-04', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', 'blocage'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-11', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-12', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-17', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', 'blocage'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-23', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-24', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-25', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-26', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-27', 'attention'),
-- Personnel (P)
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-02', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-03', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-04', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-11', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-12', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-17', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-23', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-24', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-25', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-26', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-27', 'ok')
ON CONFLICT (axe_id, equipe_id, date) DO UPDATE SET etat = EXCLUDED.etat;

-- ─── États journaliers — Ligne 1, juin 2026 (scénario démo public) ─────────

INSERT INTO jour_etats (axe_id, equipe_id, date, etat) VALUES
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-02', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-03', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-04', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-05', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-09', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-10', 'blocage'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-11', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-12', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-16', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-17', 'attention'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-18', 'blocage'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-02', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-03', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-04', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-05', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-06', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-09', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-10', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-11', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-12', 'blocage'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-16', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-17', 'ok'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-19', 'blocage'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-02', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-03', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-04', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-05', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-09', 'attention'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-10', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-11', 'ok'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-16', 'attention'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-20', 'blocage'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-02', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-03', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-04', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-05', 'blocage'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-09', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-10', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-11', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-16', 'attention'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-18', 'blocage'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-02', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-03', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-04', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-05', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-09', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-10', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-11', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-12', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-16', 'attention'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-17', 'ok'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2026-06-20', 'attention')
ON CONFLICT (axe_id, equipe_id, date) DO UPDATE SET etat = EXCLUDED.etat;

-- ─── Ligne 2 — échantillon juin 2025 ───────────────────────────────────────

INSERT INTO jour_etats (axe_id, equipe_id, date, etat) VALUES
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-10', 'ok'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-17', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-10', 'attention'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-17', 'blocage'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-10', 'ok'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-10', 'blocage'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-10', 'ok')
ON CONFLICT (axe_id, equipe_id, date) DO UPDATE SET etat = EXCLUDED.etat;

-- ─── Actions ───────────────────────────────────────────────────────────────

INSERT INTO actions (
  axe_id, equipe_id, probleme, porteur, categorie, criticite, cause, solution,
  echeance, created_at, statut, code,
  pdca_plan, pdca_do, pdca_check, pdca_act
) VALUES
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Absence EPI zone expédition', 'Thomas Martin', 'Sécurité', 'Haute',
  'Stock EPI non réapprovisionné', 'Commande EPI + rappel consignes',
  '2025-06-18', '2025-06-10', 'ouverte', 'SEED-S-001',
  'Auditer stocks EPI', 'Commander 50 paires gants', 'Contrôle quotidien', 'Procédure réappro auto'),

(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Signalisation sol glissant allée 3', 'Marie Dupont', 'Sécurité', 'Moyenne',
  'Fuite hydraulique presse #4', 'Réparation fuite + panneau sol glissant',
  '2025-06-20', '2025-06-16', 'ouverte', 'SEED-S-002',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Non-conformité dimension pièce B12', 'Sophie Bernard', 'Qualité', 'Haute',
  'Usure outil de coupe', 'Remplacement outil + reprise lot',
  '2025-06-22', '2025-06-12', 'ouverte', 'SEED-Q-001',
  'Isoler lot B12', 'Changer outil', 'Contrôle 100% 50 pièces', 'Renforcer contrôle démarrage'),

(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Écart contrôle visuel lot 2847', 'Lucas Petit', 'Qualité', 'Basse',
  'Éclairage insuffisant poste', 'Ajout lampe LED + reclassement lot',
  '2025-06-14', '2025-06-05', 'fermee', 'SEED-Q-002',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Surconsommation matière ligne 2', 'Jean Moreau', 'Coût', 'Moyenne',
  'Rebuts élevés poste découpe', 'Réglage machine + formation opérateur',
  '2025-06-25', '2025-06-09', 'ouverte', 'SEED-C-001',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Retard livraison client ACME', 'Claire Dubois', 'Délai', 'Haute',
  'Panne convoyeur 45 min', 'Plan de secours transport interne',
  '2025-06-17', '2025-06-05', 'ouverte', 'SEED-D-001',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Goulot d''étranglement poste soudure', 'Pierre Leroy', 'Délai', 'Moyenne',
  'Absence opérateur qualifié', 'Renfort équipe B + polyvalence',
  '2025-06-19', '2025-06-11', 'ouverte', 'SEED-D-002',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Absence non remplacée équipe nuit', 'HR Manager', 'RH', 'Haute',
  'Maladie longue durée', 'Intérim + réorganisation planning',
  '2025-06-30', '2025-06-10', 'ouverte', 'SEED-P-001',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'),
  'Formation sécurité incomplète 2 opérateurs', 'Nathalie Roux', 'Formation', 'Moyenne',
  'Planning chargé', 'Sessions rattrapage vendredi',
  '2025-06-15', '2025-06-03', 'fermee', 'SEED-P-002',
  NULL, NULL, NULL, NULL),

(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 2'),
  'Extincteur périmé zone stockage', 'Paul Girard', 'Sécurité', 'Haute',
  'Maintenance préventive oubliée', 'Remplacement extincteurs lot A',
  '2025-06-28', '2025-06-15', 'ouverte', 'SEED-S-L2-001',
  NULL, NULL, NULL, NULL);

-- ─── Commentaires ────────────────────────────────────────────────────────────

INSERT INTO commentaires (axe_id, equipe_id, date, content) VALUES
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', '[Démo] Audit sécurité interne réalisé — 2 points à corriger'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', '[Démo] Rappel port des gants obligatoire poste découpe'),
(sqcdp_axe_id('S'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', '[Démo] Intervention maintenance presse #4 terminée'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-12', '[Démo] Reprise en cours sur lot B12 — 15 pièces isolées'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-06', '[Démo] Revue process contrôle OK après ajustement'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-19', '[Démo] Alerte client envoyée pour lot B12'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-09', '[Démo] Réunion achats planifiée jeudi pour matières'),
(sqcdp_axe_id('C'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', '[Démo] Rebuts en hausse — analyse en cours'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-05', '[Démo] Client ACME informé du retard — nouveau délai validé'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-16', '[Démo] OTD semaine à 87% — objectif 95%'),
(sqcdp_axe_id('D'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-18', '[Démo] Goulot soudure — 2 renforts affectés'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-10', '[Démo] Entretiens annuels en cours — 3 restants'),
(sqcdp_axe_id('P'), sqcdp_equipe_id('Site principal','Ligne 1'), '2025-06-20', '[Démo] Intérim confirmé pour 3 semaines'),
(sqcdp_axe_id('Q'), sqcdp_equipe_id('Site principal','Ligne 2'), '2025-06-17', '[Démo] Ligne 2 — arrêt qualité 2h ce matin');

-- ─── Daily reports + roulette ──────────────────────────────────────────────

INSERT INTO daily_reports (equipe_id, date, timer_sec, roulette, checklist, today_states, summary_text)
VALUES (
  sqcdp_equipe_id('Site principal', 'Ligne 1'),
  '2025-06-16',
  1245,
  '{"animateur":"Marie Dupont","securite":"Thomas Martin","qualite":"Sophie Bernard"}'::jsonb,
  '[{"id":"1","label":"Revue SQCDP","done":true},{"id":"2","label":"Actions ouvertes","done":true}]'::jsonb,
  '[{"axe_key":"S","etat":"attention"},{"axe_key":"Q","etat":"ok"},{"axe_key":"C","etat":"attention"},{"axe_key":"D","etat":"attention"},{"axe_key":"P","etat":"attention"}]'::jsonb,
  '[Démo] Daily du 16/06/2025 — Durée 20 min 45 s — 4 actions ouvertes — OTD 87%'
);

INSERT INTO roulette_history (equipe_id, results)
VALUES (
  sqcdp_equipe_id('Site principal', 'Ligne 1'),
  '{"animateur":"Marie Dupont","securite":"Thomas Martin","qualite":"Sophie Bernard","delai":"Pierre Leroy","cout":"Jean Moreau"}'::jsonb
);

-- ─── Nettoyage fonctions temporaires ─────────────────────────────────────────

DROP FUNCTION IF EXISTS sqcdp_equipe_id(TEXT, TEXT);
DROP FUNCTION IF EXISTS sqcdp_axe_id(CHAR);

-- Vérification rapide
SELECT 'jour_etats' AS table_name, COUNT(*) AS rows FROM jour_etats
UNION ALL SELECT 'actions', COUNT(*) FROM actions
UNION ALL SELECT 'commentaires', COUNT(*) FROM commentaires
UNION ALL SELECT 'daily_reports', COUNT(*) FROM daily_reports;

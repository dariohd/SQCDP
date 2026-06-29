-- RLS : utilisateurs authentifiés uniquement (login Supabase requis)

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jour_etats ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_history ENABLE ROW LEVEL SECURITY;

-- Sites
CREATE POLICY "sites_select" ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "sites_insert" ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sites_update" ON sites FOR UPDATE TO authenticated USING (true);

-- Équipes
CREATE POLICY "equipes_select" ON equipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "equipes_insert" ON equipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "equipes_update" ON equipes FOR UPDATE TO authenticated USING (true);

-- Axes (lecture seule pour les utilisateurs — seed SQL)
CREATE POLICY "axes_select" ON axes FOR SELECT TO authenticated USING (true);

-- États journaliers
CREATE POLICY "jour_etats_all" ON jour_etats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Commentaires
CREATE POLICY "commentaires_all" ON commentaires FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Actions
CREATE POLICY "actions_all" ON actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Paramètres UI
CREATE POLICY "app_params_all" ON app_params FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily reports
CREATE POLICY "daily_reports_all" ON daily_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Roulette
CREATE POLICY "roulette_all" ON roulette_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

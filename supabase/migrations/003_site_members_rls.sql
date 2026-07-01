-- SQCDP — isolation multi-tenant par site

CREATE TABLE IF NOT EXISTS site_members (
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id   UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_site_members_site ON site_members (site_id);

-- Rattacher les utilisateurs existants au site principal (migration one-shot)
INSERT INTO site_members (user_id, site_id, role)
SELECT u.id, s.id, 'member'
FROM auth.users u
CROSS JOIN sites s
WHERE s.name = 'Site principal'
ON CONFLICT DO NOTHING;

-- Nouveau site : le créateur devient admin
CREATE OR REPLACE FUNCTION public.add_site_creator_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO site_members (user_id, site_id, role)
    VALUES (auth.uid(), NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_site_created ON sites;
CREATE TRIGGER on_site_created
  AFTER INSERT ON sites
  FOR EACH ROW EXECUTE FUNCTION public.add_site_creator_as_member();

CREATE OR REPLACE FUNCTION public.user_site_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT site_id FROM site_members WHERE user_id = auth.uid();
$$;

-- RPC : rejoindre un site par nom (premier accès ou site sans membres)
CREATE OR REPLACE FUNCTION public.ensure_site_membership(p_site_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id UUID;
  v_member_count INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_site_id FROM sites WHERE name = p_site_name LIMIT 1;
  IF v_site_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM site_members WHERE user_id = auth.uid() AND site_id = v_site_id
  ) THEN
    RETURN v_site_id;
  END IF;

  SELECT COUNT(*)::INT INTO v_member_count FROM site_members WHERE site_id = v_site_id;

  IF v_member_count = 0 THEN
    INSERT INTO site_members (user_id, site_id, role)
    VALUES (auth.uid(), v_site_id, 'admin');
    RETURN v_site_id;
  END IF;

  -- Site déjà peuplé : pas d'auto-join (invitation admin requise)
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_site_membership(TEXT) TO authenticated;

ALTER TABLE site_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_members_select_own ON site_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Drop anciennes policies permissives
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'sites', 'equipes', 'axes', 'jour_etats', 'commentaires',
        'actions', 'app_params', 'daily_reports', 'roulette_history'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Sites
CREATE POLICY sites_select ON sites FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_site_ids()));

CREATE POLICY sites_insert ON sites FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY sites_update ON sites FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT site_id FROM site_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Équipes
CREATE POLICY equipes_select ON equipes FOR SELECT TO authenticated
  USING (site_id IN (SELECT public.user_site_ids()));

CREATE POLICY equipes_insert ON equipes FOR INSERT TO authenticated
  WITH CHECK (site_id IN (SELECT public.user_site_ids()));

CREATE POLICY equipes_update ON equipes FOR UPDATE TO authenticated
  USING (site_id IN (SELECT public.user_site_ids()));

-- Axes (globaux + par site)
CREATE POLICY axes_select ON axes FOR SELECT TO authenticated
  USING (site_id IS NULL OR site_id IN (SELECT public.user_site_ids()));

-- Données liées aux équipes
CREATE POLICY jour_etats_all ON jour_etats FOR ALL TO authenticated
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  )
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  );

CREATE POLICY commentaires_all ON commentaires FOR ALL TO authenticated
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  )
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  );

CREATE POLICY actions_all ON actions FOR ALL TO authenticated
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  )
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  );

CREATE POLICY app_params_all ON app_params FOR ALL TO authenticated
  USING (site_id IN (SELECT public.user_site_ids()))
  WITH CHECK (site_id IN (SELECT public.user_site_ids()));

CREATE POLICY daily_reports_all ON daily_reports FOR ALL TO authenticated
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  )
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  );

CREATE POLICY roulette_history_all ON roulette_history FOR ALL TO authenticated
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  )
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE e.site_id IN (SELECT public.user_site_ids())
    )
  );

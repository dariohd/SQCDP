-- SQCDP — invitations membres + durcissement création de sites
-- À exécuter APRÈS 001, 002 et 003.

-- Restreindre la création de sites : bootstrap (aucun membership) ou admin existant
DROP POLICY IF EXISTS sites_insert ON sites;
CREATE POLICY sites_insert ON sites FOR INSERT TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM site_members WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM site_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Lister les membres d'un site (admin uniquement)
CREATE OR REPLACE FUNCTION public.list_site_members(p_site_name TEXT)
RETURNS TABLE (email TEXT, role TEXT, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  SELECT s.id INTO v_site_id FROM sites s WHERE s.name = p_site_name LIMIT 1;
  IF v_site_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM site_members sm
    WHERE sm.site_id = v_site_id AND sm.user_id = auth.uid() AND sm.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Administrateur du site requis';
  END IF;

  RETURN QUERY
  SELECT u.email::TEXT, sm.role::TEXT, sm.user_id
  FROM site_members sm
  JOIN auth.users u ON u.id = sm.user_id
  WHERE sm.site_id = v_site_id
  ORDER BY u.email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_site_members(TEXT) TO authenticated;

-- Inviter un utilisateur déjà créé dans Auth (par email)
CREATE OR REPLACE FUNCTION public.invite_site_member(
  p_site_name TEXT,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id UUID;
  v_user_id UUID;
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  v_role := lower(coalesce(nullif(trim(p_role), ''), 'member'));
  IF v_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Rôle invalide';
  END IF;

  SELECT s.id INTO v_site_id FROM sites s WHERE s.name = p_site_name LIMIT 1;
  IF v_site_id IS NULL THEN
    RAISE EXCEPTION 'Site introuvable';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM site_members sm
    WHERE sm.site_id = v_site_id AND sm.user_id = auth.uid() AND sm.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Administrateur du site requis';
  END IF;

  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun compte Auth pour cet email. Créez d''abord l''utilisateur dans Supabase Authentication.';
  END IF;

  INSERT INTO site_members (user_id, site_id, role)
  VALUES (v_user_id, v_site_id, v_role)
  ON CONFLICT (user_id, site_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_site_member(TEXT, TEXT, TEXT) TO authenticated;

-- Rôle de l'utilisateur courant sur un site
CREATE OR REPLACE FUNCTION public.get_my_site_role(p_site_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT sm.role INTO v_role
  FROM site_members sm
  JOIN sites s ON s.id = sm.site_id
  WHERE sm.user_id = auth.uid() AND s.name = p_site_name
  LIMIT 1;

  RETURN v_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_site_role(TEXT) TO authenticated;

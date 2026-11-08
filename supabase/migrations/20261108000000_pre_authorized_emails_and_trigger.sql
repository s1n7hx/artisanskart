-- ==============================================================================
-- ArtisansKart: Pre-Authorization Table & On-Auth User Created Trigger
-- Migration: 20261108000000_pre_authorized_emails_and_trigger.sql
-- 
-- 1. Creates public.authorized_emails table (email TEXT PRIMARY KEY, role TEXT, studio_name TEXT)
-- 2. Sets RLS and table permissions for service_role, authenticated, and anon
-- 3. Updates handle_new_user() trigger on auth.users to automatically map pre-authorized
--    roles and studio names to public.profiles upon first Google OAuth sign-in
-- ==============================================================================

-- 1. Create public.authorized_emails table
CREATE TABLE IF NOT EXISTS public.authorized_emails (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'maker',
  studio_name TEXT DEFAULT '',
  name TEXT DEFAULT '',
  authorized_by TEXT DEFAULT 'ssumollah@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'maker';
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT '';
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS authorized_by TEXT DEFAULT 'ssumollah@gmail.com';
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.authorized_emails ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Grant Permissions
GRANT ALL ON TABLE public.authorized_emails TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.authorized_emails TO authenticated;
GRANT SELECT ON TABLE public.authorized_emails TO anon;

-- 3. Row Level Security Policies
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read authorized emails" ON public.authorized_emails;
DROP POLICY IF EXISTS "Admins and Master Admin manage authorized emails" ON public.authorized_emails;

CREATE POLICY "Public can read authorized emails"
  ON public.authorized_emails
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins and Master Admin manage authorized emails"
  ON public.authorized_emails
  FOR ALL
  TO authenticated
  USING (
    LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
    OR public.get_auth_role() = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- 4. Update handle_new_user() Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_email text;
  is_master boolean;
  user_full_name text;
  user_avatar text;
  assigned_role text;
  assigned_status text;
  assigned_school text;
  pre_auth RECORD;
BEGIN
  -- 1. Extract and sanitize email
  clean_email := LOWER(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')));

  -- 2. Extract full name safely with fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(clean_email, '@', 1)), ''),
    'User'
  );

  -- 3. Extract avatar URL safely
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- 4. Case-insensitive check for Master Admin
  is_master := (clean_email = 'ssumollah@gmail.com');

  IF is_master THEN
    assigned_role := 'admin';
    assigned_status := 'approved';
    assigned_school := 'ArtisansKart Platform Headquarters';
  ELSE
    -- Check if pre-authorized in public.authorized_emails
    BEGIN
      SELECT * INTO pre_auth FROM public.authorized_emails WHERE LOWER(TRIM(email)) = clean_email LIMIT 1;
    EXCEPTION
      WHEN OTHERS THEN
        pre_auth := NULL;
    END;

    IF pre_auth.email IS NOT NULL THEN
      assigned_role := COALESCE(NULLIF(pre_auth.role, ''), 'maker');
      assigned_status := 'approved';
      assigned_school := COALESCE(NULLIF(pre_auth.studio_name, ''), 'Independent Studio Guild');
      IF pre_auth.name IS NOT NULL AND pre_auth.name <> '' THEN
        user_full_name := pre_auth.name;
      END IF;
    ELSE
      assigned_role := 'customer';
      assigned_status := 'approved';
      assigned_school := '';
    END IF;
  END IF;

  -- 5. Safe upsert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    status,
    school,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    clean_email,
    user_full_name,
    user_avatar,
    assigned_role,
    assigned_status,
    assigned_school,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE profiles.full_name 
    END,
    avatar_url = CASE 
      WHEN profiles.avatar_url IS NULL OR profiles.avatar_url = '' THEN EXCLUDED.avatar_url 
      ELSE profiles.avatar_url 
    END,
    role = CASE 
      WHEN EXCLUDED.role IN ('admin', 'maker') THEN EXCLUDED.role 
      ELSE profiles.role 
    END,
    status = 'approved',
    school = CASE 
      WHEN EXCLUDED.school <> '' THEN EXCLUDED.school 
      ELSE profiles.school 
    END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user exception for user %: % (state: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- 5. Re-attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

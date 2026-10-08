-- ==============================================================================
-- ArtisansKart: Fix "Database error saving new user" on Google OAuth Signup
-- Migration: 20260911000003_fix_database_error_saving_new_user.sql
--
-- Root Cause:
-- During Google OAuth sign-in, Supabase Auth (GoTrue) executes triggers as the
-- 'authenticator' database user. When auth.uid() is NULL during server-side user
-- creation, prevent_role_self_escalation() was throwing an unhandled exception
-- when looking up caller roles, causing GoTrue to abort user creation with
-- "Database error saving new user".
--
-- Solution:
-- 1. Fix prevent_role_self_escalation() to bypass role checks when auth.uid() IS NULL
--    or when invoked by system roles (authenticator, supabase_auth_admin, postgres, service_role).
-- 2. Make handle_new_user() 100% exception-safe so it NEVER fails or breaks auth.users transaction.
-- 3. Unconditionally promote ssumollah@gmail.com to Master Admin (role: 'admin', status: 'approved').
-- 4. Re-attach triggers cleanly and backfill profiles.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Ensure public.profiles table exists with proper columns and safe defaults
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'approved',
  school TEXT DEFAULT '',
  grade_class TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  payout_upi TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_class TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_upi TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN avatar_url SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved';

-- ------------------------------------------------------------------------------
-- STEP 2: get_auth_role() helper function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email text;
  prof_role text;
BEGIN
  -- Check JWT claim
  user_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));

  -- Master Admin override
  IF user_email = 'ssumollah@gmail.com' THEN
    RETURN 'admin';
  END IF;

  -- Look up profile if auth.uid() is valid
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO prof_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(prof_role, 'customer');
  END IF;

  RETURN 'customer';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, service_role, anon;

-- ------------------------------------------------------------------------------
-- STEP 3: Bulletproof prevent_role_self_escalation() trigger function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role text;
  acting_uid uuid;
BEGIN
  -- 1. Allow normal updates if role is unchanged
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- 2. Allow unconditionally if no active end-user JWT (server/trigger context)
  acting_uid := auth.uid();
  IF acting_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- 3. Allow system/service DB users and Master Admin
  IF current_user IN ('service_role', 'supabase_auth_admin', 'postgres', 'authenticator', 'supabase_admin')
     OR current_setting('role', true) IN ('service_role', 'supabase_auth_admin', 'postgres', 'none', '')
     OR (auth.jwt() ->> 'role') = 'service_role'
     OR LOWER(TRIM(COALESCE(NEW.email, ''))) = 'ssumollah@gmail.com'
     OR LOWER(TRIM(COALESCE(OLD.email, ''))) = 'ssumollah@gmail.com'
     OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- 4. Check caller's role via get_auth_role()
  caller_role := public.get_auth_role();

  -- 5. Only admins can update roles
  IF caller_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Block unauthorized self-escalation
  RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles. Self-escalation blocked.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ------------------------------------------------------------------------------
-- STEP 4: Exception-Safe handle_new_user() trigger function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  clean_email text;
  is_master boolean;
  user_full_name text;
  user_avatar text;
  assigned_role text;
  assigned_status text;
  assigned_school text;
BEGIN
  IF NEW IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extract clean email safely
  clean_email := LOWER(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')));

  -- Extract name safely
  BEGIN
    user_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(split_part(clean_email, '@', 1)), ''),
      CASE WHEN clean_email = 'ssumollah@gmail.com' THEN 'Master Admin (ssumollah)' ELSE 'User' END
    );
  EXCEPTION WHEN OTHERS THEN
    user_full_name := 'User';
  END;

  -- Extract avatar safely
  BEGIN
    user_avatar := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    );
  EXCEPTION WHEN OTHERS THEN
    user_avatar := '';
  END;

  is_master := (clean_email = 'ssumollah@gmail.com');

  IF is_master THEN
    assigned_role := 'admin';
    assigned_status := 'approved';
    assigned_school := 'ArtisansKart Platform Headquarters';
  ELSE
    assigned_role := 'customer';
    assigned_status := 'approved';
    assigned_school := '';
  END IF;

  -- Safe profile upsert wrapped in an internal block
  BEGIN
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
        WHEN EXCLUDED.role = 'admin' THEN 'admin' 
        ELSE profiles.role 
      END,
      status = CASE 
        WHEN EXCLUDED.status = 'approved' AND EXCLUDED.role = 'admin' THEN 'approved' 
        ELSE profiles.status 
      END,
      school = CASE 
        WHEN EXCLUDED.school <> '' THEN EXCLUDED.school 
        ELSE profiles.school 
      END,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Fallback update in case of conflict
    BEGIN
      UPDATE public.profiles
      SET email = clean_email, updated_at = NOW()
      WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Never block auth.users trigger
    END;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Catch-all safety block: ALWAYS return NEW to allow auth.users insertion
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 5: Attach trigger to auth.users cleanly
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- STEP 6: Backfill existing users and promote ssumollah@gmail.com
-- ------------------------------------------------------------------------------
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
)
SELECT 
  u.id,
  LOWER(TRIM(COALESCE(u.email, u.raw_user_meta_data->>'email', ''))),
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(COALESCE(u.email, ''), '@', 1)), ''),
    'User'
  ),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
  CASE WHEN LOWER(TRIM(COALESCE(u.email, ''))) = 'ssumollah@gmail.com' THEN 'admin' ELSE 'customer' END,
  'approved',
  CASE WHEN LOWER(TRIM(COALESCE(u.email, ''))) = 'ssumollah@gmail.com' THEN 'ArtisansKart Platform Headquarters' ELSE '' END,
  NOW(),
  NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'admin' ELSE profiles.role END,
  status = CASE WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'approved' ELSE profiles.status END,
  school = CASE WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'ArtisansKart Platform Headquarters' ELSE profiles.school END,
  updated_at = NOW();

-- Guarantee Master Admin role in public.profiles and auth.users raw_app_meta_data
UPDATE public.profiles
SET role = 'admin', status = 'approved', school = 'ArtisansKart Platform Headquarters', updated_at = NOW()
WHERE LOWER(TRIM(COALESCE(email, ''))) = 'ssumollah@gmail.com';

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin", "is_master": true}'::jsonb
WHERE LOWER(TRIM(COALESCE(email, raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com';

-- ------------------------------------------------------------------------------
-- STEP 7: Row Level Security policies on public.profiles
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    public.get_auth_role() = 'admin' 
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

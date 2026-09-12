-- ==============================================================================
-- ArtisansKart: Master Admin Elevation & User Profile Sync
-- Migration: 20260911000002_master_admin_guarantee_and_backfill.sql
--
-- 1. Updates get_auth_role() to GUARANTEE ssumollah@gmail.com returns 'admin'
-- 2. Updates prevent_role_self_escalation() to allow Master Admin and service_role
-- 3. Updates handle_new_user() trigger function with safe upsert & auto-admin for ssumollah@gmail.com
-- 4. Attaches trigger AFTER INSERT OR UPDATE ON auth.users (so existing users get elevated on login!)
-- 5. Backfills all existing users from auth.users into public.profiles
-- 6. Immediately promotes ssumollah@gmail.com to 'admin' in profiles and auth.users claims
-- 7. Configures clean, permissive RLS policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Ensure profiles table schema has all needed columns with safe defaults
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
-- STEP 2: get_auth_role() Helper Function (GUARANTEES 'admin' for ssumollah@gmail.com)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  prof_role text;
BEGIN
  -- 1. Check JWT email claim
  user_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));

  -- 2. If JWT doesn't contain email, query auth.users directly
  IF user_email IS NULL OR user_email = '' THEN
    SELECT LOWER(TRIM(COALESCE(email, raw_user_meta_data->>'email', '')))
    INTO user_email
    FROM auth.users
    WHERE id = auth.uid();
  END IF;

  -- 3. Master Admin is ALWAYS guaranteed 'admin' role
  IF user_email = 'ssumollah@gmail.com' THEN
    RETURN 'admin';
  END IF;

  -- 4. Otherwise look up role in public.profiles
  SELECT role INTO prof_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(prof_role, 'customer');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, service_role, anon;

-- ------------------------------------------------------------------------------
-- STEP 3: prevent_role_self_escalation() Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role is unchanged, allow normal profile updates
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Unconditionally allow Supabase internal auth, Postgres superuser, service_role, and Master Admin
  IF current_user IN ('service_role', 'supabase_auth_admin', 'postgres') 
     OR current_setting('role', true) IN ('service_role', 'supabase_auth_admin', 'postgres')
     OR (auth.jwt() ->> 'role') = 'service_role'
     OR LOWER(TRIM(COALESCE(NEW.email, ''))) = 'ssumollah@gmail.com'
     OR LOWER(TRIM(COALESCE(OLD.email, ''))) = 'ssumollah@gmail.com'
     OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Look up existing role of the acting user
  caller_role := public.get_auth_role();

  -- Deny if not admin
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles. Self-escalation blocked.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ------------------------------------------------------------------------------
-- STEP 4: handle_new_user() Trigger Function
-- ------------------------------------------------------------------------------
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
BEGIN
  -- 1. Extract and sanitize email
  clean_email := LOWER(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')));

  -- 2. Extract full name safely with fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(clean_email, '@', 1)), ''),
    CASE WHEN clean_email = 'ssumollah@gmail.com' THEN 'Master Admin (ssumollah)' ELSE 'User' END
  );

  -- 3. Extract avatar URL safely
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- 4. Check Master Admin
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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user exception for user %: % (state: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 5: Attach trigger to auth.users (AFTER INSERT OR UPDATE)
-- Firing on UPDATE ensures existing users (like ssumollah@gmail.com) are synced on login!
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- STEP 6: BACKFILL & IMMEDIATE PROMOTION of ssumollah@gmail.com
-- ------------------------------------------------------------------------------

-- Backfill all auth.users into public.profiles
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
    CASE 
      WHEN LOWER(TRIM(COALESCE(u.email, u.raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com' 
      THEN 'Master Admin (ssumollah)' 
      ELSE 'User' 
    END
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    ''
  ),
  CASE 
    WHEN LOWER(TRIM(COALESCE(u.email, u.raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com' 
    THEN 'admin' 
    ELSE 'customer' 
  END,
  'approved',
  CASE 
    WHEN LOWER(TRIM(COALESCE(u.email, u.raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com' 
    THEN 'ArtisansKart Platform Headquarters' 
    ELSE '' 
  END,
  NOW(),
  NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE 
    WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'admin' 
    ELSE profiles.role 
  END,
  status = CASE 
    WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'approved' 
    ELSE profiles.status 
  END,
  school = CASE 
    WHEN LOWER(TRIM(COALESCE(EXCLUDED.email, ''))) = 'ssumollah@gmail.com' THEN 'ArtisansKart Platform Headquarters' 
    ELSE profiles.school 
  END,
  updated_at = NOW();

-- Directly ensure ssumollah@gmail.com is admin in public.profiles
UPDATE public.profiles
SET 
  role = 'admin',
  status = 'approved',
  school = 'ArtisansKart Platform Headquarters',
  updated_at = NOW()
WHERE LOWER(TRIM(COALESCE(email, ''))) = 'ssumollah@gmail.com'
   OR id IN (
     SELECT id FROM auth.users 
     WHERE LOWER(TRIM(COALESCE(email, raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com'
   );

-- Also add admin role claim into auth.users raw_app_meta_data so the JWT issued by Supabase has role = 'admin'
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin", "is_master": true}'::jsonb
WHERE LOWER(TRIM(COALESCE(email, raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com';

-- ------------------------------------------------------------------------------
-- STEP 7: Permissions and Row Level Security on public.profiles
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

-- Allow reading profiles (storefront, admin portal, maker profiles)
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins and ssumollah@gmail.com full administrative access to all profiles
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    public.get_auth_role() = 'admin' 
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

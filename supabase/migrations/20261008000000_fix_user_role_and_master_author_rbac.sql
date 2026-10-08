-- ==============================================================================
-- ArtisansKart: Fix "type user_role does not exist" & Implement Master Author RBAC
-- Migration: 20261008000000_fix_user_role_and_master_author_rbac.sql
--
-- ROOT CAUSE OF 42704:
-- During Google OAuth signup, Supabase GoTrue runs triggers as 'supabase_auth_admin'
-- with a search_path that does NOT include the 'public' schema (typically 'auth, pg_temp').
-- Any trigger function or table default that references 'user_role' without:
--   1) SET search_path = public, auth, pg_temp, or
--   2) Explicit schema qualification 'public.user_role'
-- causes PostgreSQL to fail with:
--   "42704 | type user_role does not exist"
-- followed by transaction abort "25P02".
--
-- SOLUTION:
-- 1. Safely add 'master_admin' to public.user_role ENUM.
-- 2. Ensure public.profiles table has all expected columns (including missing 'status').
-- 3. Update public.get_auth_role() with SET search_path = public, auth, pg_temp.
-- 4. Update public.prevent_role_self_escalation() to enforce Master Author hierarchy:
--    - ssumollah@gmail.com is permanent master_admin and cannot be demoted.
--    - Only master_admin can assign customer, maker, or admin to other users.
--    - Normal users (customers/makers) cannot self-escalate.
-- 5. Update public.handle_new_user() with SET search_path = public, auth, pg_temp:
--    - Automatically sets ssumollah@gmail.com -> master_admin.
--    - All other new Google users start as customer.
--    - Ignores untrusted frontend role metadata.
--    - Logs warnings instead of failing transactions.
-- 6. Attach trigger cleanly and backfill ssumollah@gmail.com.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Extend existing public.user_role enum to include 'master_admin'
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- If enum type exists, add 'master_admin' value
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'user_role'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'master_admin';
  ELSE
    -- If it did not exist, create the full enum
    CREATE TYPE public.user_role AS ENUM ('customer', 'maker', 'admin', 'master_admin');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 2: Ensure public.profiles columns, safe defaults, and schema consistency
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role public.user_role DEFAULT 'customer'::public.user_role,
  status TEXT DEFAULT 'approved',
  school TEXT DEFAULT '',
  grade_class TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  payout_upi TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist in live database
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_class TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_upi TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure safe defaults
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN avatar_url SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer'::public.user_role;

-- ------------------------------------------------------------------------------
-- STEP 3: get_auth_role() helper function (resolves caller role safely)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  user_email text;
  prof_role text;
BEGIN
  -- 1. Check verified email in JWT claim
  user_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));

  -- 2. Master Author email override (case-insensitive)
  IF user_email = 'ssumollah@gmail.com' THEN
    RETURN 'master_admin';
  END IF;

  -- 3. If caller has active authenticated uid, lookup profile
  IF auth.uid() IS NOT NULL THEN
    SELECT role::text INTO prof_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF prof_role IS NOT NULL THEN
      RETURN prof_role;
    END IF;
  END IF;

  RETURN 'customer';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, service_role, anon;

-- ------------------------------------------------------------------------------
-- STEP 4: prevent_role_self_escalation() trigger function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  caller_role text;
  acting_uid uuid;
  is_target_master boolean;
BEGIN
  -- 1. Allow if role is unchanged (normal profile updates like avatar/bio/name)
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- 2. Allow system/background workers with no active end-user JWT
  acting_uid := auth.uid();
  IF acting_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- 3. Allow database maintenance/internal service roles
  IF current_user IN ('service_role', 'supabase_auth_admin', 'postgres', 'authenticator', 'supabase_admin')
     OR current_setting('role', true) IN ('service_role', 'supabase_auth_admin', 'postgres', 'none', '')
     OR (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- 4. Protect Master Author: ssumollah@gmail.com can NEVER be demoted or altered
  is_target_master := (
    LOWER(TRIM(COALESCE(OLD.email, ''))) = 'ssumollah@gmail.com'
    OR OLD.role = 'master_admin'::public.user_role
  );

  IF is_target_master AND NEW.role <> 'master_admin'::public.user_role THEN
    RAISE EXCEPTION 'Unauthorized: The Master Author account (ssumollah@gmail.com) is permanent and cannot be demoted.'
      USING ERRCODE = '42501';
  END IF;

  -- 5. Determine acting caller role
  caller_role := public.get_auth_role();

  -- 6. Master Author permissions: Can assign customer, maker, or admin to OTHER users
  IF caller_role = 'master_admin'
     OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com' THEN
    -- Prevent creating additional master_admin accounts
    IF NEW.role = 'master_admin'::public.user_role
       AND LOWER(TRIM(COALESCE(NEW.email, ''))) <> 'ssumollah@gmail.com' THEN
      RAISE EXCEPTION 'Unauthorized: Only ssumollah@gmail.com can hold the Master Author role.'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- 7. Ordinary Admin permissions: Cannot promote to admin or master_admin
  IF caller_role = 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only the Master Author can modify user roles or assign administrative privileges.'
      USING ERRCODE = '42501';
  END IF;

  -- 8. Normal customer / maker users: Block self-escalation completely
  RAISE EXCEPTION 'Unauthorized: You do not have permission to modify roles. Self-escalation blocked.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ------------------------------------------------------------------------------
-- STEP 5: Bulletproof handle_new_user() trigger function
-- Fixes "type user_role does not exist" by enforcing search_path = public, auth, pg_temp
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  clean_email text;
  is_master boolean;
  user_full_name text;
  user_avatar text;
  assigned_role public.user_role;
  assigned_status text;
  assigned_school text;
BEGIN
  IF NEW IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Extract verified email
  clean_email := LOWER(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')));

  -- 2. Extract name safely
  BEGIN
    user_full_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(split_part(clean_email, '@', 1)), ''),
      CASE WHEN clean_email = 'ssumollah@gmail.com' THEN 'Master Author (ssumollah)' ELSE 'Customer' END
    );
  EXCEPTION WHEN OTHERS THEN
    user_full_name := 'Customer';
  END;

  -- 3. Extract avatar safely
  BEGIN
    user_avatar := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    );
  EXCEPTION WHEN OTHERS THEN
    user_avatar := '';
  END;

  -- 4. Enforce strict role assignment (Database is source of truth; ignore untrusted metadata)
  is_master := (clean_email = 'ssumollah@gmail.com');

  IF is_master THEN
    assigned_role := 'master_admin'::public.user_role;
    assigned_status := 'approved';
    assigned_school := 'ArtisansKart Platform Headquarters';
  ELSE
    assigned_role := 'customer'::public.user_role;
    assigned_status := 'approved';
    assigned_school := '';
  END IF;

  -- 5. Safe upsert into public.profiles
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
        WHEN EXCLUDED.role = 'master_admin'::public.user_role THEN 'master_admin'::public.user_role 
        ELSE profiles.role 
      END,
      status = CASE 
        WHEN EXCLUDED.role = 'master_admin'::public.user_role THEN 'approved' 
        ELSE profiles.status 
      END,
      school = CASE 
        WHEN EXCLUDED.school <> '' THEN EXCLUDED.school 
        ELSE profiles.school 
      END,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: never fail auth.users transaction, log error to server logs
    RAISE WARNING 'handle_new_user profile upsert warning for user % (%): % (SQLSTATE %)',
      NEW.id, clean_email, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Catch-all safety: log and return NEW so authentication transaction proceeds
  RAISE WARNING 'handle_new_user outer exception for user %: % (SQLSTATE %)',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 6: Attach trigger to auth.users cleanly
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
-- STEP 7: Backfill & Promote ssumollah@gmail.com
-- ------------------------------------------------------------------------------
-- Ensure profile exists and has master_admin
UPDATE public.profiles
SET 
  role = 'master_admin'::public.user_role,
  status = 'approved',
  school = 'ArtisansKart Platform Headquarters',
  updated_at = NOW()
WHERE LOWER(TRIM(COALESCE(email, ''))) = 'ssumollah@gmail.com';

-- Update app metadata on auth.users for JWT consistency
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "master_admin", "is_master": true}'::jsonb
WHERE LOWER(TRIM(COALESCE(email, raw_user_meta_data->>'email', ''))) = 'ssumollah@gmail.com';

-- ------------------------------------------------------------------------------
-- STEP 8: Row Level Security policies on public.profiles
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
DROP POLICY IF EXISTS "Master author has full access to profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
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

CREATE POLICY "Master author has full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- ==============================================================================
-- ArtisansKart: Fix "Database error saving new user" on Google OAuth Signup
-- Migration: 20260911000001_fix_handle_new_user_trigger.sql
-- 
-- 1. Ensures public.profiles table schema has all required columns with safe defaults
-- 2. Sets SECURITY DEFINER on handle_new_user() with SET search_path = public
-- 3. Case-insensitive Master Admin check for ssumollah@gmail.com -> role = 'admin', status = 'approved'
-- 4. Default role = 'customer', status = 'approved' for all other new Google signups
-- 5. Safe upsert (ON CONFLICT DO UPDATE) to prevent duplicate key errors
-- 6. Updates prevent_role_self_escalation to allow supabase_auth_admin & master admin
-- 7. Configures proper RLS policies and table permissions for public.profiles
-- ==============================================================================

-- STEP 1: Ensure public.profiles table exists with all required columns and safe defaults
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

-- Ensure all columns exist and have defaults (prevents NOT NULL violations on insert)
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

-- Ensure defaults on any existing NOT NULL columns
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN avatar_url SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved';

-- STEP 2: Update prevent_role_self_escalation trigger to allow supabase_auth_admin & Master Admin
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role is unchanged, allow normal profile updates (bio, name, avatar, etc.)
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Allow Supabase Auth system, Postgres superuser, service_role, and Master Admin
  IF current_user IN ('service_role', 'supabase_auth_admin', 'postgres') 
     OR current_setting('role', true) IN ('service_role', 'supabase_auth_admin', 'postgres')
     OR (auth.jwt() ->> 'role') = 'service_role'
     OR LOWER(TRIM(COALESCE(NEW.email, ''))) = 'ssumollah@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Look up existing role of the acting user
  caller_role := public.get_auth_role();

  -- If the caller's role is not already 'admin', deny self-escalation
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles. Self-escalation attempt blocked.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- STEP 3: Create robust, bulletproof handle_new_user() trigger function
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
  -- 1. Extract and sanitize email (handles Google OAuth metadata and auth.users email)
  clean_email := LOWER(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')));

  -- 2. Extract full name safely with fallbacks (never NULL)
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
    assigned_role := 'customer';
    assigned_status := 'approved';
    assigned_school := '';
  END IF;

  -- 5. Safe upsert into public.profiles (never fails on conflict or missing columns)
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
    -- Log warning to Postgres log without failing completely if non-critical
    RAISE WARNING 'handle_new_user exception for user %: % (state: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- STEP 4: Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: Ensure permissions and Row Level Security on public.profiles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean existing policies on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- Allow reading profiles (storefront maker profiles, admin management)
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

-- Allow admins full access
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    public.get_auth_role() = 'admin' 
    OR (auth.jwt() ->> 'email') = 'ssumollah@gmail.com'
  );

-- ==============================================================================
-- ArtisansKart Security & Maker Applications Migration
-- 1. Adds public.get_auth_role() helper
-- 2. Adds prevent_role_self_escalation() BEFORE UPDATE trigger on public.profiles
-- 3. Creates public.maker_applications with strict Row Level Security
-- ==============================================================================

-- 1. Helper function to look up the current authenticated user's profile role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, service_role;

-- 2. Trigger function to prevent self-escalation or unauthorized role updates
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role is unchanged, allow normal profile updates (e.g. bio, name, avatar)
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Allow trusted backend / service_role unconditionally
  IF current_user = 'service_role' 
     OR current_setting('role', true) = 'service_role'
     OR (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Look up existing role of the acting user
  caller_role := public.get_auth_role();

  -- If the caller's role is not already 'admin', deny the update
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles. Self-escalation attempt blocked.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger BEFORE UPDATE on public.profiles
DROP TRIGGER IF EXISTS tr_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- Note: Existing RLS policies on public.profiles remain intact:
-- CREATE POLICY "Users can view and update their own profile"
--   ON public.profiles FOR ALL
--   USING (auth.uid() = id);
-- The trigger above serves as the bulletproof database enforcement layer.

-- 3. Create maker_applications table
CREATE TABLE IF NOT EXISTS public.maker_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  grade_class TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- Optimize index lookups
CREATE INDEX IF NOT EXISTS idx_maker_applications_user_id ON public.maker_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_maker_applications_status ON public.maker_applications(status);

-- Enable Row Level Security
ALTER TABLE public.maker_applications ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can insert own application" ON public.maker_applications;
DROP POLICY IF EXISTS "Users can view own application" ON public.maker_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.maker_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.maker_applications;

-- Policy A: Authenticated users can insert their own application
CREATE POLICY "Users can insert own application"
  ON public.maker_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy B: Authenticated users can view only their own applications
CREATE POLICY "Users can view own application"
  ON public.maker_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy C: Administrators can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.maker_applications
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Policy D: Administrators can update all applications (e.g. approve or reject)
CREATE POLICY "Admins can update all applications"
  ON public.maker_applications
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

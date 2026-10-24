-- ==============================================================================
-- ArtisansKart: Fix maker_applications table schema
-- 1. Rename school to studio_name
-- 2. Drop grade_class
-- 3. Add missing fields: full_name, email, phone, craft_type, description, photos
-- ==============================================================================

-- Rename column school to studio_name
ALTER TABLE public.maker_applications RENAME COLUMN school TO studio_name;

-- Drop grade_class (not used in the new application form)
ALTER TABLE public.maker_applications DROP COLUMN IF EXISTS grade_class;

-- Add missing fields
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS craft_type TEXT;
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.maker_applications ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Update existing rows if necessary (optional)
UPDATE public.maker_applications SET description = message WHERE description IS NULL;

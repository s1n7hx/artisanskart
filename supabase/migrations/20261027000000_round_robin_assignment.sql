-- Migration: Round-Robin Order Assignment System
-- Adds maker availability and assignment tracking, updates order items for maker isolation.

-- 1. Extend profiles with maker availability and assignment tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_available') THEN
    ALTER TABLE public.profiles ADD COLUMN is_available BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='last_assigned_at') THEN
    ALTER TABLE public.profiles ADD COLUMN last_assigned_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 2. Ensure order_items has maker_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='maker_id') THEN
    ALTER TABLE public.order_items ADD COLUMN maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Update RLS policies for order_items for Maker Isolation
-- Makers should ONLY see order_items assigned to them.
DROP POLICY IF EXISTS "Makers can view their own order items" ON public.order_items;
CREATE POLICY "Makers can view their own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    maker_id = auth.uid()
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

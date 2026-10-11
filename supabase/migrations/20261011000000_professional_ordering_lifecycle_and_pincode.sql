-- ==============================================================================
-- Migration: ArtisansKart Professional Ordering Lifecycle, Pincode Intelligence,
--            Maker Production Workflow & Audit Logs
-- File: supabase/migrations/20261011000000_professional_ordering_lifecycle_and_pincode.sql
-- ==============================================================================

-- 1. Extend products table with variants, crafting prep time, origin and dimensions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='variants') THEN
    ALTER TABLE public.products ADD COLUMN variants JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='prep_time_days') THEN
    ALTER TABLE public.products ADD COLUMN prep_time_days INT DEFAULT 2;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='origin_city') THEN
    ALTER TABLE public.products ADD COLUMN origin_city TEXT DEFAULT 'New Delhi';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='pickup_pincode') THEN
    ALTER TABLE public.products ADD COLUMN pickup_pincode TEXT DEFAULT '110016';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_made_to_order') THEN
    ALTER TABLE public.products ADD COLUMN is_made_to_order BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='color') THEN
    ALTER TABLE public.products ADD COLUMN color TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='weight_kg') THEN
    ALTER TABLE public.products ADD COLUMN weight_kg NUMERIC DEFAULT 0.5;
  END IF;
END $$;

-- 2. Extend orders table to support the 13-stage handmade lifecycle and maker assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='maker_id') THEN
    ALTER TABLE public.orders ADD COLUMN maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='acceptance_deadline') THEN
    ALTER TABLE public.orders ADD COLUMN acceptance_deadline TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='accepted_at') THEN
    ALTER TABLE public.orders ADD COLUMN accepted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='rejection_reason') THEN
    ALTER TABLE public.orders ADD COLUMN rejection_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='confirmed_prep_days') THEN
    ALTER TABLE public.orders ADD COLUMN confirmed_prep_days INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='parcel_weight_kg') THEN
    ALTER TABLE public.orders ADD COLUMN parcel_weight_kg NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='parcel_dimensions') THEN
    ALTER TABLE public.orders ADD COLUMN parcel_dimensions TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='pickup_pincode') THEN
    ALTER TABLE public.orders ADD COLUMN pickup_pincode TEXT DEFAULT '110016';
  END IF;
END $$;

-- 3. Maker Pickup Locations Table (Configurable origin per maker)
CREATE TABLE IF NOT EXISTS public.maker_pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_nickname TEXT NOT NULL DEFAULT 'Primary Studio Hub',
  pincode TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  is_verified_by_admin BOOLEAN DEFAULT false,
  shiprocket_pickup_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maker_pickup_maker ON public.maker_pickup_locations(maker_id);
ALTER TABLE public.maker_pickup_locations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.maker_pickup_locations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.maker_pickup_locations TO authenticated;

DROP POLICY IF EXISTS "Makers manage own pickup locations" ON public.maker_pickup_locations;
CREATE POLICY "Makers manage own pickup locations" ON public.maker_pickup_locations
  FOR ALL TO authenticated
  USING (
    maker_id = auth.uid()
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- 4. Order Status Audit History & Workflow Transitions Table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'System',
  actor_role TEXT NOT NULL DEFAULT 'system',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.order_status_history TO postgres, service_role;
GRANT SELECT ON TABLE public.order_status_history TO authenticated;
GRANT INSERT ON TABLE public.order_status_history TO authenticated;

DROP POLICY IF EXISTS "Order history visible to order stakeholders" ON public.order_status_history;
CREATE POLICY "Order history visible to order stakeholders" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
      AND (
        o.user_id = auth.uid()
        OR o.maker_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.order_items oi
          WHERE oi.order_id = o.id AND oi.maker_id = auth.uid()
        )
      )
    )
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- 5. Platform Wide Settings Table (Shipping defaults, deadlines, return policies)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.platform_settings TO postgres, service_role;
GRANT SELECT ON TABLE public.platform_settings TO anon, authenticated;
GRANT ALL ON TABLE public.platform_settings TO authenticated;

DROP POLICY IF EXISTS "Public can view platform settings" ON public.platform_settings;
CREATE POLICY "Public can view platform settings" ON public.platform_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
  FOR ALL TO authenticated
  USING (
    public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- Seed initial default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES
  ('shipping', '{"default_shipping_fee": 49, "free_shipping_threshold": 499, "express_shipping_fee": 99}'::jsonb, 'Shipping rate thresholds'),
  ('maker_workflow', '{"acceptance_deadline_hours": 24, "default_prep_days": 3, "auto_reassign_on_timeout": false}'::jsonb, 'Maker acceptance and crafting defaults'),
  ('policies', '{"return_window_days": 7, "cancellation_window_hours": 12, "replacement_enabled": true}'::jsonb, 'Customer return and cancellation policies')
ON CONFLICT (setting_key) DO NOTHING;

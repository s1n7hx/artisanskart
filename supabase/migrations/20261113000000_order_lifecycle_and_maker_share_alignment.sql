-- ==============================================================================
-- Migration: ArtisansKart Order Lifecycle & Commission Alignment
-- File: supabase/migrations/20261113000000_order_lifecycle_and_maker_share_alignment.sql
--
-- IMPORTANT INTEGRITY GUARANTEES:
-- 1. Preserves public.orders.maker_share_amount NUMERIC NOT NULL constraint
--    (does NOT weaken NOT NULL and does NOT add a 0 fallback default).
-- 2. Idempotently adds extended order lifecycle, payment, tracking, and
--    per-item maker share columns to match backend order persistence.
-- 3. Ensures indexes and strict SELECT RLS policies for customers, makers,
--    and administrators while keeping writes server-side via service_role.
-- ==============================================================================

DO $$
BEGIN
  -- 1. Extend public.orders safely without altering maker_share_amount NOT NULL constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='maker_earning_percent') THEN
    ALTER TABLE public.orders ADD COLUMN maker_earning_percent NUMERIC DEFAULT 65;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='items_total') THEN
    ALTER TABLE public.orders ADD COLUMN items_total NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='packaging_fee') THEN
    ALTER TABLE public.orders ADD COLUMN packaging_fee NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_fee') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_fee NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='discount_amount') THEN
    ALTER TABLE public.orders ADD COLUMN discount_amount NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='coupon_code') THEN
    ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_method') THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'razorpay';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_gateway_order_id') THEN
    ALTER TABLE public.orders ADD COLUMN payment_gateway_order_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_gateway_payment_id') THEN
    ALTER TABLE public.orders ADD COLUMN payment_gateway_payment_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='tracking_awb') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_awb TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='courier_name') THEN
    ALTER TABLE public.orders ADD COLUMN courier_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='lifecycle_status') THEN
    ALTER TABLE public.orders ADD COLUMN lifecycle_status TEXT DEFAULT 'awaiting_maker_acceptance';
  END IF;

  -- 2. Extend public.order_items safely
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='maker_id') THEN
    ALTER TABLE public.order_items ADD COLUMN maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='maker_name') THEN
    ALTER TABLE public.order_items ADD COLUMN maker_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='maker_earning_percent') THEN
    ALTER TABLE public.order_items ADD COLUMN maker_earning_percent NUMERIC DEFAULT 65;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='maker_share_amount') THEN
    ALTER TABLE public.order_items ADD COLUMN maker_share_amount NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='image_url') THEN
    ALTER TABLE public.order_items ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='production_status') THEN
    ALTER TABLE public.order_items ADD COLUMN production_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 3. Helpful performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number_lookup ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id_lookup ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_maker_id_lookup ON public.orders(assigned_maker_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_lookup ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id_lookup ON public.order_items(product_id);

-- 4. Authenticated read policies aligned with customer_id / assigned_maker_id / admin roles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP POLICY IF EXISTS "Customers and makers can view authorized orders" ON public.orders;
    CREATE POLICY "Customers and makers can view authorized orders" ON public.orders
      FOR SELECT TO authenticated
      USING (
        auth.uid() = customer_id
        OR auth.uid() = assigned_maker_id
        OR LOWER(TRIM(COALESCE(customer_email, ''))) = LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')))
        OR public.get_auth_role() IN ('master_admin', 'admin')
        OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
      );
  END IF;
END $$;

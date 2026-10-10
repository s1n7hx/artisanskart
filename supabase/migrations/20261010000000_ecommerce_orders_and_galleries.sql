-- ==============================================================================
-- Migration: E-commerce Product Galleries, Orders, Addresses & Shiprocket
-- File: supabase/migrations/20261010000000_ecommerce_orders_and_galleries.sql
-- ==============================================================================

-- 1. Extend products table with gallery images, specifications & stock
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 1,
  maker_name TEXT NOT NULL,
  maker_school TEXT DEFAULT 'Fine Arts Studio',
  image_url TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  stock_status TEXT DEFAULT 'In Stock • Made to order',
  description TEXT DEFAULT '',
  original_price NUMERIC,
  materials TEXT,
  dimensions TEXT,
  weight TEXT,
  care_instructions TEXT,
  in_stock_count INT DEFAULT 15,
  slug TEXT,
  maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case products already existed, safely add columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='gallery_images') THEN
    ALTER TABLE public.products ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='original_price') THEN
    ALTER TABLE public.products ADD COLUMN original_price NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='materials') THEN
    ALTER TABLE public.products ADD COLUMN materials TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='dimensions') THEN
    ALTER TABLE public.products ADD COLUMN dimensions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='weight') THEN
    ALTER TABLE public.products ADD COLUMN weight TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='care_instructions') THEN
    ALTER TABLE public.products ADD COLUMN care_instructions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='in_stock_count') THEN
    ALTER TABLE public.products ADD COLUMN in_stock_count INT DEFAULT 15;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='slug') THEN
    ALTER TABLE public.products ADD COLUMN slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='maker_id') THEN
    ALTER TABLE public.products ADD COLUMN maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.products TO postgres, service_role;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Makers and Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Makers and Admins can update products" ON public.products;

CREATE POLICY "Public can view products" ON public.products
  FOR SELECT TO public USING (true);

CREATE POLICY "Makers and Admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_auth_role() IN ('master_admin', 'admin', 'maker')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

CREATE POLICY "Makers and Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (
    public.get_auth_role() IN ('master_admin', 'admin')
    OR maker_id = auth.uid()
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- 2. Customer Saved Addresses Table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pincode TEXT NOT NULL,
  building_house TEXT NOT NULL,
  street_address TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON public.customer_addresses(user_id);
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.customer_addresses TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer_addresses TO authenticated;

DROP POLICY IF EXISTS "Users can manage own addresses" ON public.customer_addresses;
CREATE POLICY "Users can manage own addresses" ON public.customer_addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Production Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items_total NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_production', 'ready', 'shipped', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cod')),
  payment_method TEXT NOT NULL DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay', 'upi', 'card', 'netbanking', 'cod', 'test_gateway')),
  payment_gateway_order_id TEXT,
  payment_gateway_payment_id TEXT,
  tracking_awb TEXT,
  courier_name TEXT,
  shipment_id TEXT,
  estimated_delivery TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.orders TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.orders TO anon, authenticated;
GRANT UPDATE ON TABLE public.orders TO authenticated;

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL TO authenticated
  USING (
    public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- 4. Order Items Table (Immutable Snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT,
  title TEXT NOT NULL,
  image_url TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  maker_name TEXT NOT NULL,
  maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  maker_earning_percent NUMERIC NOT NULL DEFAULT 65,
  maker_share_amount NUMERIC NOT NULL DEFAULT 0,
  production_status TEXT NOT NULL DEFAULT 'pending' CHECK (production_status IN ('pending', 'in_production', 'ready_for_pickup', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_maker ON public.order_items(maker_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.order_items TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.order_items TO anon, authenticated;
GRANT UPDATE ON TABLE public.order_items TO authenticated;

DROP POLICY IF EXISTS "Order items visible to order owner or maker or admin" ON public.order_items;
CREATE POLICY "Order items visible to order owner or maker or admin" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
    OR maker_id = auth.uid()
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and assigned makers can update order items" ON public.order_items
  FOR UPDATE TO authenticated
  USING (
    maker_id = auth.uid()
    OR public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

-- 5. Shiprocket Order Shipments Table
CREATE TABLE IF NOT EXISTS public.order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  awb_code TEXT,
  courier_company_id TEXT,
  courier_name TEXT,
  status TEXT DEFAULT 'pending',
  tracking_url TEXT,
  label_url TEXT,
  manifest_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_shipments_order ON public.order_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipments_awb ON public.order_shipments(awb_code);

ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.order_shipments TO postgres, service_role;
GRANT SELECT ON TABLE public.order_shipments TO authenticated;
GRANT ALL ON TABLE public.order_shipments TO authenticated;

CREATE POLICY "Admins have full access to shipments" ON public.order_shipments
  FOR ALL TO authenticated
  USING (
    public.get_auth_role() IN ('master_admin', 'admin')
    OR LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'ssumollah@gmail.com'
  );

CREATE POLICY "Customers can view shipments for own orders" ON public.order_shipments
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_shipments.order_id AND o.user_id = auth.uid())
  );

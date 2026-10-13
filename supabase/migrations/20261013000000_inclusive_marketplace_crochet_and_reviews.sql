-- ==============================================================================
-- Migration: Inclusive Marketplace, Multi-Image Galleries, Crochet & Reviews
-- File: supabase/migrations/20261013000000_inclusive_marketplace_crochet_and_reviews.sql
-- ==============================================================================

-- 1. Ensure products table supports multi-image galleries, dimensions, and materials
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') THEN
    CREATE TABLE public.products (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category_name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      rating NUMERIC DEFAULT 0,
      reviews_count INT DEFAULT 0,
      maker_name TEXT NOT NULL,
      maker_school TEXT DEFAULT 'Creative Studio',
      image_url TEXT NOT NULL,
      gallery_images TEXT[] DEFAULT '{}',
      stock_status TEXT DEFAULT 'In Stock • Made on Demand',
      description TEXT DEFAULT '',
      materials TEXT,
      dimensions TEXT,
      weight TEXT,
      in_stock_count INT DEFAULT 15,
      slug TEXT,
      maker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='gallery_images') THEN
      ALTER TABLE public.products ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
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
  END IF;
END $$;

-- 2. Genuine Customer Product Reviews Table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id BIGINT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  comment TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.product_reviews TO postgres, service_role;
GRANT SELECT ON TABLE public.product_reviews TO anon, authenticated;
GRANT INSERT ON TABLE public.product_reviews TO authenticated;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
CREATE POLICY "Public can view approved reviews" ON public.product_reviews
  FOR SELECT TO public
  USING (is_approved = true);

DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can submit reviews" ON public.product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 3. Valid Promotional Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  usage_limit INT,
  times_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.coupons TO postgres, service_role;
GRANT SELECT ON TABLE public.coupons TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can check coupons" ON public.coupons;
CREATE POLICY "Anyone can check coupons" ON public.coupons
  FOR SELECT TO public
  USING (is_active = true);

-- Seed legitimate active promotional coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES
  ('WELCOME10', 'percentage', 10, 499, 100, true),
  ('CREATOR50', 'flat', 50, 399, 50, true),
  ('HANDMADE15', 'percentage', 15, 999, 200, true)
ON CONFLICT (code) DO NOTHING;

-- 4. Inclusive Creative Platform Settings
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES
  ('branding', '{"tagline": "Made by creators. Chosen by you.", "audience": "all_creators", "crochet_enabled": true}'::jsonb, 'Creative marketplace branding configuration')
ON CONFLICT (setting_key) DO UPDATE
  SET setting_value = EXCLUDED.setting_value,
      description = EXCLUDED.description;

-- ==============================================================================
-- THE WEAVE ATELIER — PRODUCTION ROW LEVEL SECURITY (RLS) HARDENING
-- Migration: 20260918_harden_admin_security_rls.sql
-- Safe Migration: No custom functions or schema DDL privileges required.
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure standard schema usage for Supabase API roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Drop all previous permissive policies
DROP POLICY IF EXISTS "Public read access for collections" ON public.collections;
DROP POLICY IF EXISTS "Admin full access for collections" ON public.collections;
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
DROP POLICY IF EXISTS "Admin write collections" ON public.collections;

DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Admin full access for products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;

DROP POLICY IF EXISTS "Public read access for product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin full access for product_images" ON public.product_images;
DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin write product_images" ON public.product_images;

DROP POLICY IF EXISTS "Public read access for product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin full access for product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public read product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin write product_variants" ON public.product_variants;

DROP POLICY IF EXISTS "Public create orders" ON public.orders;
DROP POLICY IF EXISTS "Public read own orders by order_number" ON public.orders;
DROP POLICY IF EXISTS "Admin full access for orders" ON public.orders;
DROP POLICY IF EXISTS "Strict read orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;

DROP POLICY IF EXISTS "Public create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Strict read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admin write order_items" ON public.order_items;

DROP POLICY IF EXISTS "Public create timelines" ON public.order_timelines;
DROP POLICY IF EXISTS "Public read timelines" ON public.order_timelines;
DROP POLICY IF EXISTS "Strict read order_timelines" ON public.order_timelines;
DROP POLICY IF EXISTS "Admin write order_timelines" ON public.order_timelines;

DROP POLICY IF EXISTS "Public submit quotes" ON public.custom_quotes;
DROP POLICY IF EXISTS "Public read quotes" ON public.custom_quotes;
DROP POLICY IF EXISTS "Admin full access for custom_quotes" ON public.custom_quotes;
DROP POLICY IF EXISTS "Strict read quotes" ON public.custom_quotes;
DROP POLICY IF EXISTS "Admin update quotes" ON public.custom_quotes;
DROP POLICY IF EXISTS "Admin delete quotes" ON public.custom_quotes;

-- 3. Ensure Row Level Security is active on all tables
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. CATALOG POLICIES: collections, products, product_images, product_variants
-- Public can browse; Only verified store administrator can insert/update/delete
-- ==============================================================================
CREATE POLICY "Public read collections" 
  ON public.collections FOR SELECT 
  USING (true);

CREATE POLICY "Admin write collections" 
  ON public.collections FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Public read products" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Admin write products" 
  ON public.products FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Public read product_images" 
  ON public.product_images FOR SELECT 
  USING (true);

CREATE POLICY "Admin write product_images" 
  ON public.product_images FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Public read product_variants" 
  ON public.product_variants FOR SELECT 
  USING (true);

CREATE POLICY "Admin write product_variants" 
  ON public.product_variants FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 5. ORDERS POLICIES: orders, order_items, order_timelines
-- Public can place orders. Only store admin can view all orders or update/delete them.
-- Customers can only view their own orders matching their verified auth email.
-- ==============================================================================
CREATE POLICY "Public create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Strict read orders" 
  ON public.orders FOR SELECT 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated' 
      AND LOWER(customer_email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
    )
  );

CREATE POLICY "Admin update orders" 
  ON public.orders FOR UPDATE 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Admin delete orders" 
  ON public.orders FOR DELETE 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

-- ORDER ITEMS
CREATE POLICY "Public create order_items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Strict read order_items" 
  ON public.order_items FOR SELECT 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_items.order_id 
      AND (
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
        OR (auth.role() = 'authenticated' AND LOWER(o.customer_email) = LOWER(COALESCE(auth.jwt() ->> 'email', '')))
      )
    )
  );

CREATE POLICY "Admin write order_items" 
  ON public.order_items FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

-- ORDER TIMELINES
CREATE POLICY "Public create order_timelines" 
  ON public.order_timelines FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Strict read order_timelines" 
  ON public.order_timelines FOR SELECT 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_timelines.order_id 
      AND (
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
        OR (auth.role() = 'authenticated' AND LOWER(o.customer_email) = LOWER(COALESCE(auth.jwt() ->> 'email', '')))
      )
    )
  );

CREATE POLICY "Admin write order_timelines" 
  ON public.order_timelines FOR ALL 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 6. CUSTOM QUOTES POLICIES
-- Public can submit quotes. Only store admin can view all or manage quotes.
-- Customers can view their own quotes matching their email.
-- ==============================================================================
CREATE POLICY "Public submit quotes" 
  ON public.custom_quotes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Strict read quotes" 
  ON public.custom_quotes FOR SELECT 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated' 
      AND LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
    )
  );

CREATE POLICY "Admin update quotes" 
  ON public.custom_quotes FOR UPDATE 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Admin delete quotes" 
  ON public.custom_quotes FOR DELETE 
  TO authenticated 
  USING (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'prasrirugs@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

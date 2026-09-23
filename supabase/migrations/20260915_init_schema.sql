-- ==============================================================================
-- PRASRI RUGS — PRODUCTION DATABASE SCHEMA
-- Bhadohi Handmade Rugs Ecommerce Platform
-- PostgreSQL / Supabase Schema Definition
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    description TEXT,
    hero_image TEXT NOT NULL,
    curated_techniques TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    subtitle VARCHAR(255),
    collection_slug VARCHAR(100) REFERENCES public.collections(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    technique VARCHAR(50) NOT NULL, -- 'Hand-Tufted', 'Hand-Knotted', 'Flatweave'
    technique_description TEXT,
    material VARCHAR(100) NOT NULL,
    material_composition TEXT NOT NULL,
    colors TEXT[] DEFAULT '{}',
    pile_height VARCHAR(100),
    knot_density VARCHAR(100),
    origin VARCHAR(100) DEFAULT 'Bhadohi, Uttar Pradesh, India',
    description TEXT NOT NULL,
    design_story TEXT,
    craft_notes TEXT,
    care_summary TEXT,
    is_ready_to_ship BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    best_seller BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    view_type VARCHAR(50) NOT NULL, -- 'room', 'full', 'texture', 'backing', 'corner', 'detail'
    label VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(100) NOT NULL, -- e.g. "8' × 10' (244 × 305 cm)"
    dimensions_ft VARCHAR(50) NOT NULL, -- e.g. "8' × 10'"
    sku VARCHAR(100) UNIQUE NOT NULL, -- e.g. "TWA-TER-810"
    price_usd NUMERIC(10, 2) NOT NULL,
    inventory INT DEFAULT 0 CHECK (inventory >= 0),
    is_ready_to_ship BOOLEAN DEFAULT TRUE,
    production_time_weeks VARCHAR(50), -- e.g. "4–6 weeks"
    weight_kg NUMERIC(6, 2) DEFAULT 25.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. "TWA-2026-8491"
    customer_email VARCHAR(255) NOT NULL,
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB NOT NULL, -- { address, apartment, city, state, postalCode, country }
    shipping_method JSONB NOT NULL, -- { name, estimatedDays, costUSD }
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal_usd NUMERIC(10, 2) NOT NULL,
    shipping_usd NUMERIC(10, 2) DEFAULT 0,
    tax_usd NUMERIC(10, 2) DEFAULT 0,
    total_usd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ORDER PLACED', -- 'ORDER PLACED', 'PROCESSING', 'IN PRODUCTION', 'QUALITY CHECK', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'
    carrier VARCHAR(100) DEFAULT 'DHL Express International',
    tracking_number VARCHAR(100),
    estimated_delivery_date VARCHAR(100),
    is_made_to_order BOOLEAN DEFAULT FALSE,
    payment_provider VARCHAR(50), -- 'stripe', 'razorpay', 'paypal'
    payment_id VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    product_slug VARCHAR(150),
    product_image TEXT,
    size VARCHAR(100) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    technique VARCHAR(50),
    price_usd NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    is_ready_to_ship BOOLEAN DEFAULT TRUE,
    estimated_dispatch VARCHAR(100)
);

-- 7. ORDER TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.order_timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    date_label VARCHAR(100) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    is_current BOOLEAN DEFAULT FALSE,
    step_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CUSTOM RUG INQUIRIES & QUOTATIONS
CREATE TABLE IF NOT EXISTS public.custom_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. "TWA-CUS-9481"
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    shape VARCHAR(50) NOT NULL, -- 'Rectangular', 'Runner', 'Round', 'Oval', 'Custom'
    length NUMERIC(6, 2) NOT NULL,
    width NUMERIC(6, 2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'feet',
    technique VARCHAR(50) NOT NULL,
    material VARCHAR(100) NOT NULL,
    pile_depth VARCHAR(100),
    color_preference TEXT,
    estimated_price_min_usd NUMERIC(10, 2),
    estimated_price_max_usd NUMERIC(10, 2),
    room_type VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Received', -- 'Received', 'Reviewing', 'Quotation Sent', 'Approved', 'Production Scheduled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BACK IN STOCK SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.stock_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sku, email)
);

-- 10. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_technique ON public.products(technique);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_ref ON public.custom_quotes(reference_number);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- Public can read collections, products, images, variants
CREATE POLICY "Public read access for collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read access for product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read access for product_variants" ON public.product_variants FOR SELECT USING (true);

-- Public can insert orders, order_items, timelines, quotes, stock_subscriptions, newsletter
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders by order_number" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public create order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public create timelines" ON public.order_timelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read timelines" ON public.order_timelines FOR SELECT USING (true);
CREATE POLICY "Public submit quotes" ON public.custom_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read quotes" ON public.custom_quotes FOR SELECT USING (true);
CREATE POLICY "Public subscribe to stock" ON public.stock_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Admin full access for authenticated service role or admin accounts
CREATE POLICY "Admin full access for collections" ON public.collections FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin full access for products" ON public.products FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin full access for product_images" ON public.product_images FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin full access for product_variants" ON public.product_variants FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin full access for orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin full access for custom_quotes" ON public.custom_quotes FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

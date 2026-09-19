-- ==============================================================================
-- THE WEAVE ATELIER — COMPLETE SUPABASE BACKEND READY MIGRATION
-- Run this in your Supabase Dashboard -> SQL Editor
-- It configures tables, permissive RLS policies, Realtime, and seeds all products.
-- ==============================================================================

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
    technique VARCHAR(50) NOT NULL,
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
    view_type VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(100) NOT NULL,
    dimensions_ft VARCHAR(50) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    inventory INT DEFAULT 0 CHECK (inventory >= 0),
    is_ready_to_ship BOOLEAN DEFAULT TRUE,
    production_time_weeks VARCHAR(50),
    weight_kg NUMERIC(6, 2) DEFAULT 25.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB NOT NULL,
    shipping_method JSONB NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal_usd NUMERIC(10, 2) NOT NULL,
    shipping_usd NUMERIC(10, 2) DEFAULT 0,
    tax_usd NUMERIC(10, 2) DEFAULT 0,
    total_usd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ORDER PLACED',
    carrier VARCHAR(100) DEFAULT 'DHL Express International',
    tracking_number VARCHAR(100),
    estimated_delivery_date VARCHAR(100),
    is_made_to_order BOOLEAN DEFAULT FALSE,
    payment_provider VARCHAR(50),
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
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    shape VARCHAR(50) NOT NULL,
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
    status VARCHAR(50) DEFAULT 'Received',
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
    CONSTRAINT unique_stock_sub UNIQUE (sku, email)
);

-- 10. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST LOOKUP
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_technique ON public.products(technique);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_ref ON public.custom_quotes(reference_number);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.custom_quotes(email);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures public client (anon) can read, insert, update orders, quotes, stock
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

-- Drop legacy restrictive policies to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('collections', 'products', 'product_images', 'product_variants', 
                            'orders', 'order_items', 'order_timelines', 'custom_quotes', 
                            'stock_subscriptions', 'newsletter_subscribers')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 1. COLLECTIONS
CREATE POLICY "Allow public select collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public manage collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);

-- 2. PRODUCTS
CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 3. PRODUCT IMAGES
CREATE POLICY "Allow public select product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow public manage product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- 4. PRODUCT VARIANTS (Allows live stock decrement and admin stock updates)
CREATE POLICY "Allow public select product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public update product_variants" ON public.product_variants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- 5. ORDERS (Allows checkout insert, customer lookup, and admin stage updates)
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- 6. ORDER ITEMS
CREATE POLICY "Allow public select order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_items" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete order_items" ON public.order_items FOR DELETE USING (true);

-- 7. ORDER TIMELINES (Allows tracking milestone updates and re-sync)
CREATE POLICY "Allow public select order_timelines" ON public.order_timelines FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_timelines" ON public.order_timelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_timelines" ON public.order_timelines FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete order_timelines" ON public.order_timelines FOR DELETE USING (true);

-- 8. CUSTOM QUOTES (Allows quote inquiry submission and admin stage changes)
CREATE POLICY "Allow public select custom_quotes" ON public.custom_quotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert custom_quotes" ON public.custom_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update custom_quotes" ON public.custom_quotes FOR UPDATE USING (true) WITH CHECK (true);

-- 9. STOCK SUBSCRIPTIONS (Allows back-in-stock alerts & upsert)
CREATE POLICY "Allow public select stock_subscriptions" ON public.stock_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert stock_subscriptions" ON public.stock_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stock_subscriptions" ON public.stock_subscriptions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete stock_subscriptions" ON public.stock_subscriptions FOR DELETE USING (true);

-- 10. NEWSLETTER SUBSCRIBERS
CREATE POLICY "Allow public select newsletter" ON public.newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- REALTIME REPLICATION (Instant updates across browser windows & devices)
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_quotes;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_timelines;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ==============================================================================
-- SEED DATA: 6 COLLECTIONS
-- ==============================================================================
INSERT INTO public.collections (slug, name, tagline, description, hero_image, curated_techniques, display_order)
VALUES
('modern-forms', 'Modern Forms', 'Abstract and contemporary designs.', 'Rugs characterized by fluid lines, architectural minimalism, and restrained asymmetry. Designed to balance clean modernist spaces without overwhelming them.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted', 'Hand-Knotted'], 1),
('quiet-neutrals', 'Quiet Neutrals', 'Soft, restrained rugs for sophisticated interiors.', 'An exploration of un-dyed wools, warm ivory, soft bone, oatmeal, and parchment. Tactile depth achieved entirely through fiber variations and gentle pile shearing.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted', 'Hand-Tufted', 'Flatweave'], 2),
('botanical-studies', 'Botanical Studies', 'Nature-inspired patterns.', 'Abstracted botanical silhouettes inspired by the Gangetic flora. Gentle earthy pigments blended with natural wool and soft botanical viscose.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted'], 3),
('heritage-reimagined', 'Heritage Reimagined', 'Traditional influences interpreted for contemporary spaces.', 'Centuries of Indian weaving heritage filtered through modern restraint. Deconstructed borders, softened motifs, and antique river-washed finishes.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted', 'Flatweave'], 4),
('texture-sculpture', 'Texture & Sculpture', 'High-low, carved and dimensional surfaces.', 'Rugs that engage the sense of touch through physical elevation. Hand-carved relief channels, loop-and-cut pile contrasts, and dimensional landscape textures.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted'], 5),
('hand-knotted-collection', 'Hand-Knotted Collection', 'Intricate, traditional handmade construction.', 'The pinnacle of carpet weaving. Every knot individually tied by hand on vertical timber looms in Bhadohi. Exceptional longevity, supple handle, and heirloom durability.', 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted'], 6)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    hero_image = EXCLUDED.hero_image,
    curated_techniques = EXCLUDED.curated_techniques,
    display_order = EXCLUDED.display_order;

-- ==============================================================================
-- SEED DATA: 6 MASTER PRODUCTS, GALLERIES, AND SIZE VARIANTS
-- ==============================================================================

-- PRODUCT 1: Terralis Abstract Wool Rug
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'terralis-abstract-wool-rug',
        'Terralis Abstract Wool Rug',
        'Flowing topographical contours rendered in hand-tufted natural wool.',
        'modern-forms',
        'Hand-Tufted',
        'Dense hand-tufted pile constructed by master artisans using a hand-operated needle tool on a vertical stretched cotton canvas.',
        'Blended Wool',
        '80% New Zealand Long-Staple Wool, 20% Indian Highland Wool on 100% Cotton Canvas backing.',
        ARRAY['Warm Ivory', 'Parchment', 'Oatmeal', 'Subtle Moss'],
        '12 mm plush medium pile with hand-sheared surface',
        'Bhadohi, Uttar Pradesh, India',
        'Inspired by the quiet rhythm of natural landforms, the Terralis rug brings gentle movement to contemporary interiors. Each line is tufted by hand with deliberate variation in wool tension, creating an organic surface that catches ambient light softly without reflective sheen.',
        'Developed within our Bhadohi studio, Terralis was created to ground architectural spaces. The subtle earth-toned lines mimic contours carved by water and wind, providing visual warmth without competing with modern furniture profiles.',
        'The yarn is spun from a blend of long-staple New Zealand fleece for softness and resilient Indian highland fleece for pile memory. After tufting, the rug undergoes double latexing with a protective cotton backing, followed by thorough washing in fresh groundwater and hand-shearing using traditional iron shears.',
        'Vacuum weekly with suction only (avoid rotary beater bars). Spot clean immediately with a damp white cloth and wool-safe neutral soap. Rotate every 6 months.',
        true, true, true, false
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', 'Terralis Abstract Wool Rug in an understated minimalist living room', 'room', 'In-Situ Living Room', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'Terralis Abstract Wool Rug full aerial perspective', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', 'Macro texture of Terralis blended wool fibers and hand-sheared pile', 'texture', 'Close Pile & Texture', 3),
    (v_prod_id, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85', 'Hand-finished edge binding and reverse canvas backing of Terralis rug', 'backing', 'Edge Binding & Reverse', 4),
    (v_prod_id, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85', 'Folded corner detail showing pile density and structural foundation', 'corner', 'Folded Corner Detail', 5);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '5'' × 8'' (152 × 244 cm)', '5'' × 8''', 'TWA-TER-58', 680.00, 3, true, NULL, 16.0),
    (v_prod_id, '6'' × 9'' (183 × 274 cm)', '6'' × 9''', 'TWA-TER-69', 890.00, 1, true, NULL, 22.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-TER-810', 1350.00, 4, true, NULL, 32.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-TER-912', 1820.00, 0, false, '4–5 weeks', 42.0),
    (v_prod_id, '10'' × 14'' (305 × 427 cm)', '10'' × 14''', 'TWA-TER-1014', 2380.00, 0, false, '5–6 weeks', 54.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- PRODUCT 2: Arbor Flow Sculpted Wool Rug
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'arbor-flow-sculpted-wool-rug',
        'Arbor Flow Sculpted Wool Rug',
        'Organic branching lines hand-carved into high-low textured wool.',
        'texture-sculpture',
        'Hand-Tufted',
        'Dimensional hand-tufting with dual pile heights and manual bevel-carving along the curving contours.',
        'Blended Wool',
        '85% Virgin Wool, 15% Botanical Bamboo Silk highlights on unbleached cotton backing.',
        ARRAY['Cream', 'Bone', 'Muted Taupe', 'Charcoal Grain'],
        '14 mm high pile with 8 mm carved relief recesses',
        'Bhadohi, Uttar Pradesh, India',
        'Arbor Flow explores organic growth patterns found in ancient tree barks and river meanders. The interplay of raised unspun wool loops and hand-sheared flat cut pile produces a gentle tactile elevation underfoot.',
        'Designed with the philosophy of quiet tactility. Rather than contrasting contrasting colors, Arbor Flow creates depth through physical dimension and natural light shadows.',
        'Following the tufting process, senior artisans carve each organic channel by hand using duckbill scissors. This precision sculpting takes approximately 18 hours per rug and ensures no two lines are mechanically identical.',
        'Vacuum gently without brush agitator. New wool rugs naturally shed light fuzz during the first few weeks—this stabilizes with regular gentle vacuuming.',
        true, true, true, false
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85', 'Arbor Flow Sculpted Wool Rug in a warm serene bedroom setting', 'room', 'Interior Bedroom Setting', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85', 'Arbor Flow Sculpted Wool Rug full view showing carved relief', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85', 'Macro texture of high-low pile and hand-carved relief lines', 'texture', 'Sculpted Pile Detail', 3),
    (v_prod_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'Close-up of fringe and hem finish', 'detail', 'Edge & Binding', 4);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '5'' × 8'' (152 × 244 cm)', '5'' × 8''', 'TWA-ARB-58', 720.00, 2, true, NULL, 18.0),
    (v_prod_id, '6'' × 9'' (183 × 274 cm)', '6'' × 9''', 'TWA-ARB-69', 940.00, 0, false, '4–5 weeks', 24.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-ARB-810', 1420.00, 2, true, NULL, 34.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-ARB-912', 1910.00, 1, true, NULL, 45.0),
    (v_prod_id, '10'' × 14'' (305 × 427 cm)', '10'' × 14''', 'TWA-ARB-1014', 2490.00, 0, false, '5–6 weeks', 58.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- PRODUCT 3: Kanso Minimalist Linear Rug
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, knot_density, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'kanso-minimalist-linear-rug',
        'Kanso Minimalist Linear Rug',
        'Understated linear geometry crafted in un-dyed pure highland fleece.',
        'quiet-neutrals',
        'Hand-Knotted',
        'Individually tied asymmetrical Persian knots on a vertical timber loom. 60 knots per square inch.',
        '100% Pure Wool',
        '100% Hand-spun unbleached Indian Highland Wool on natural cotton warp and weft.',
        ARRAY['Raw Ivory', 'Natural Taupe', 'Charcoal Pinstripe'],
        '9 mm low-profile, dense traditional knot pile',
        '60 knots / sq inch (~93,000 knots / sq meter)',
        'Bhadohi, Uttar Pradesh, India',
        'Kanso takes its name from the Japanese principle of simplicity. Constructed entirely by hand-knotting, this piece utilizes the subtle chromatic shifts in un-dyed raw wool to create an understated, calming foundation for modern furniture.',
        'We spent months sourcing un-dyed wool lots from sheep graziers in northern India. Because the wool is not chemically stripped or bleached, the natural lanolin remains intact, granting natural stain repellency and an authentic earthy feel.',
        'Two master weavers work simultaneously side by side on our timber upright loom in Bhadohi. It takes approximately 7 weeks to weave an 8x10 foot Kanso rug knot by knot.',
        'A hand-knotted rug is an heirloom built to last for generations. Periodic gentle vacuuming and professional wash every 3–5 years will maintain its integrity.',
        true, true, false, true
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85', 'Kanso Minimalist Linear Rug beneath an architectural oak dining table', 'room', 'Dining Setting', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85', 'Full overhead view of Kanso Hand-Knotted Rug', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', 'Close-up of hand-knotted structure and natural lanolin wool sheen', 'texture', 'Knot Density Detail', 3),
    (v_prod_id, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85', 'Hand-tied fringe fringe fringe edge finish', 'backing', 'Hand-Tied Fringe', 4);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '5'' × 8'' (152 × 244 cm)', '5'' × 8''', 'TWA-KAN-58', 1150.00, 1, true, NULL, 14.0),
    (v_prod_id, '6'' × 9'' (183 × 274 cm)', '6'' × 9''', 'TWA-KAN-69', 1540.00, 2, true, NULL, 19.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-KAN-810', 2280.00, 1, true, NULL, 28.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-KAN-912', 3080.00, 0, false, '7–8 weeks', 38.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- PRODUCT 4: Varanasi Serenade Hand-Knotted Rug
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, knot_density, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'varanasi-serenade-hand-knotted-rug',
        'Varanasi Serenade Hand-Knotted Rug',
        'Century-old architectural motifs reimagined through soft earthen pigments.',
        'hand-knotted-collection',
        'Hand-Knotted',
        'Intricate 100-knot Tibetan-weave construction combining hand-carded wool with delicate mulberry silk highlights.',
        'Wool & Botanical Silk',
        '75% Hand-spun Wool, 25% Pure Silk on warp foundation.',
        ARRAY['Muted Terracotta', 'Antique Taupe', 'Ochre Dust', 'Soft Charcoal'],
        '7 mm low-sheared antique finish',
        '100 knots / sq inch (~155,000 knots / sq meter)',
        'Bhadohi, Uttar Pradesh, India',
        'A tribute to the ancient architectural heritage along the Ganges near Bhadohi. The intricate traditional borders are softened and deconstructed, leaving ghost-like motifs that blend effortlessly with minimalist and mid-century furniture.',
        'Heritage Reimagined at its most refined. We toned down contrast and used pot-dyed muted mineral pigments so the rug reads as an atmospheric canvas rather than a loud decorative pattern.',
        'Woven over 12 weeks on our finest upright looms. After weaving, it undergoes an extensive organic river wash and sun curing on the atelier rooftop, followed by artisanal hand-shearing to reveal the subtle silk sheen.',
        'Vacuum gently in the direction of the pile. Professional rug clean only.',
        true, true, false, false
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', 'Varanasi Serenade Hand-Knotted Rug in a sunlit architectural living space', 'room', 'Living Room Setting', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'Full overhead shot of Varanasi Serenade Rug', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', 'High knot density and silk yarn sheen up close', 'texture', 'Silk & Wool Sheen', 3);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '6'' × 9'' (183 × 274 cm)', '6'' × 9''', 'TWA-VAR-69', 2450.00, 1, true, NULL, 20.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-VAR-810', 3620.00, 1, true, NULL, 30.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-VAR-912', 4890.00, 0, false, '9–10 weeks', 40.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- PRODUCT 5: Botanica Umber Hand-Tufted Rug
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'botanica-umber-hand-tufted-rug',
        'Botanica Umber Hand-Tufted Rug',
        'Silhouettes of regional flora abstracted into calming earth tones.',
        'botanical-studies',
        'Hand-Tufted',
        'Custom-dyed botanical shapes hand-tufted in variegated pile densities for subtle textural variety.',
        'New Zealand Wool & Viscose',
        '70% New Zealand Wool, 30% Botanical Viscose.',
        ARRAY['Earthy Umber', 'Warm Sand', 'Dried Olive', 'Parchment'],
        '11 mm cut pile with looped contours',
        'Bhadohi, Uttar Pradesh, India',
        'Botanica Umber abstracts the native flora of the Gangetic plains into quiet rhythmic forms. The interplay of matte wool with the gentle luster of viscose yarns catches daylight differently throughout the hours.',
        'An exploration of subtle organic forms. Instead of literal floral patterns, Botanica captures the impression of leaf shadows cast on sun-warmed plaster walls.',
        'Colors are matched in small laboratory dye vats in Bhadohi using European non-toxic chrome dyes to ensure colorfastness while preserving yarn elasticity.',
        'Vacuum regularly with gentle suction. Keep away from excessive continuous direct UV exposure to maintain rich mineral hues.',
        true, false, false, true
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85', 'Botanica Umber Rug in a serene bedroom setting with linen drapery', 'room', 'Bedroom Interior', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'Full rug view of Botanica Umber', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85', 'Close pile showing matte wool and viscose yarn highlights', 'texture', 'Yarn Blend Detail', 3);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '5'' × 8'' (152 × 244 cm)', '5'' × 8''', 'TWA-BOT-58', 740.00, 3, true, NULL, 17.0),
    (v_prod_id, '6'' × 9'' (183 × 274 cm)', '6'' × 9''', 'TWA-BOT-69', 980.00, 2, true, NULL, 23.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-BOT-810', 1480.00, 0, false, '4–5 weeks', 33.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-BOT-912', 1980.00, 0, false, '5–6 weeks', 44.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- PRODUCT 6: Bhadohi Earth Reversible Flatweave
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    INSERT INTO public.products (
        slug, name, subtitle, collection_slug, technique, technique_description,
        material, material_composition, colors, pile_height, origin,
        description, design_story, craft_notes, care_summary,
        is_ready_to_ship, featured, best_seller, is_new
    ) VALUES (
        'bhadohi-earth-reversible-flatweave',
        'Bhadohi Earth Reversible Flatweave',
        'Traditional dhurrie flatweave crafted from resilient hand-spun raw fleece.',
        'heritage-reimagined',
        'Flatweave',
        'Tightly interlocked flatweave woven on horizontal pit looms. Fully reversible design.',
        '100% Pure Wool',
        '100% Raw Indian Wool with organic cotton warp tension threads.',
        ARRAY['Warm Biscuit', 'Earth Charcoal', 'Raw Sand'],
        '5 mm zero-pile durable flatweave',
        'Bhadohi, Uttar Pradesh, India',
        'A contemporary evolution of the traditional Indian dhurrie. Constructed with zero pile, Bhadohi Earth offers exceptional durability, making it ideal for high-traffic corridors, hallways, dining rooms, and casual living areas.',
        'We wanted to celebrate the unpretentious honesty of the flat loom. By using thick hand-spun wool slub yarn, the weave exhibits natural texture variations that reveal the hand of the weaver.',
        'Woven on indigenous pit looms in the rural hamlets surrounding Bhadohi. The tension is maintained entirely through the foot pedals and body movement of the artisan.',
        'Shake outdoors regularly. Vacuum gently without brush roll. Spot clean with warm water and wool cleaner. Fully reversible for twice the wear.',
        true, false, true, false
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description
    RETURNING id INTO v_prod_id;

    -- Images
    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, url, alt, view_type, label, display_order) VALUES
    (v_prod_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'Bhadohi Earth Flatweave Runner in a bright modern entry hallway', 'room', 'Hallway Runner', 1),
    (v_prod_id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', 'Full view of Bhadohi Earth Flatweave', 'full', 'Full Rug View', 2),
    (v_prod_id, 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', 'Tight interlocked flatweave surface and slub yarn character', 'texture', 'Flatweave Texture', 3);

    -- Variants
    INSERT INTO public.product_variants (product_id, size, dimensions_ft, sku, price_usd, inventory, is_ready_to_ship, production_time_weeks, weight_kg) VALUES
    (v_prod_id, '2.5'' × 10'' (76 × 305 cm) Runner', '2.5'' × 10''', 'TWA-BHD-RUN', 390.00, 4, true, NULL, 8.0),
    (v_prod_id, '5'' × 8'' (152 × 244 cm)', '5'' × 8''', 'TWA-BHD-58', 520.00, 2, true, NULL, 12.0),
    (v_prod_id, '8'' × 10'' (244 × 305 cm)', '8'' × 10''', 'TWA-BHD-810', 960.00, 1, true, NULL, 21.0),
    (v_prod_id, '9'' × 12'' (274 × 366 cm)', '9'' × 12''', 'TWA-BHD-912', 1280.00, 0, false, '3–4 weeks', 28.0)
    ON CONFLICT (sku) DO UPDATE SET
        price_usd = EXCLUDED.price_usd,
        inventory = EXCLUDED.inventory,
        is_ready_to_ship = EXCLUDED.is_ready_to_ship;
END $$;

-- ==============================================================================
-- INITIAL DEMO ORDERS & TIMELINES (If not already present)
-- ==============================================================================
INSERT INTO public.orders (
    order_number, customer_email, customer_first_name, customer_last_name, customer_phone,
    shipping_address, shipping_method, currency, subtotal_usd, shipping_usd, tax_usd, total_usd,
    status, carrier, tracking_number, estimated_delivery_date, is_made_to_order, payment_provider, payment_id
) VALUES (
    'TWA-2026-8491', 'claire.v@example.com', 'Claire', 'Vandermeer', '+1 (415) 890-2144',
    '{"address": "428 Green Street", "apartment": "Apt 3B", "city": "San Francisco", "state": "CA", "postalCode": "94133", "country": "United States"}'::jsonb,
    '{"name": "Atelier Express Air via DHL Express (Insured)", "estimatedDays": "5–7 business days", "costUSD": 0}'::jsonb,
    'USD', 1350.00, 0.00, 0.00, 1350.00,
    'IN TRANSIT', 'DHL Express International', 'DHL-IN-98274109', 'September 18, 2026', false, 'Razorpay Live', 'pay_probe_demo_8491'
) ON CONFLICT (order_number) DO NOTHING;

DO $$
DECLARE
    v_order_id UUID;
BEGIN
    SELECT id INTO v_order_id FROM public.orders WHERE order_number = 'TWA-2026-8491';
    IF v_order_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.order_timelines WHERE order_id = v_order_id) THEN
        INSERT INTO public.order_timelines (order_id, title, date_label, description, completed, is_current, step_order)
        VALUES
        (v_order_id, 'Order Placed & Payment Verified', 'Sep 10, 2026 · 10:30 AM IST', 'Your order was received and confirmed at our Bhadohi atelier.', true, false, 1),
        (v_order_id, 'Quality Inspection & Conditioning', 'Sep 11, 2026 · 02:15 PM IST', 'Master artisans inspected pile density, hand-shearing, and edge binding.', true, false, 2),
        (v_order_id, 'Dispatched via DHL Express', 'Sep 12, 2026 · 06:45 PM IST', 'Package rolled in breathable weather-resistant casing and handed to courier.', true, false, 3),
        (v_order_id, 'International Transit — En Route to USA', 'Sep 14, 2026 · 08:20 AM EST', 'Cleared export customs in New Delhi. In flight to San Francisco hub.', true, true, 4),
        (v_order_id, 'Delivered', 'Estimated Sep 18, 2026', 'Direct contactless delivery with signature to your address.', false, false, 5);
    END IF;
END $$;

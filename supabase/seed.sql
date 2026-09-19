-- ==============================================================================
-- THE WEAVE ATELIER — PRODUCTION SEED DATA
-- Populate collections, products, variants, and initial demo orders
-- ==============================================================================

-- 1. SEED COLLECTIONS
INSERT INTO public.collections (slug, name, tagline, description, hero_image, curated_techniques, display_order)
VALUES
('modern-forms', 'Modern Forms', 'Abstract and contemporary designs.', 'Rugs characterized by fluid lines, architectural minimalism, and restrained asymmetry. Designed to balance clean modernist spaces without overwhelming them.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted', 'Hand-Knotted'], 1),
('quiet-neutrals', 'Quiet Neutrals', 'Soft, restrained rugs for sophisticated interiors.', 'An exploration of un-dyed wools, warm ivory, soft bone, oatmeal, and parchment. Tactile depth achieved entirely through fiber variations and gentle pile shearing.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted', 'Hand-Tufted', 'Flatweave'], 2),
('botanical-studies', 'Botanical Studies', 'Nature-inspired patterns.', 'Abstracted botanical silhouettes inspired by the Gangetic flora. Gentle earthy pigments blended with natural wool and soft botanical viscose.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted'], 3),
('heritage-reimagined', 'Heritage Reimagined', 'Traditional influences interpreted for contemporary spaces.', 'Centuries of Indian weaving heritage filtered through modern restraint. Deconstructed borders, softened motifs, and antique river-washed finishes.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted', 'Flatweave'], 4),
('texture-sculpture', 'Texture & Sculpture', 'High-low, carved and dimensional surfaces.', 'Rugs that engage the sense of touch through physical elevation. Hand-carved relief channels, loop-and-cut pile contrasts, and dimensional landscape textures.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Tufted'], 5),
('hand-knotted-collection', 'Hand-Knotted Collection', 'Intricate, traditional handmade construction.', 'The pinnacle of carpet weaving. Every knot individually tied by hand on vertical timber looms in Bhadohi. Exceptional longevity, supple handle, and heirloom durability.', 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85', ARRAY['Hand-Knotted'], 6)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED SAMPLE ORDER (Claire Vandermeer)
INSERT INTO public.orders (
    order_number, customer_email, customer_first_name, customer_last_name, customer_phone,
    shipping_address, shipping_method, currency, subtotal_usd, shipping_usd, tax_usd, total_usd,
    status, carrier, tracking_number, estimated_delivery_date, is_made_to_order
) VALUES (
    'TWA-2026-8491', 'claire.v@example.com', 'Claire', 'Vandermeer', '+1 (415) 890-2144',
    '{"address": "428 Green Street", "apartment": "Apt 3B", "city": "San Francisco", "state": "CA", "postalCode": "94133", "country": "United States"}'::jsonb,
    '{"name": "Atelier Express Air via DHL Express (Insured)", "estimatedDays": "5–7 business days", "costUSD": 0}'::jsonb,
    'USD', 1350.00, 0.00, 0.00, 1350.00,
    'IN TRANSIT', 'DHL Express International', 'DHL-IN-98274109', 'September 18, 2026', false
) ON CONFLICT (order_number) DO NOTHING;

-- 3. SEED TIMELINES FOR SAMPLE ORDER
DO $$
DECLARE
    v_order_id UUID;
BEGIN
    SELECT id INTO v_order_id FROM public.orders WHERE order_number = 'TWA-2026-8491';
    IF v_order_id IS NOT NULL THEN
        INSERT INTO public.order_timelines (order_id, title, date_label, description, completed, is_current, step_order)
        VALUES
        (v_order_id, 'Order Placed & Payment Verified', 'Sep 10, 2026 · 10:30 AM IST', 'Your order was received and confirmed at our Bhadohi atelier.', true, false, 1),
        (v_order_id, 'Quality Inspection & Conditioning', 'Sep 11, 2026 · 02:15 PM IST', 'Master artisans inspected pile density, hand-shearing, and edge binding.', true, false, 2),
        (v_order_id, 'Dispatched via DHL Express', 'Sep 12, 2026 · 06:45 PM IST', 'Package rolled in breathable weather-resistant casing and handed to courier.', true, false, 3),
        (v_order_id, 'International Transit — En Route to USA', 'Sep 14, 2026 · 08:20 AM EST', 'Cleared export customs in New Delhi. In flight to San Francisco hub.', true, true, 4),
        (v_order_id, 'Delivered', 'Estimated Sep 18, 2026', 'Direct contactless delivery with signature to your address.', false, false, 5);
    END IF;
END $$;

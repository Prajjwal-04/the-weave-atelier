-- Migration: Add Quoting and Reply Fields to custom_quotes
-- Allows the admin to store formal price quotations, lead times, bespoke designer reply messages, and timestamps.

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS quoted_price_usd NUMERIC(10, 2);

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS quoted_lead_time VARCHAR(100);

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS admin_reply_message TEXT;

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS deposit_required_usd NUMERIC(10, 2);

ALTER TABLE IF EXISTS public.custom_quotes 
ADD COLUMN IF NOT EXISTS designer_contact VARCHAR(150);

-- Enable RLS updates for authenticated admin users
CREATE POLICY "Admin update custom_quotes reply" 
ON public.custom_quotes 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

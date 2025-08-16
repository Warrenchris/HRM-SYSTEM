-- Create subscription_plans table before seeding data
-- This migration must run before 20250814002000_seed_subscription_plans.sql

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  band TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  max_employees INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read subscription plans
CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- Only admins can modify subscription plans
CREATE POLICY "Admins can modify subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Create index on name for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON public.subscription_plans(name);

-- Create index on band for filtering
CREATE INDEX IF NOT EXISTS idx_subscription_plans_band ON public.subscription_plans(band);

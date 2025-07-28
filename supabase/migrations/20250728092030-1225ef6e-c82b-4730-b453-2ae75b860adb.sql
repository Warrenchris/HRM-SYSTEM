-- Create subscription plans/bands table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  band TEXT NOT NULL CHECK (band IN ('basic', 'professional', 'enterprise', 'custom')),
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_employees INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription plans
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create company subscriptions table
CREATE TABLE public.company_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for company subscriptions
CREATE POLICY "Company members can view their subscription" 
ON public.company_subscriptions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM company_members 
  WHERE company_id = company_subscriptions.company_id 
  AND user_id = auth.uid() 
  AND status = 'active'
));

CREATE POLICY "Company owners can manage their subscription" 
ON public.company_subscriptions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM company_members 
  WHERE company_id = company_subscriptions.company_id 
  AND user_id = auth.uid() 
  AND role = 'owner' 
  AND status = 'active'
));

-- Add plan_id to companies table
ALTER TABLE public.companies 
ADD COLUMN plan_id UUID REFERENCES subscription_plans(id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, band, price_monthly, price_yearly, max_employees, features, sort_order) VALUES
('basic', 'Basic Plan', 'Perfect for small teams getting started with HR management', 'basic', 29.99, 299.99, 10, 
 '["Employee Management", "Basic Attendance", "Leave Management", "Basic Reports", "Email Support"]'::jsonb, 1),

('professional', 'Professional Plan', 'Comprehensive HR solution for growing businesses', 'professional', 79.99, 799.99, 100, 
 '["Everything in Basic", "Advanced Attendance & GPS", "Payroll Management", "Performance Reviews", "Asset Management", "Advanced Reports", "Priority Support"]'::jsonb, 2),

('enterprise', 'Enterprise Plan', 'Full-featured solution for large organizations', 'enterprise', 149.99, 1499.99, 1000, 
 '["Everything in Professional", "Custom Workflows", "Advanced Analytics", "API Access", "Custom Integrations", "SSO", "Dedicated Account Manager", "24/7 Support"]'::jsonb, 3),

('custom', 'Custom Plan', 'Tailored solution for your specific needs', 'custom', 0, 0, NULL, 
 '["Custom Features", "Unlimited Employees", "White Label Options", "On-premise Deployment", "Custom Integrations", "Dedicated Support Team"]'::jsonb, 4);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at
BEFORE UPDATE ON public.company_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update create_company_with_owner function to handle plan selection
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name text, 
  company_display_name text DEFAULT NULL, 
  user_email text DEFAULT NULL,
  selected_plan_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
  current_user_id UUID;
  default_plan_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Get default basic plan if no plan selected
  IF selected_plan_id IS NULL THEN
    SELECT id INTO default_plan_id FROM public.subscription_plans 
    WHERE band = 'basic' AND is_active = true 
    ORDER BY sort_order LIMIT 1;
    selected_plan_id := default_plan_id;
  END IF;
  
  -- Create the company
  INSERT INTO public.companies (name, display_name, created_by, plan_id)
  VALUES (company_name, COALESCE(company_display_name, company_name), current_user_id, selected_plan_id)
  RETURNING id INTO new_company_id;
  
  -- Add user as company owner
  INSERT INTO public.company_members (user_id, company_id, role, status)
  VALUES (current_user_id, new_company_id, 'owner', 'active');
  
  -- Create company subscription record
  INSERT INTO public.company_subscriptions (company_id, plan_id, status, trial_ends_at, next_billing_date)
  VALUES (new_company_id, selected_plan_id, 'trial', now() + interval '14 days', (now() + interval '14 days')::date);
  
  -- Update user's profile with company
  UPDATE public.profiles 
  SET company_id = new_company_id
  WHERE user_id = current_user_id;
  
  RETURN new_company_id;
END;
$$;
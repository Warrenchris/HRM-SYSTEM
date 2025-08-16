-- Seed default subscription plans if none exist
-- Safe to run multiple times; inserts only when table is empty

INSERT INTO public.subscription_plans (
  id,
  name,
  display_name,
  description,
  band,
  price_monthly,
  price_yearly,
  max_employees,
  features,
  sort_order,
  is_active,
  created_at,
  updated_at
)
SELECT id, name, display_name, description, band, price_monthly, price_yearly, max_employees, features, sort_order, is_active, created_at, updated_at
FROM (
  VALUES
    (
      gen_random_uuid(),
      'basic',
      'Basic',
      'Perfect for small teams getting started with HR management',
      'basic',
      29,
      290,
      25,
      '["Employee Management", "Basic Attendance Tracking", "Leave Management", "Basic Reports", "Email Support"]'::jsonb,
      1,
      true,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'professional',
      'Professional',
      'Ideal for growing companies with advanced HR needs',
      'professional',
      79,
      790,
      100,
      '["Everything in Basic", "Advanced Analytics", "Performance Management", "Asset Tracking", "Expense Management", "Priority Support", "Custom Workflows"]'::jsonb,
      2,
      true,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'enterprise',
      'Enterprise',
      'Complete HR solution for large organizations',
      'enterprise',
      199,
      1990,
      null,
      '["Everything in Professional", "Advanced Security", "Custom Integrations", "Dedicated Account Manager", "24/7 Phone Support", "Custom Training", "SLA Guarantee"]'::jsonb,
      3,
      true,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'custom',
      'Custom',
      'Tailored solution for unique enterprise requirements',
      'custom',
      0,
      0,
      null,
      '["Custom Features", "Dedicated Support", "Custom Development", "On-Premise Option", "White-Label Solution"]'::jsonb,
      4,
      true,
      now(),
      now()
    )
) AS v(id, name, display_name, description, band, price_monthly, price_yearly, max_employees, features, sort_order, is_active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans);

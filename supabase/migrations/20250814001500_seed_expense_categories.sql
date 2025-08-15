-- Seed default expense categories if none exist
-- Safe to run multiple times; inserts only when table is empty

INSERT INTO public.expense_categories (
  name,
  description,
  max_amount,
  requires_receipt,
  is_active
)
SELECT name, description, max_amount::numeric, requires_receipt, is_active
FROM (
  VALUES
    ('Travel', 'Transport, taxis, flights, mileage', NULL, TRUE, TRUE),
    ('Meals', 'Meals and entertainment for business', NULL, TRUE, TRUE),
    ('Accommodation', 'Hotel and lodging', NULL, TRUE, TRUE),
    ('Office Supplies', 'Stationery, small equipment', NULL, TRUE, TRUE),
    ('Fuel', 'Fuel for company or reimbursable travel', NULL, TRUE, TRUE),
    ('Software', 'Software subscriptions and licenses', NULL, TRUE, TRUE),
    ('Training', 'Courses, workshops, and certifications', NULL, TRUE, TRUE),
    ('Communication', 'Internet, phone, and data', NULL, TRUE, TRUE)
) AS v(name, description, max_amount, requires_receipt, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.expense_categories);



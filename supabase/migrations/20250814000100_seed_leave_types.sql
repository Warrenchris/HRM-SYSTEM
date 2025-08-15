-- Seed default leave types if none exist
-- This is safe to run multiple times because it inserts only when the table is empty

INSERT INTO leave_types (
  name,
  description,
  max_days_per_year,
  carry_over_allowed,
  max_carry_over_days,
  requires_medical_certificate,
  notice_period_days,
  is_active,
  color
)
SELECT name,
       description,
       max_days_per_year,
       carry_over_allowed,
       max_carry_over_days,
       requires_medical_certificate,
       notice_period_days,
       is_active,
       color
FROM (
  VALUES
    ('Annual Leave', 'Paid time off for vacation', 21, TRUE, 10, FALSE, 7, TRUE, '#10B981'),
    ('Sick Leave', 'Time off for illness', 10, FALSE, 0, TRUE, 0, TRUE, '#EF4444'),
    ('Maternity Leave', 'Maternity leave', 90, FALSE, 0, FALSE, 30, TRUE, '#F59E0B'),
    ('Paternity Leave', 'Paternity leave', 14, FALSE, 0, FALSE, 14, TRUE, '#3B82F6'),
    ('Unpaid Leave', 'Unpaid leave when PTO is exhausted or not applicable', 365, FALSE, 0, FALSE, 7, TRUE, '#6B7280')
) AS v(
  name,
  description,
  max_days_per_year,
  carry_over_allowed,
  max_carry_over_days,
  requires_medical_certificate,
  notice_period_days,
  is_active,
  color
)
WHERE NOT EXISTS (SELECT 1 FROM leave_types);



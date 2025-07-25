-- Insert additional companies if they don't exist
INSERT INTO public.companies (id, name, display_name, industry, country, currency, timezone, description, is_active) 
SELECT '33333333-3333-3333-3333-333333333333', 'Innovation Hub Ltd', 'InnoHub', 'Consulting', 'Tanzania', 'TZS', 'Africa/Dar_es_Salaam', 'Business innovation consultancy', true
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE id = '33333333-3333-3333-3333-333333333333');

-- Insert leave types if they don't exist
INSERT INTO public.leave_types (id, name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, notice_period_days, color) 
SELECT * FROM (VALUES
('lt111111-1111-1111-1111-111111111111', 'Annual Leave', 'Yearly vacation days', 21, true, 5, 14, '#22C55E'),
('lt222222-2222-2222-2222-222222222222', 'Sick Leave', 'Medical leave days', 10, false, 0, 1, '#EF4444'),
('lt333333-3333-3333-3333-333333333333', 'Maternity Leave', 'Maternity leave for mothers', 90, false, 0, 30, '#F59E0B'),
('lt444444-4444-4444-4444-444444444444', 'Emergency Leave', 'Unplanned emergency situations', 5, false, 0, 0, '#DC2626'),
('lt555555-5555-5555-5555-555555555555', 'Study Leave', 'Educational leave for courses', 7, false, 0, 30, '#8B5CF6')
) AS v(id, name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, notice_period_days, color)
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE leave_types.id = v.id);

-- Insert sample tasks
INSERT INTO public.tasks (
  id, title, description, assigned_to, assigned_by, priority, status, 
  due_date, progress_percentage, department, estimated_hours
) VALUES
('t1111111-1111-1111-1111-111111111111', 'System Performance Optimization', 'Optimize database queries and improve system response time', 
 (SELECT id FROM employees WHERE employee_id = 'EMP002' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'in_progress', '2024-02-15 17:00:00+03', 75, 'Engineering', 40),
('t2222222-2222-2222-2222-222222222222', 'Employee Onboarding Process Review', 'Review and update the new employee onboarding process', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP005' LIMIT 1), 
 'medium', 'pending', '2024-02-20 17:00:00+03', 0, 'Human Resources', 16),
('t3333333-3333-3333-3333-333333333333', 'Q1 Marketing Campaign Planning', 'Plan and execute Q1 digital marketing strategy', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'in_progress', '2024-03-31 17:00:00+03', 30, 'Marketing', 80)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tickets with proper user references
INSERT INTO public.tickets (
  id, title, description, priority, status, category, department
) VALUES
('tk111111-1111-1111-1111-111111111111', 'Laptop WiFi Connection Issues', 'Cannot connect to office WiFi network consistently', 'medium', 'open', 'technical', 'IT'),
('tk222222-2222-2222-2222-222222222222', 'Payroll Query', 'Question about overtime calculation in payslip', 'high', 'in_progress', 'payroll', 'Human Resources'),
('tk333333-3333-3333-3333-333333333333', 'Office Equipment Request', 'Request for additional monitor for workstation', 'low', 'open', 'facilities', 'Administration')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assets
INSERT INTO public.assets (
  id, name, asset_tag, category, status, location, purchase_date,
  purchase_value, current_value
) VALUES
('as111111-1111-1111-1111-111111111111', 'MacBook Pro 16"', 'LPT001', 'Laptop', 'assigned', 'Nairobi Office', '2023-06-15', 350000, 280000),
('as222222-2222-2222-2222-222222222222', 'Dell Monitor 27"', 'MON001', 'Monitor', 'assigned', 'Nairobi Office', '2023-03-20', 45000, 35000),
('as333333-3333-3333-3333-333333333333', 'HP Laser Printer', 'PRT001', 'Printer', 'available', 'Storage Room', '2022-11-10', 75000, 50000),
('as444444-4444-4444-4444-444444444444', 'Lenovo ThinkPad', 'LPT002', 'Laptop', 'assigned', 'Nairobi Office', '2023-08-01', 180000, 150000),
('as555555-5555-5555-5555-555555555555', 'iPhone 14 Pro', 'PHN001', 'Phone', 'assigned', 'Nairobi Office', '2023-09-15', 120000, 95000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample user roles
INSERT INTO public.user_roles (id, name, description, permissions, color) VALUES
('ur111111-1111-1111-1111-111111111111', 'Administrator', 'Full system access', '["all"]', 'bg-red-100 text-red-800'),
('ur222222-2222-2222-2222-222222222222', 'HR Manager', 'Human resources management', '["employees", "leave", "payroll", "attendance"]', 'bg-blue-100 text-blue-800'),
('ur333333-3333-3333-3333-333333333333', 'Project Manager', 'Project and task management', '["tasks", "projects", "employees_read"]', 'bg-green-100 text-green-800'),
('ur444444-4444-4444-4444-444444444444', 'Employee', 'Basic employee access', '["profile", "leave_request", "attendance_self"]', 'bg-gray-100 text-gray-800'),
('ur555555-5555-5555-5555-555555555555', 'Team Lead', 'Team leadership responsibilities', '["team_management", "task_assignment"]', 'bg-purple-100 text-purple-800')
ON CONFLICT (id) DO NOTHING;

-- Insert attendance records for existing employees
INSERT INTO public.attendance_records (
  employee_id, clock_in_time, clock_out_time, total_hours, status, location
) 
SELECT 
  e.id,
  '2024-01-22 08:00:00+03'::timestamptz + (RANDOM() * INTERVAL '2 hours'),
  '2024-01-22 17:00:00+03'::timestamptz + (RANDOM() * INTERVAL '1 hour'),
  8.0 + (RANDOM() * 2 - 1),
  'clocked_out',
  'Office'
FROM employees e 
WHERE e.status = 'active'
LIMIT 3;

-- Insert leave balances for existing employees
INSERT INTO public.leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days)
SELECT 
  e.id,
  lt.id,
  2024,
  lt.max_days_per_year,
  FLOOR(RANDOM() * (lt.max_days_per_year / 3))::integer,
  FLOOR(RANDOM() * 3)::integer
FROM employees e
CROSS JOIN leave_types lt
WHERE e.status = 'active'
AND NOT EXISTS (
  SELECT 1 FROM leave_balances lb 
  WHERE lb.employee_id = e.id 
  AND lb.leave_type_id = lt.id 
  AND lb.year = 2024
)
LIMIT 20;
-- Insert leave types (simple approach)
INSERT INTO public.leave_types (name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, notice_period_days, color) 
VALUES
('Annual Leave', 'Yearly vacation days', 21, true, 5, 14, '#22C55E'),
('Sick Leave', 'Medical leave days', 10, false, 0, 1, '#EF4444'),
('Maternity Leave', 'Maternity leave for mothers', 90, false, 0, 30, '#F59E0B'),
('Emergency Leave', 'Unplanned emergency situations', 5, false, 0, 0, '#DC2626');

-- Insert sample assets
INSERT INTO public.assets (name, asset_tag, category, status, location, purchase_date, purchase_value, current_value) 
VALUES
('MacBook Pro 16"', 'LPT001', 'Laptop', 'available', 'Nairobi Office', '2023-06-15', 350000, 280000),
('Dell Monitor 27"', 'MON001', 'Monitor', 'available', 'Nairobi Office', '2023-03-20', 45000, 35000),
('HP Laser Printer', 'PRT001', 'Printer', 'available', 'Storage Room', '2022-11-10', 75000, 50000),
('Lenovo ThinkPad', 'LPT002', 'Laptop', 'available', 'Nairobi Office', '2023-08-01', 180000, 150000);

-- Insert sample user roles
INSERT INTO public.user_roles (name, description, permissions, color) 
VALUES
('Administrator', 'Full system access', '["all"]', 'bg-red-100 text-red-800'),
('HR Manager', 'Human resources management', '["employees", "leave", "payroll", "attendance"]', 'bg-blue-100 text-blue-800'),
('Project Manager', 'Project and task management', '["tasks", "projects", "employees_read"]', 'bg-green-100 text-green-800'),
('Employee', 'Basic employee access', '["profile", "leave_request", "attendance_self"]', 'bg-gray-100 text-gray-800');

-- Insert attendance records for existing employees (simplified)
INSERT INTO public.attendance_records (employee_id, clock_in_time, clock_out_time, total_hours, status, location) 
SELECT 
  id,
  '2024-01-22 08:00:00+03',
  '2024-01-22 17:00:00+03',
  8.0,
  'clocked_out',
  'Office'
FROM employees 
WHERE status = 'active' 
LIMIT 3;
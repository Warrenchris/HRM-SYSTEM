-- Insert leave types
INSERT INTO public.leave_types (name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, notice_period_days, color) 
VALUES
('Annual Leave', 'Yearly vacation days', 21, true, 5, 14, '#22C55E'),
('Sick Leave', 'Medical leave days', 10, false, 0, 1, '#EF4444'),
('Maternity Leave', 'Maternity leave for mothers', 90, false, 0, 30, '#F59E0B'),
('Emergency Leave', 'Unplanned emergency situations', 5, false, 0, 0, '#DC2626'),
('Study Leave', 'Educational leave for courses', 7, false, 0, 30, '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Insert sample assets
INSERT INTO public.assets (name, asset_tag, category, status, location, purchase_date, purchase_value, current_value) 
VALUES
('MacBook Pro 16"', 'LPT001', 'Laptop', 'available', 'Nairobi Office', '2023-06-15', 350000, 280000),
('Dell Monitor 27"', 'MON001', 'Monitor', 'available', 'Nairobi Office', '2023-03-20', 45000, 35000),
('HP Laser Printer', 'PRT001', 'Printer', 'available', 'Storage Room', '2022-11-10', 75000, 50000),
('Lenovo ThinkPad', 'LPT002', 'Laptop', 'available', 'Nairobi Office', '2023-08-01', 180000, 150000),
('iPhone 14 Pro', 'PHN001', 'Phone', 'available', 'Nairobi Office', '2023-09-15', 120000, 95000)
ON CONFLICT (asset_tag) DO NOTHING;

-- Insert sample user roles
INSERT INTO public.user_roles (name, description, permissions, color) 
VALUES
('Administrator', 'Full system access', '["all"]', 'bg-red-100 text-red-800'),
('HR Manager', 'Human resources management', '["employees", "leave", "payroll", "attendance"]', 'bg-blue-100 text-blue-800'),
('Project Manager', 'Project and task management', '["tasks", "projects", "employees_read"]', 'bg-green-100 text-green-800'),
('Employee', 'Basic employee access', '["profile", "leave_request", "attendance_self"]', 'bg-gray-100 text-gray-800'),
('Team Lead', 'Team leadership responsibilities', '["team_management", "task_assignment"]', 'bg-purple-100 text-purple-800')
ON CONFLICT (name) DO NOTHING;
-- Insert dummy companies
INSERT INTO public.companies (id, name, display_name, industry, country, currency, timezone, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'TechCorp Solutions', 'TechCorp', 'Technology', 'Kenya', 'KES', 'Africa/Nairobi', 'Leading software development company', true),
('22222222-2222-2222-2222-222222222222', 'Global Manufacturing Ltd', 'GlobalMfg', 'Manufacturing', 'Uganda', 'UGX', 'Africa/Kampala', 'Industrial manufacturing company', true);

-- Insert dummy employees
INSERT INTO public.employees (
  id, employee_id, first_name, last_name, email, phone, position, department, 
  join_date, salary, basic_salary, status, company_id, gender, date_of_birth,
  permanent_address, office_email, personal_email, marital_status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EMP001', 'John', 'Doe', 'john.doe@techcorp.com', '+254700123456', 'Software Engineer', 'Engineering', '2023-01-15', 120000, 100000, 'active', '11111111-1111-1111-1111-111111111111', 'male', '1990-05-15', '123 Nairobi Street', 'john.doe@techcorp.com', 'john.personal@gmail.com', 'single'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EMP002', 'Jane', 'Smith', 'jane.smith@techcorp.com', '+254700123457', 'HR Manager', 'Human Resources', '2022-06-01', 150000, 130000, 'active', '11111111-1111-1111-1111-111111111111', 'female', '1988-08-22', '456 Mombasa Road', 'jane.smith@techcorp.com', 'jane.personal@gmail.com', 'married'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'EMP003', 'Michael', 'Johnson', 'michael.johnson@techcorp.com', '+254700123458', 'Project Manager', 'Engineering', '2022-03-10', 140000, 120000, 'active', '11111111-1111-1111-1111-111111111111', 'male', '1985-12-03', '789 Kisumu Avenue', 'michael.johnson@techcorp.com', 'michael.personal@gmail.com', 'married'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'EMP004', 'Sarah', 'Wilson', 'sarah.wilson@techcorp.com', '+254700123459', 'Marketing Specialist', 'Marketing', '2023-09-01', 90000, 80000, 'active', '11111111-1111-1111-1111-111111111111', 'female', '1992-03-18', '321 Eldoret Road', 'sarah.wilson@techcorp.com', 'sarah.personal@gmail.com', 'single'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'EMP005', 'David', 'Brown', 'david.brown@globalmfg.com', '+256700123460', 'Operations Manager', 'Operations', '2021-11-15', 160000, 140000, 'active', '22222222-2222-2222-2222-222222222222', 'male', '1983-07-25', '654 Kampala Street', 'david.brown@globalmfg.com', 'david.personal@gmail.com', 'married');

-- Insert leave types
INSERT INTO public.leave_types (id, name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, notice_period_days, color) VALUES
('lt111111-1111-1111-1111-111111111111', 'Annual Leave', 'Yearly vacation days', 21, true, 5, 14, '#22C55E'),
('lt222222-2222-2222-2222-222222222222', 'Sick Leave', 'Medical leave days', 10, false, 0, 1, '#EF4444'),
('lt333333-3333-3333-3333-333333333333', 'Maternity Leave', 'Maternity leave for mothers', 90, false, 0, 30, '#F59E0B'),
('lt444444-4444-4444-4444-444444444444', 'Emergency Leave', 'Unplanned emergency situations', 5, false, 0, 0, '#DC2626');

-- Insert leave balances for employees
INSERT INTO public.leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lt111111-1111-1111-1111-111111111111', 2024, 21, 5, 0),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lt222222-2222-2222-2222-222222222222', 2024, 10, 2, 0),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lt111111-1111-1111-1111-111111111111', 2024, 21, 8, 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lt222222-2222-2222-2222-222222222222', 2024, 10, 1, 0),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'lt111111-1111-1111-1111-111111111111', 2024, 21, 12, 0),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'lt111111-1111-1111-1111-111111111111', 2024, 21, 3, 5),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'lt111111-1111-1111-1111-111111111111', 2024, 21, 7, 0);

-- Insert attendance records (recent week)
INSERT INTO public.attendance_records (
  employee_id, clock_in_time, clock_out_time, total_hours, status, 
  location, company_id
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22 08:00:00+03', '2024-01-22 17:00:00+03', 8.0, 'clocked_out', 'Nairobi Office', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-23 08:15:00+03', '2024-01-23 17:30:00+03', 8.25, 'clocked_out', 'Nairobi Office', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-22 08:30:00+03', '2024-01-22 17:15:00+03', 7.75, 'clocked_out', 'Nairobi Office', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23 08:00:00+03', '2024-01-23 17:00:00+03', 8.0, 'clocked_out', 'Nairobi Office', '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-22 09:00:00+03', '2024-01-22 18:00:00+03', 8.0, 'clocked_out', 'Nairobi Office', '11111111-1111-1111-1111-111111111111'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-22 07:45:00+03', '2024-01-22 16:45:00+03', 8.0, 'clocked_out', 'Kampala Office', '22222222-2222-2222-2222-222222222222');

-- Insert sample tasks
INSERT INTO public.tasks (
  id, title, description, assigned_to, assigned_by, priority, status, 
  due_date, progress_percentage, company_id, department, estimated_hours
) VALUES
('t1111111-1111-1111-1111-111111111111', 'Implement User Authentication', 'Develop login and registration system with JWT tokens', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'high', 'in_progress', '2024-02-15 17:00:00+03', 75, '11111111-1111-1111-1111-111111111111', 'Engineering', 40),
('t2222222-2222-2222-2222-222222222222', 'Update Employee Handbook', 'Review and update company policies in the handbook', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'medium', 'pending', '2024-02-20 17:00:00+03', 0, '11111111-1111-1111-1111-111111111111', 'Human Resources', 16),
('t3333333-3333-3333-3333-333333333333', 'Q1 Marketing Campaign', 'Plan and execute Q1 digital marketing campaign', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'high', 'in_progress', '2024-03-31 17:00:00+03', 30, '11111111-1111-1111-1111-111111111111', 'Marketing', 80),
('t4444444-4444-4444-4444-444444444444', 'Database Optimization', 'Optimize database queries for better performance', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'medium', 'completed', '2024-01-30 17:00:00+03', 100, '11111111-1111-1111-1111-111111111111', 'Engineering', 24);

-- Insert sample tickets
INSERT INTO public.tickets (
  id, title, description, priority, status, category, department,
  created_by, assigned_to, company_id
) VALUES
('tk111111-1111-1111-1111-111111111111', 'Laptop WiFi Connection Issues', 'Cannot connect to office WiFi network consistently', 'medium', 'open', 'technical', 'IT', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111'),
('tk222222-2222-2222-2222-222222222222', 'Payroll Discrepancy', 'Overtime hours not calculated correctly in last payslip', 'high', 'in_progress', 'payroll', 'Human Resources', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
('tk333333-3333-3333-3333-333333333333', 'Office AC Not Working', 'Air conditioning unit in conference room B is not cooling', 'low', 'resolved', 'facilities', 'Administration', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, '11111111-1111-1111-1111-111111111111');

-- Insert sample assets
INSERT INTO public.assets (
  id, name, asset_tag, category, status, location, purchase_date,
  purchase_value, current_value, current_employee_id, company_id
) VALUES
('as111111-1111-1111-1111-111111111111', 'MacBook Pro 16"', 'LPT001', 'Laptop', 'assigned', 'Nairobi Office', '2023-06-15', 350000, 280000, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
('as222222-2222-2222-2222-222222222222', 'Dell Monitor 27"', 'MON001', 'Monitor', 'assigned', 'Nairobi Office', '2023-03-20', 45000, 35000, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
('as333333-3333-3333-3333-333333333333', 'HP Laser Printer', 'PRT001', 'Printer', 'available', 'Storage Room', '2022-11-10', 75000, 50000, NULL, '11111111-1111-1111-1111-111111111111'),
('as444444-4444-4444-4444-444444444444', 'Lenovo ThinkPad', 'LPT002', 'Laptop', 'assigned', 'Nairobi Office', '2023-08-01', 180000, 150000, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111');

-- Insert sample leave requests
INSERT INTO public.leave_requests (
  id, employee_id, leave_type_id, start_date, end_date, total_days,
  reason, status, manager_approval_status, hr_approval_status
) VALUES
('lr111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lt111111-1111-1111-1111-111111111111', '2024-02-05', '2024-02-09', 5, 'Family vacation', 'approved', 'approved', 'approved'),
('lr222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lt111111-1111-1111-1111-111111111111', '2024-03-01', '2024-03-05', 5, 'Personal time off', 'pending', 'pending', 'pending'),
('lr333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'lt222222-2222-2222-2222-222222222222', '2024-01-25', '2024-01-25', 1, 'Medical appointment', 'approved', 'approved', 'approved');

-- Insert sample payroll records
INSERT INTO public.payroll_records (
  id, employee_id, pay_period, pay_date, basic_salary, allowances,
  overtime_pay, gross_salary, paye_tax, nssf_deduction, shif_deduction,
  total_deductions, net_salary, status, company_id
) VALUES
('pr111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'January 2024', '2024-01-31', 100000, 15000, 5000, 120000, 18000, 2160, 600, 20760, 99240, 'paid', '11111111-1111-1111-1111-111111111111'),
('pr222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'January 2024', '2024-01-31', 130000, 20000, 0, 150000, 25500, 2160, 600, 28260, 121740, 'paid', '11111111-1111-1111-1111-111111111111'),
('pr333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'January 2024', '2024-01-31', 120000, 18000, 2000, 140000, 22000, 2160, 600, 24760, 115240, 'paid', '11111111-1111-1111-1111-111111111111');

-- Insert sample appraisals
INSERT INTO public.appraisals (
  id, employee_id, appraiser_id, appraisal_period, due_date, status,
  overall_rating, self_appraisal_completed, manager_appraisal_completed
) VALUES
('ap111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q4 2023', '2024-01-15', 'completed', 4, true, true),
('ap222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Q4 2023', '2024-01-20', 'pending', NULL, false, false);

-- Insert sample user roles
INSERT INTO public.user_roles (id, name, description, permissions, color) VALUES
('ur111111-1111-1111-1111-111111111111', 'Administrator', 'Full system access', '["all"]', 'bg-red-100 text-red-800'),
('ur222222-2222-2222-2222-222222222222', 'HR Manager', 'Human resources management', '["employees", "leave", "payroll", "attendance"]', 'bg-blue-100 text-blue-800'),
('ur333333-3333-3333-3333-333333333333', 'Project Manager', 'Project and task management', '["tasks", "projects", "employees_read"]', 'bg-green-100 text-green-800'),
('ur444444-4444-4444-4444-444444444444', 'Employee', 'Basic employee access', '["profile", "leave_request", "attendance_self"]', 'bg-gray-100 text-gray-800');
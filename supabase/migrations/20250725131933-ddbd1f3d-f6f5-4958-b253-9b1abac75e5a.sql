-- Insert tasks using existing employees
INSERT INTO public.tasks (title, description, assigned_to, assigned_by, priority, status, due_date, progress_percentage, department, estimated_hours) 
VALUES
('Database Performance Optimization', 'Improve query performance and add proper indexing', 
 (SELECT id FROM employees WHERE employee_id = 'EMP002' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'in_progress', '2024-02-15 17:00:00+03', 75, 'Engineering', 40),
('Employee Handbook Update', 'Review and update company policies', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP005' LIMIT 1), 
 'medium', 'pending', '2024-02-20 17:00:00+03', 0, 'Human Resources', 16),
('Marketing Campaign Setup', 'Prepare Q1 marketing materials and strategy', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'in_progress', '2024-03-31 17:00:00+03', 30, 'Marketing', 80);

-- Insert sample leave requests
INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, manager_approval_status, hr_approval_status)
SELECT 
  e.id,
  lt.id,
  '2024-02-05',
  '2024-02-09',
  5,
  'Family vacation',
  'approved',
  'approved',
  'approved'
FROM employees e, leave_types lt
WHERE e.employee_id = 'EMP002' AND lt.name = 'Annual Leave'
LIMIT 1;

-- Insert payroll records
INSERT INTO public.payroll_records (employee_id, pay_period, pay_date, basic_salary, allowances, overtime_pay, gross_salary, paye_tax, nssf_deduction, shif_deduction, total_deductions, net_salary, status)
SELECT 
  id,
  'January 2024',
  '2024-01-31',
  basic_salary,
  COALESCE(basic_salary * 0.15, 0),
  COALESCE(basic_salary * 0.05, 0),
  COALESCE(basic_salary * 1.20, basic_salary),
  COALESCE(basic_salary * 0.15, 0),
  2160,
  600,
  COALESCE(basic_salary * 0.15, 0) + 2760,
  COALESCE(basic_salary * 1.05, basic_salary) - 2760,
  'paid'
FROM employees 
WHERE basic_salary IS NOT NULL 
LIMIT 3;
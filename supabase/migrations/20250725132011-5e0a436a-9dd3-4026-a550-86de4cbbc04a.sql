-- Insert sample tasks with correct status values
INSERT INTO public.tasks (title, description, assigned_to, assigned_by, priority, status, due_date, progress_percentage, department, estimated_hours) 
VALUES
('Database Performance Optimization', 'Improve query performance and add proper indexing', 
 (SELECT id FROM employees WHERE employee_id = 'EMP002' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'pending', '2024-02-15 17:00:00+03', 0, 'Engineering', 40),
('Employee Handbook Update', 'Review and update company policies', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP005' LIMIT 1), 
 'medium', 'pending', '2024-02-20 17:00:00+03', 0, 'Human Resources', 16),
('Marketing Campaign Setup', 'Prepare Q1 marketing materials and strategy', 
 (SELECT id FROM employees WHERE employee_id = 'EMP004' LIMIT 1), 
 (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1), 
 'high', 'pending', '2024-03-31 17:00:00+03', 0, 'Marketing', 80);

-- Insert sample leave balances for existing employees
INSERT INTO public.leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days)
SELECT 
  e.id,
  lt.id,
  2024,
  lt.max_days_per_year,
  FLOOR(RANDOM() * 5)::integer,
  0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.status = 'active'
AND lt.name IN ('Annual Leave', 'Sick Leave')
LIMIT 10;
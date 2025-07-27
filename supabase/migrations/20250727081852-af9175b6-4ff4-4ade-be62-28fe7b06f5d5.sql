-- Add indexes to improve performance for leave management queries

-- Indexes for leave_requests table
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type_id ON leave_requests(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_end_date ON leave_requests(end_date);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status_created ON leave_requests(status, created_at DESC);

-- Indexes for leave_balances table
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON leave_balances(employee_id, year);

-- Indexes for leave_types table
CREATE INDEX IF NOT EXISTS idx_leave_types_is_active ON leave_types(is_active);

-- Indexes for employees table (for join performance)
CREATE INDEX IF NOT EXISTS idx_employees_id ON employees(id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Indexes for profiles table (for user lookup performance)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
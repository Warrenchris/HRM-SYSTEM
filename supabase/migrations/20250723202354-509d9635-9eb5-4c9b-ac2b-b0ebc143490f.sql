-- Create leave types table
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_days_per_year INTEGER NOT NULL DEFAULT 0,
  carry_over_allowed BOOLEAN NOT NULL DEFAULT false,
  max_carry_over_days INTEGER DEFAULT 0,
  requires_medical_certificate BOOLEAN DEFAULT false,
  notice_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  emergency_contact TEXT,
  handover_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approval_workflow TEXT NOT NULL DEFAULT 'manager_hr' CHECK (approval_workflow IN ('manager_hr', 'hr_only', 'manager_hr_ceo')),
  manager_approval_status TEXT DEFAULT 'pending' CHECK (manager_approval_status IN ('pending', 'approved', 'rejected')),
  manager_approved_by UUID,
  manager_approved_date TIMESTAMP WITH TIME ZONE,
  manager_comments TEXT,
  hr_approval_status TEXT DEFAULT 'pending' CHECK (hr_approval_status IN ('pending', 'approved', 'rejected')),
  hr_approved_by UUID,
  hr_approved_date TIMESTAMP WITH TIME ZONE,
  hr_comments TEXT,
  ceo_approval_status TEXT DEFAULT 'pending' CHECK (ceo_approval_status IN ('pending', 'approved', 'rejected')),
  ceo_approved_by UUID,
  ceo_approved_date TIMESTAMP WITH TIME ZONE,
  ceo_comments TEXT,
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  allocated_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  pending_days INTEGER NOT NULL DEFAULT 0,
  carried_over_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Create leave policies table
CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('general', 'accrual', 'carry_over', 'approval', 'notice')),
  rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default leave types
INSERT INTO leave_types (name, description, max_days_per_year, carry_over_allowed, max_carry_over_days, color) VALUES
('Annual Leave', 'Yearly vacation entitlement', 25, true, 5, '#3B82F6'),
('Sick Leave', 'Medical leave for illness', 10, false, 0, '#EF4444'),
('Personal Leave', 'Personal time off', 5, false, 0, '#10B981'),
('Emergency Leave', 'Urgent family matters', 3, false, 0, '#F59E0B'),
('Maternity Leave', 'Maternity leave entitlement', 90, false, 0, '#EC4899'),
('Paternity Leave', 'Paternity leave entitlement', 14, false, 0, '#8B5CF6'),
('Study Leave', 'Educational development', 5, true, 2, '#06B6D4'),
('Bereavement Leave', 'Leave for family loss', 5, false, 0, '#6B7280');

-- Enable RLS on all tables
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_types
CREATE POLICY "Everyone can view leave types" ON leave_types FOR SELECT USING (true);
CREATE POLICY "HR and Admins can manage leave types" ON leave_types FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')));

-- RLS Policies for leave_requests
CREATE POLICY "Employees can view their own leave requests" ON leave_requests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles p JOIN employees e ON p.employee_id = e.id 
                 WHERE p.user_id = auth.uid() AND e.id = leave_requests.employee_id));

CREATE POLICY "Employees can create their own leave requests" ON leave_requests FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p JOIN employees e ON p.employee_id = e.id 
                      WHERE p.user_id = auth.uid() AND e.id = leave_requests.employee_id));

CREATE POLICY "Employees can update their pending requests" ON leave_requests FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles p JOIN employees e ON p.employee_id = e.id 
                 WHERE p.user_id = auth.uid() AND e.id = leave_requests.employee_id AND status = 'pending'));

CREATE POLICY "Managers can view team leave requests" ON leave_requests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('manager', 'admin', 'hr')));

CREATE POLICY "Managers and HR can approve leave requests" ON leave_requests FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('manager', 'admin', 'hr', 'ceo')));

CREATE POLICY "HR and Admins can manage all leave requests" ON leave_requests FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')));

-- RLS Policies for leave_balances
CREATE POLICY "Employees can view their own leave balances" ON leave_balances FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles p JOIN employees e ON p.employee_id = e.id 
                 WHERE p.user_id = auth.uid() AND e.id = leave_balances.employee_id));

CREATE POLICY "HR and Admins can manage all leave balances" ON leave_balances FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')));

-- RLS Policies for leave_policies
CREATE POLICY "Everyone can view active leave policies" ON leave_policies FOR SELECT 
  USING (is_active = true);
CREATE POLICY "HR and Admins can manage leave policies" ON leave_policies FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')));

-- Create functions for leave management
CREATE OR REPLACE FUNCTION calculate_leave_days(start_date DATE, end_date DATE) 
RETURNS INTEGER AS $$
BEGIN
  -- Calculate working days (excluding weekends)
  RETURN (SELECT COUNT(*)
          FROM generate_series(start_date, end_date, '1 day'::interval) AS date_series
          WHERE EXTRACT(DOW FROM date_series) NOT IN (0, 6));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_leave_balance_on_approval() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update leave balance when a request is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE leave_balances 
    SET used_days = used_days + NEW.total_days,
        pending_days = GREATEST(0, pending_days - NEW.total_days),
        updated_at = now()
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id 
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Reduce pending days when request is rejected
    UPDATE leave_balances 
    SET pending_days = GREATEST(0, pending_days - NEW.total_days),
        updated_at = now()
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id 
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pending_balance_on_request() 
RETURNS TRIGGER AS $$
BEGIN
  -- Add to pending balance when request is created
  INSERT INTO leave_balances (employee_id, leave_type_id, year, pending_days)
  VALUES (NEW.employee_id, NEW.leave_type_id, EXTRACT(YEAR FROM NEW.start_date), NEW.total_days)
  ON CONFLICT (employee_id, leave_type_id, year)
  DO UPDATE SET pending_days = leave_balances.pending_days + NEW.total_days,
                updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_balance_on_approval
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_leave_balance_on_approval();

CREATE TRIGGER trigger_update_pending_balance
  AFTER INSERT ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_balance_on_request();

-- Create function to initialize leave balances for new employees
CREATE OR REPLACE FUNCTION initialize_employee_leave_balances(emp_id UUID, join_year INTEGER DEFAULT NULL) 
RETURNS VOID AS $$
DECLARE
  leave_type_rec RECORD;
  target_year INTEGER;
BEGIN
  target_year := COALESCE(join_year, EXTRACT(YEAR FROM CURRENT_DATE));
  
  FOR leave_type_rec IN SELECT * FROM leave_types WHERE is_active = true LOOP
    INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days)
    VALUES (emp_id, leave_type_rec.id, target_year, leave_type_rec.max_days_per_year)
    ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
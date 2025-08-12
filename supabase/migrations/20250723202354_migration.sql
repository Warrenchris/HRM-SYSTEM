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

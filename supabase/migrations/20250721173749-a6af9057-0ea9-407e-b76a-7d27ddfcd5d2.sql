-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  category TEXT NOT NULL CHECK (category IN ('auth', 'user_management', 'system', 'data_access', 'security')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  is_system_setting BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(setting_key)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Everyone can view roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL
USING (get_current_user_role() = 'admin');

-- RLS policies for user_activity_logs
CREATE POLICY "Admins and HR can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'hr'));

CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for user_settings
CREATE POLICY "Admins can manage all settings" 
ON public.user_settings 
FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Everyone can view non-system settings" 
ON public.user_settings 
FOR SELECT 
USING (NOT is_system_setting OR get_current_user_role() = 'admin');

-- Insert default roles
INSERT INTO public.user_roles (name, description, permissions, is_system_role, color) VALUES
('Super Admin', 'Full system access with all permissions', '["*"]', true, 'bg-red-100 text-red-800'),
('Admin', 'Administrative access to most system features', '["user_management", "system_settings", "reports", "audit_logs"]', true, 'bg-purple-100 text-purple-800'),
('HR Manager', 'Human resources management and employee data access', '["employee_management", "payroll_access", "leave_management", "performance_reviews"]', false, 'bg-blue-100 text-blue-800'),
('Finance Manager', 'Financial operations and payroll management', '["payroll_management", "expense_approval", "financial_reports", "budget_management"]', false, 'bg-green-100 text-green-800'),
('Department Head', 'Department-level management and team oversight', '["team_management", "approve_requests", "view_reports", "schedule_management"]', false, 'bg-orange-100 text-orange-800'),
('Employee', 'Standard employee access to personal data and basic features', '["view_own_data", "submit_requests", "clock_in_out", "view_schedule"]', true, 'bg-gray-100 text-gray-800');

-- Insert default system settings
INSERT INTO public.user_settings (setting_key, setting_value, category, is_system_setting) VALUES
('auth_session_timeout', '{"value": 3600, "unit": "seconds"}', 'Authentication', true),
('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": false}', 'Security', true),
('max_login_attempts', '{"value": 5}', 'Security', true),
('account_lockout_duration', '{"value": 900, "unit": "seconds"}', 'Security', true),
('backup_frequency', '{"value": "daily", "time": "02:00"}', 'System', true),
('email_notifications', '{"enabled": true, "types": ["security", "system", "updates"]}', 'Notifications', false),
('audit_log_retention', '{"value": 90, "unit": "days"}', 'System', true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
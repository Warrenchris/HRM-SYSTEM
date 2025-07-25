-- Create system_logs table for tracking system changes and updates
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system logs
CREATE POLICY "Only admins can view system logs" 
ON public.system_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "System can insert logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_action ON public.system_logs(action);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);

-- Insert sample system logs
INSERT INTO public.system_logs (action, resource_type, resource_id, user_id, details, severity) VALUES
('user_login', 'auth', 'user_123', null, '{"login_method": "email"}', 'info'),
('expense_approved', 'expense', 'EXP-001', null, '{"amount": 150.00, "category": "Travel"}', 'info'),
('employee_created', 'employee', 'EMP-001', null, '{"name": "John Doe", "department": "IT"}', 'info'),
('system_backup', 'system', 'backup_001', null, '{"backup_size": "2.5GB", "status": "completed"}', 'info'),
('failed_login_attempt', 'auth', 'user_456', null, '{"attempts": 3, "ip": "192.168.1.100"}', 'warning'),
('database_error', 'system', null, null, '{"error": "Connection timeout", "query": "SELECT * FROM users"}', 'error');
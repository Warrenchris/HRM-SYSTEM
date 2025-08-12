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

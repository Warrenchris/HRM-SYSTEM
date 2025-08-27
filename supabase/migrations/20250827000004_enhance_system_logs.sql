-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    company_id UUID REFERENCES public.companies(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON public.system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_company ON public.system_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);

-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their company's logs"
ON public.system_logs
FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM user_company_roles 
        WHERE company_id = system_logs.company_id
    )
);

CREATE POLICY "Users can create logs for their company"
ON public.system_logs
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM user_company_roles 
        WHERE company_id = system_logs.company_id
    )
);

-- Function to set IP address via RLS
CREATE OR REPLACE FUNCTION public.set_system_log_ip()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ip_address = request.header('x-real-ip');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically set IP address
CREATE TRIGGER set_system_log_ip_trigger
    BEFORE INSERT ON public.system_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_system_log_ip();

-- Create view for formatted logs
CREATE OR REPLACE VIEW public.formatted_system_logs AS
SELECT 
    sl.id,
    sl.timestamp,
    u.email as user_email,
    sl.action,
    sl.resource_type,
    sl.resource_id,
    sl.details,
    sl.severity,
    sl.ip_address,
    sl.user_agent,
    c.name as company_name
FROM system_logs sl
LEFT JOIN auth.users u ON sl.user_id = u.id
LEFT JOIN companies c ON sl.company_id = c.id;

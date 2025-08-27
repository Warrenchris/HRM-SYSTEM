-- Check if system_logs table exists, if not create it
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON public.system_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_logs_resource_type ON public.system_logs(resource_type);

-- Ensure RLS is enabled
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "System logs access policy" ON public.system_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.system_logs;

-- Create new policies
CREATE POLICY "Admins can view all logs" ON public.system_logs
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can view their own logs" ON public.system_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Insert a test log to verify everything is working
INSERT INTO public.system_logs (
    action,
    resource_type,
    details,
    severity
) VALUES (
    'SYSTEM_TEST',
    'system',
    jsonb_build_object('message', 'System logging test'),
    'info'
);

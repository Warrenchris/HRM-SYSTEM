-- Function to log system activities
CREATE OR REPLACE FUNCTION public.log_system_activity(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_severity TEXT DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_log_id uuid;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Insert log entry
  INSERT INTO public.system_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    p_action,
    p_resource_type,
    p_resource_id,
    v_user_id,
    p_details,
    p_severity,
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent'
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_system_activity TO authenticated;

-- Add trigger functions for common tables to auto-log activities

-- Example for employees table
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_system_activity(
      'CREATE',
      'employee',
      NEW.id::text,
      jsonb_build_object(
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'department', NEW.department
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_system_activity(
      'UPDATE',
      'employee',
      NEW.id::text,
      jsonb_build_object(
        'changes', jsonb_strip_nulls(jsonb_object_agg(
          key,
          CASE
            WHEN OLD.key IS DISTINCT FROM NEW.key
            THEN jsonb_build_object('old', OLD.key, 'new', NEW.key)
            ELSE NULL
          END
        ))
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_system_activity(
      'DELETE',
      'employee',
      OLD.id::text,
      jsonb_build_object(
        'first_name', OLD.first_name,
        'last_name', OLD.last_name,
        'department', OLD.department
      )
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for employees table
DROP TRIGGER IF EXISTS log_employee_changes ON public.employees;
CREATE TRIGGER log_employee_changes
AFTER INSERT OR UPDATE OR DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.log_employee_changes();

-- Add similar triggers for other important tables (attendance, leave, payroll, etc.)

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_system_logs_search ON public.system_logs
USING gin ((to_tsvector('english', action || ' ' || resource_type || ' ' || coalesce(details->>'message', ''))));

-- Update RLS policies for system_logs
DROP POLICY IF EXISTS "System logs access policy" ON public.system_logs;
CREATE POLICY "System logs access policy" ON public.system_logs
FOR ALL USING (
  -- Admins can see all logs
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  OR
  -- Users can see their own logs
  user_id = auth.uid()
  OR
  -- HR can see employee-related logs
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'hr'
    )
    AND resource_type IN ('employee', 'attendance', 'leave', 'payroll')
  )
);

-- Function to clean up old logs (optional, can be scheduled)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(days_to_keep integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.system_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::interval
  AND severity != 'critical'
  RETURNING count(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$;

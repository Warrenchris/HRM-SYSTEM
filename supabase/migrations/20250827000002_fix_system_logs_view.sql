-- Drop the view if it exists
DROP VIEW IF EXISTS public.system_logs_with_users;

-- Update the system logs view to include user profiles and employee information
CREATE OR REPLACE VIEW public.system_logs_with_users AS
SELECT 
    sl.*,
    e.first_name,
    e.last_name,
    e.email
FROM public.system_logs sl
LEFT JOIN public.profiles p ON sl.user_id = p.user_id
LEFT JOIN public.employees e ON p.employee_id = e.id;

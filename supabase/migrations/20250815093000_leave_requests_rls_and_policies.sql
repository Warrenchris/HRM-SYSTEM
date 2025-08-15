-- Enable RLS and add policies to prevent self-approval and enforce role-based approval workflow

-- Enable RLS on leave_requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicates when re-running
DROP POLICY IF EXISTS "Employees can view own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Employees can insert own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Approvers can update leave requests" ON public.leave_requests;

-- Employees can see their own leave requests
CREATE POLICY "Employees can view own leave requests"
ON public.leave_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id = leave_requests.employee_id
  )
  OR public.get_current_user_role() IN ('admin', 'hr', 'manager', 'ceo')
);

-- Employees can create leave requests for themselves only
CREATE POLICY "Employees can insert own leave requests"
ON public.leave_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id = leave_requests.employee_id
  )
);

-- Approvers (manager/hr/ceo/admin) can update approval fields, but not for their own requests
CREATE POLICY "Approvers can update leave requests"
ON public.leave_requests
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'hr', 'manager', 'ceo')
)
WITH CHECK (
  (
    -- Prevent self-approval: the acting user's employee_id must not equal the request's employee_id
    NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.employee_id = leave_requests.employee_id
    )
  )
);

-- Optional: Restrict general updates from employees to only allowing cancel while pending
DROP POLICY IF EXISTS "Employees can cancel own pending leave" ON public.leave_requests;
CREATE POLICY "Employees can cancel own pending leave"
ON public.leave_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id = leave_requests.employee_id
  )
  AND status = 'pending'
)
WITH CHECK (
  status = 'cancelled' OR status = 'pending'
);



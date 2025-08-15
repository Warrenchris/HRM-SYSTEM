-- Allow approvers to SELECT pending leave requests while preventing viewing own requests

-- Approvers can view pending leave requests (manager/hr/admin)
-- Note: IF NOT EXISTS is not supported in CREATE POLICY, so we rely on idempotent naming
DROP POLICY IF EXISTS "Approvers can view pending leave requests" ON public.leave_requests;
CREATE POLICY "Approvers can view pending leave requests"
ON public.leave_requests
FOR SELECT
USING (
  public.get_current_user_role() IN ('admin','hr','manager')
  AND status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id = public.leave_requests.employee_id
  )
);



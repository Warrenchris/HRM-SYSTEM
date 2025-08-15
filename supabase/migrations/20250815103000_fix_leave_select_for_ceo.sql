-- Ensure CEOs can view pending leave requests for final approval

DROP POLICY IF EXISTS "Approvers can view pending leave requests" ON public.leave_requests;

CREATE POLICY "Approvers (incl CEO) can view pending leave requests"
ON public.leave_requests
FOR SELECT
USING (
  public.get_current_user_role() IN ('admin','hr','manager','ceo')
  AND status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id = public.leave_requests.employee_id
  )
);



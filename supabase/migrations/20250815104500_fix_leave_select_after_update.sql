-- Ensure approvers can SELECT leave_requests after status changes (e.g., after approval)

DROP POLICY IF EXISTS "Approvers can view all leave requests" ON public.leave_requests;
CREATE POLICY "Approvers can view all leave requests"
ON public.leave_requests
FOR SELECT
USING (
  public.get_current_user_role() IN ('admin','hr','manager','ceo')
);



-- Fix CEO approval permissions for leave requests and implement strict self-approval rules

-- New Policy: No one can approve their own requests EXCEPT CEO/Admin
-- - Managers cannot approve their own leave requests
-- - HR cannot approve their own leave requests  
-- - Only CEO/Admin can approve their own leave requests (override capability)

-- The issue: CEOs/Admins cannot approve leave requests due to conflicting RLS policies
-- Solution: Ensure approvers can update leave requests with proper self-approval constraints

-- Drop and recreate the update policy to be more explicit about what's allowed
DROP POLICY IF EXISTS "Approvers can update leave requests" ON public.leave_requests;

-- Create a comprehensive update policy that allows approvers to update approval fields
-- but prevents self-approval except for CEO/Admin who can approve their own requests
CREATE POLICY "Approvers can update leave requests with strict self-approval rules"
ON public.leave_requests
FOR UPDATE
USING (
  -- User must be an approver (manager, hr, ceo, or admin)
  public.get_current_user_role() IN ('admin', 'hr', 'manager', 'ceo')
  AND (
    -- Either it's not a self-approval (different employee_id)
    NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.employee_id = leave_requests.employee_id
    )
    OR 
    -- OR it's a CEO/Admin (only CEO/Admin can approve their own requests)
    public.get_current_user_role() IN ('admin', 'ceo')
  )
)
WITH CHECK (
  -- Same conditions as USING clause for consistency
  public.get_current_user_role() IN ('admin', 'hr', 'manager', 'ceo')
  AND (
    NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.employee_id = leave_requests.employee_id
    )
    OR 
    public.get_current_user_role() IN ('admin', 'ceo')
  )
);

-- Ensure the approval_workflow column accepts all valid values
-- Add 'hr_ceo' as a valid workflow if it's not already there
ALTER TABLE public.leave_requests 
  DROP CONSTRAINT IF EXISTS leave_requests_approval_workflow_check;

ALTER TABLE public.leave_requests 
  ADD CONSTRAINT leave_requests_approval_workflow_check 
  CHECK (approval_workflow IN ('manager_hr', 'hr_only', 'manager_hr_ceo', 'hr_ceo'));

-- Add indexes for better performance on approval queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_manager_approval_status 
  ON public.leave_requests(manager_approval_status) 
  WHERE manager_approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_leave_requests_hr_approval_status 
  ON public.leave_requests(hr_approval_status) 
  WHERE hr_approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_leave_requests_ceo_approval_status 
  ON public.leave_requests(ceo_approval_status) 
  WHERE ceo_approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_leave_requests_status_workflow 
  ON public.leave_requests(status, approval_workflow);
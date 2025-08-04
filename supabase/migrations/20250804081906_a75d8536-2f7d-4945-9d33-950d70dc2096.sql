-- Allow employees to create leave balance records via triggers
-- This is needed when submitting leave requests that update pending balances
CREATE POLICY "Employees can create leave balance records via triggers" 
ON public.leave_balances 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employee_id = employee_id
  )
);

-- Also allow employees to update their own leave balances (for pending days)
CREATE POLICY "Employees can update their own leave balances" 
ON public.leave_balances 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employee_id = employee_id
  )
);
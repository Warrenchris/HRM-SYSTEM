-- Block self-approvals for expenses and attendance at the database level

-- Expenses: tighten update policy to prevent approving/rejecting own expense
DROP POLICY IF EXISTS "Managers and HR can approve/reject expenses" ON public.expenses;
CREATE POLICY "Approvers cannot approve their own expenses"
ON public.expenses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('admin','hr','manager','ceo')
  )
)
WITH CHECK (
  -- acting user's employee_id must not equal expense owner
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.employee_id IS DISTINCT FROM public.expenses.employee_id
  )
);

-- Attendance: prevent employees from approving their own records; only hr/admin can approve
DROP POLICY IF EXISTS "Employees can update their own attendance" ON public.attendance_records;
CREATE POLICY "Employees can update their own attendance (no approval fields)" 
ON public.attendance_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() AND e.id = attendance_records.employee_id
))
WITH CHECK (
  -- Disallow flipping is_approved on own records
  attendance_records.employee_id = (
    SELECT p.employee_id FROM profiles p WHERE p.user_id = auth.uid()
  )
  AND (is_approved IS NOT TRUE)
);

DROP POLICY IF EXISTS "HR and Admins can manage all attendance records" ON public.attendance_records;
CREATE POLICY "Only HR/Admin can approve attendance (no self-approval)" 
ON public.attendance_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
))
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND (p.role IN ('admin','hr'))
    AND p.employee_id IS DISTINCT FROM attendance_records.employee_id
  )
);



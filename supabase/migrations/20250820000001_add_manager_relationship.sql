-- Add manager_id column to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id);

-- Drop the previously created policy if it exists
DROP POLICY IF EXISTS "Managers can create appraisals for direct reports" ON public.appraisals;

-- Create a new policy that allows managers and HR to create appraisals
CREATE POLICY "Allow managers and HR to create appraisals"
ON public.appraisals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (
      -- Allow if user is HR or admin
      p.role IN ('hr', 'admin')
      OR
      -- Allow if user is the manager of the employee
      (p.role = 'manager' AND EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = appraisals.employee_id
        AND e.manager_id = p.employee_id
      ))
    )
  )
);

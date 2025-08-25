-- First check if manager_id column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE public.employees
        ADD COLUMN manager_id UUID REFERENCES public.employees(id);
    END IF;
END $$;

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Managers can create appraisals for direct reports" ON public.appraisals;

-- Create the new policy
CREATE POLICY "Managers can create appraisals for direct reports" 
ON public.appraisals 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        LEFT JOIN public.employees e ON e.id = p.employee_id
        WHERE p.user_id = auth.uid()
        AND (
            -- Allow if user is HR or admin
            p.role IN ('hr', 'admin')
            OR 
            -- Allow if user is the manager of the employee
            (p.role = 'manager' AND EXISTS (
                SELECT 1 
                FROM public.employees emp
                WHERE emp.id = appraisals.employee_id 
                AND emp.manager_id = p.employee_id
            ))
        )
    )
);

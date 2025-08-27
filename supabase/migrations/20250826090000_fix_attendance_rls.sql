-- Fix attendance RLS: allow employees to update their own records (without self-approval)
-- and allow privileged roles to manage attendance within their company

-- Clean up conflicting/older policies
DROP POLICY IF EXISTS "Users can manage attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Only HR/Admin can approve attendance (no self-approval)" ON public.attendance_records;
DROP POLICY IF EXISTS "Employees can update their own attendance (no approval fields)" ON public.attendance_records;
DROP POLICY IF EXISTS "HR and Admins can manage all attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "HR and Admins can view all attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Company members can view attendance" ON public.attendance_records;

-- Ensure helper functions exist (no-op if already present)
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(company_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = company_uuid
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- View policy: company members can view records for their company
CREATE POLICY "Company members can view attendance"
ON public.attendance_records
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

-- Employees can update their own records (cannot self-approve)
CREATE POLICY "Employees update own attendance (no self-approval)"
ON public.attendance_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.employees e ON e.id = p.employee_id
    WHERE p.user_id = auth.uid()
      AND e.id = attendance_records.employee_id
      AND public.user_belongs_to_company(attendance_records.company_id)
  )
)
WITH CHECK (
  attendance_records.employee_id = (
    SELECT p.employee_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
  AND public.user_belongs_to_company(attendance_records.company_id)
  AND (attendance_records.is_approved IS NOT TRUE)
);

-- Privileged roles can manage all records in their company
CREATE POLICY "Privileged roles manage company attendance"
ON public.attendance_records
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.company_id = attendance_records.company_id
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin','hr','manager','ceo')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.company_id = attendance_records.company_id
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin','hr','manager','ceo')
  )
);

-- Backfill company_id on attendance records missing it
UPDATE public.attendance_records ar
SET company_id = e.company_id
FROM public.employees e
WHERE ar.company_id IS NULL AND ar.employee_id = e.id;



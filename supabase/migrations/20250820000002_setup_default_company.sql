-- Create a default company if it doesn't exist
DO $$ 
BEGIN
  -- First, check if we have any companies
  IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
    -- Insert the default company
    INSERT INTO public.companies (
      id,
      name,
      email,
      phone,
      address,
      website,
      logo_url,
      subscription_status,
      subscription_end_date,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'Default Company',
      'admin@defaultcompany.com',
      '+1234567890',
      '123 Business Street',
      'www.defaultcompany.com',
      NULL,
      'active',
      NOW() + INTERVAL '1 year',
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- Update all existing employees to be associated with the default company if they don't have a company
UPDATE public.employees
SET company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1)
WHERE company_id IS NULL;

-- Update all existing profiles to be associated with the default company if they don't have a company
UPDATE public.profiles
SET company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1)
WHERE company_id IS NULL;

-- Make company_id required for employees and profiles
ALTER TABLE public.employees
ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE public.profiles
ALTER COLUMN company_id SET NOT NULL;

-- Create triggers to automatically set company_id for new employees and profiles
CREATE OR REPLACE FUNCTION public.set_default_company()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_employee_company ON public.employees;
CREATE TRIGGER set_employee_company
BEFORE INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.set_default_company();

DROP TRIGGER IF EXISTS set_profile_company ON public.profiles;
CREATE TRIGGER set_profile_company
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_default_company();

-- Update policies to ensure proper access
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
CREATE POLICY "Users can view their company"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.user_id = auth.uid()
    AND public.profiles.company_id = companies.id
  )
);

DROP POLICY IF EXISTS "Users can view company employees" ON public.employees;
CREATE POLICY "Users can view company employees"
ON public.employees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.user_id = auth.uid()
    AND public.profiles.company_id = public.employees.company_id
  )
);

-- Ensure HR/Admin roles can manage company data
DROP POLICY IF EXISTS "HR and Admins can manage company" ON public.companies;
CREATE POLICY "HR and Admins can manage company"
ON public.companies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.user_id = auth.uid()
    AND public.profiles.role IN ('admin', 'hr', 'ceo')
  )
);

-- Update attendance records to include company_id if missing
UPDATE public.attendance_records ar
SET company_id = e.company_id
FROM public.employees e
WHERE ar.employee_id = e.id
AND ar.company_id IS NULL;

-- Make company_id required for attendance records
ALTER TABLE public.attendance_records
ALTER COLUMN company_id SET NOT NULL;

-- Create trigger for attendance records
DROP TRIGGER IF EXISTS set_attendance_company ON public.attendance_records;
CREATE TRIGGER set_attendance_company
BEFORE INSERT ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.set_default_company();

-- Drop existing functions
DROP FUNCTION IF EXISTS public.update_employees_company(uuid);
DROP FUNCTION IF EXISTS public.update_profiles_company(uuid);

-- Create functions for updating company IDs
CREATE FUNCTION public.update_employees_company(new_company_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.employees
  SET company_id = new_company_id
  WHERE employees.company_id IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION public.update_profiles_company(new_company_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET company_id = new_company_id
  WHERE profiles.company_id IS NULL;
END;
$$ LANGUAGE plpgsql;

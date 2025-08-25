-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Allow HR/Admin/Manager to view all employees
CREATE POLICY "HR and Admins can view all employees"
ON public.employees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr', 'manager', 'ceo')
  )
);

-- Allow HR/Admin/Manager to view company data
CREATE POLICY "HR and Admins can view companies"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr', 'manager', 'ceo')
  )
);

-- Allow employees to view their own company
CREATE POLICY "Employees can view their own company"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.employee_id = e.id
    WHERE p.user_id = auth.uid()
    AND e.company_id = companies.id
  )
);

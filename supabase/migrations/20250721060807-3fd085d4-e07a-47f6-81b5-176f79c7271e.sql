-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Admins and HR can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Fix the unique constraint issue
ALTER TABLE public.employees 
DROP CONSTRAINT IF EXISTS employees_email_key;

-- Make email nullable and create a unique index that allows nulls
ALTER TABLE public.employees 
ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX employees_email_unique ON public.employees(email) WHERE email IS NOT NULL;

-- Create security definer function to safely check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "Admins and HR can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'hr')
);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL
USING (
  public.get_current_user_role() = 'admin'
);

-- Also add a policy for INSERT operations specifically
CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin'
);
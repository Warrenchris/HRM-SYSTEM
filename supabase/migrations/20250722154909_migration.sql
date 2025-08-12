-- Fix infinite recursion by using security definer functions
-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Company owners and admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_members;
DROP POLICY IF EXISTS "Users can accept invitations" ON public.company_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_company_role(company_uuid uuid)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.company_members 
  WHERE user_id = auth.uid() 
  AND company_id = company_uuid 
  AND status = 'active'
  LIMIT 1;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_company_member(company_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND company_id = company_uuid 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer functions
CREATE POLICY "Company owners and admins can manage members" 
ON public.company_members 
FOR ALL 
USING (
  get_user_company_role(company_id) IN ('owner', 'admin')
);

CREATE POLICY "Users can view company members of their companies" 
ON public.company_members 
FOR SELECT 
USING (
  is_user_company_member(company_id)
);

CREATE POLICY "Users can accept invitations" 
ON public.company_members 
FOR UPDATE 
USING (
  user_id = auth.uid() AND status = 'pending'
);
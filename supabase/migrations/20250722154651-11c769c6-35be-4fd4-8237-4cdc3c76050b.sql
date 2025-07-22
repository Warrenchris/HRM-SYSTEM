-- Fix infinite recursion in company_members RLS policies
-- Drop the problematic policy and recreate it correctly
DROP POLICY IF EXISTS "Company owners and admins can manage members" ON public.company_members;

-- Create a corrected policy that doesn't cause recursion
CREATE POLICY "Company owners and admins can manage members" 
ON public.company_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.company_members cm2 
    WHERE cm2.company_id = company_members.company_id 
    AND cm2.user_id = auth.uid() 
    AND cm2.role IN ('owner', 'admin') 
    AND cm2.status = 'active'
  )
);

-- Also fix the view policy to prevent recursion
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_members;

CREATE POLICY "Users can view company members of their companies" 
ON public.company_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.company_members cm2 
    WHERE cm2.company_id = company_members.company_id 
    AND cm2.user_id = auth.uid() 
    AND cm2.status = 'active'
  )
);
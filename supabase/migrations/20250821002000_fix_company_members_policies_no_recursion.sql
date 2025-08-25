-- Fix recursive RLS policies on company_members by avoiding self-references
-- Use profiles.company_id + profiles.role to authorize access

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Drop any previous recursive policies
DROP POLICY IF EXISTS "Members can view other members in their company" ON public.company_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.company_members;

-- Keep allowing users to see their own membership rows
DROP POLICY IF EXISTS "Users can view own memberships" ON public.company_members;
CREATE POLICY "Users can view own memberships"
ON public.company_members
FOR SELECT
USING (user_id = auth.uid());

-- Allow admins to view all members in their company (profiles-based, no recursion)
DROP POLICY IF EXISTS "Admins can view members in their company" ON public.company_members;
CREATE POLICY "Admins can view members in their company"
ON public.company_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.company_id = company_members.company_id
    AND p.role IN ('admin', 'hr', 'manager', 'ceo')
  )
);

-- Allow admins to manage (insert/update/delete) members in their company
DROP POLICY IF EXISTS "Admins can manage members in their company" ON public.company_members;
CREATE POLICY "Admins can manage members in their company"
ON public.company_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.company_id = company_members.company_id
    AND p.role IN ('admin', 'hr', 'ceo')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.company_id = company_members.company_id
    AND p.role IN ('admin', 'hr', 'ceo')
  )
);



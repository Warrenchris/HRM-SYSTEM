-- Remove recursive profiles policies and keep non-recursive ones

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop profiles policies that reference company_members to avoid recursion
DROP POLICY IF EXISTS "Company members can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Company admins can manage profiles in their company" ON public.profiles;

-- Ensure basic non-recursive policies exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DEV relaxed read (keep if not already added by earlier migration)
DROP POLICY IF EXISTS "dev_auth_can_read_profiles" ON public.profiles;
CREATE POLICY "dev_auth_can_read_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);



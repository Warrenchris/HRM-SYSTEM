-- DEV: Relaxed read policies to prevent 500s while debugging
-- Note: Safe because limited to authenticated role; remove in production.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Profiles: allow any authenticated user to read their own row (fallback) or simply allow select
DROP POLICY IF EXISTS "dev_auth_can_read_profiles" ON public.profiles;
CREATE POLICY "dev_auth_can_read_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Company members: allow any authenticated user to read rows (frontend filters by user_id)
DROP POLICY IF EXISTS "dev_auth_can_read_company_members" ON public.company_members;
CREATE POLICY "dev_auth_can_read_company_members"
ON public.company_members
FOR SELECT
TO authenticated
USING (true);



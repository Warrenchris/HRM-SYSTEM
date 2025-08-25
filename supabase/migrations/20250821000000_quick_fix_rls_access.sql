-- Minimal RLS policies to allow the app to read required data safely

-- Ensure RLS is enabled where needed
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;

-- Profiles: allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Company members: allow users to read their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON public.company_members;
CREATE POLICY "Users can view own memberships"
ON public.company_members
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Announcements: allow anyone authenticated to view active announcements within their company
-- Falls back to simple check using profiles.company_id = announcements.company_id
DO $$ BEGIN
  IF to_regclass('public.announcements') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view active announcements in company" ON public.announcements;
    CREATE POLICY "Users can view active announcements in company"
    ON public.announcements
    FOR SELECT
    USING (
      status = 'active' AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.company_id = announcements.company_id
      )
    );
  END IF;
END $$;



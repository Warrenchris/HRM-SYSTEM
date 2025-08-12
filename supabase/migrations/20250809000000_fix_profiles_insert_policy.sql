-- Fix local signup failing due to profiles RLS blocking trigger insert
-- This policy allows inserts into public.profiles (used by the on_auth_user_created trigger)
-- Consider tightening in production if needed.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow inserts for any context (trigger/admin). This is primarily to unblock local dev.
DROP POLICY IF EXISTS "Allow insert on profiles from trigger" ON public.profiles;
CREATE POLICY "Allow insert on profiles from trigger"
ON public.profiles
FOR INSERT
TO PUBLIC
WITH CHECK (true);



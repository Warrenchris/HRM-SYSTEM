-- Normalize auth.users rows to avoid GoTrue 500s on /token
-- Adds functions:
--  - public.normalize_auth_user(_user_id uuid)
--  - public.normalize_all_auth_users()
-- These set required string fields to '' and JSON fields to '{}' and timestamps to now() when NULL.

CREATE OR REPLACE FUNCTION public.normalize_auth_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET
    confirmation_token         = COALESCE(confirmation_token, ''),
    recovery_token             = COALESCE(recovery_token, ''),
    email_change_token_new     = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change               = COALESCE(email_change, ''),
    reauthentication_token     = COALESCE(reauthentication_token, ''),
    raw_app_meta_data          = COALESCE(raw_app_meta_data, '{}'::jsonb),
    raw_user_meta_data         = COALESCE(raw_user_meta_data, '{}'::jsonb),
    created_at                 = COALESCE(created_at, now()),
    updated_at                 = COALESCE(updated_at, now())
  WHERE id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_all_auth_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE auth.users
  SET
    confirmation_token         = COALESCE(confirmation_token, ''),
    recovery_token             = COALESCE(recovery_token, ''),
    email_change_token_new     = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change               = COALESCE(email_change, ''),
    reauthentication_token     = COALESCE(reauthentication_token, ''),
    raw_app_meta_data          = COALESCE(raw_app_meta_data, '{}'::jsonb),
    raw_user_meta_data         = COALESCE(raw_user_meta_data, '{}'::jsonb),
    created_at                 = COALESCE(created_at, now()),
    updated_at                 = COALESCE(updated_at, now());

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.normalize_auth_user(uuid) IS 'Normalize a single auth.users row to avoid GoTrue NULL scan errors.';
COMMENT ON FUNCTION public.normalize_all_auth_users() IS 'Normalize all auth.users rows to avoid GoTrue NULL scan errors.';

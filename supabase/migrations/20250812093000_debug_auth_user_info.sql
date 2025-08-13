-- Debug helper to inspect auth.users and auth.identities for a given email
-- Development only. SECURITY DEFINER so client can call it.

CREATE OR REPLACE FUNCTION public.debug_auth_user_info(_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  has_email_identity boolean,
  identity_count integer,
  identities jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    EXISTS (
      SELECT 1 FROM auth.identities i 
      WHERE i.user_id = u.id AND i.provider = 'email'
    ) AS has_email_identity,
    (SELECT COUNT(*) FROM auth.identities i2 WHERE i2.user_id = u.id) AS identity_count,
    (
      SELECT coalesce(json_agg(json_build_object('provider', i.provider, 'provider_id', i.provider_id)), '[]'::json)
      FROM auth.identities i
      WHERE i.user_id = u.id
    ) AS identities
  FROM auth.users u
  WHERE lower(u.email) = lower(_email)
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.debug_auth_user_info(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.debug_auth_user_info(text) TO anon, authenticated, service_role;



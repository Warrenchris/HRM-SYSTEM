-- Ensure dev_create_auth_user also creates an identity row for email/password logins
-- and backfill any missing identities for existing auth.users

CREATE OR REPLACE FUNCTION public.dev_create_auth_user(_email text, _password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user directly in auth schema
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
    now()
  )
  RETURNING id INTO new_user_id;

  -- Create email identity so password login works
  INSERT INTO auth.identities (
    id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    'email',
    json_build_object('email', _email),
    now(),
    now(),
    now(),
    _email
  );

  -- Ensure profile row exists
  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (new_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_user_id;
END;
$$;

-- Backfill: create missing email identities for any existing users (idempotent)
INSERT INTO auth.identities (id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id)
SELECT
  gen_random_uuid(),
  u.id,
  'email',
  json_build_object('email', u.email),
  now(), now(), now(), u.email
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id AND i.provider = 'email'
WHERE i.user_id IS NULL;



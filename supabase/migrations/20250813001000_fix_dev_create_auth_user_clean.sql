-- Clean redefinition of dev_create_auth_user to avoid NULL-caused GoTrue 500s
-- Fields explicitly set: tokens, metadata, timestamps; do NOT touch phone to avoid unique constraint issues

CREATE OR REPLACE FUNCTION public.dev_create_auth_user(_email text, _password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{}'::jsonb,
    '{}'::jsonb
  ) RETURNING id INTO new_user_id;

  -- Ensure email/password identity exists
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

COMMENT ON FUNCTION public.dev_create_auth_user(text, text) IS 'Create an auth user with required non-NULL defaults to avoid GoTrue NULL scan errors.';

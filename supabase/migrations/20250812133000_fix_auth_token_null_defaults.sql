-- Fix auth token columns that can be NULL and break GoTrue scans
-- Context: GoTrue may scan token fields into strings; NULL values can trigger 500s on /auth/v1/token

-- 1) Backfill any existing NULLs to empty strings (idempotent)
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR
  recovery_token IS NULL OR
  email_change_token_new IS NULL OR
  reauthentication_token IS NULL;

-- 2) Ensure our dev helper creates users with non-NULL token fields
CREATE OR REPLACE FUNCTION public.dev_create_auth_user(_email text, _password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, reauthentication_token,
    created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    '', '', '', '',
    now(), now()
  )
  RETURNING id INTO new_user_id;

  -- Ensure an email identity exists
  INSERT INTO auth.identities (
    id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    'email',
    json_build_object('email', _email),
    now(), now(), now(), _email
  ) ON CONFLICT DO NOTHING;

  -- Ensure profile row exists
  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (new_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_user_id;
END;
$$;

-- 3) Ensure ensure_user_for_employee also sets non-NULL token fields on insert
CREATE OR REPLACE FUNCTION public.ensure_user_for_employee(
  _email text,
  _password text,
  _employee_id uuid,
  _role text DEFAULT 'employee'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_role text;
BEGIN
  v_role := CASE lower(coalesce(_role, 'employee'))
    WHEN 'admin' THEN 'admin'
    WHEN 'hr' THEN 'hr'
    WHEN 'manager' THEN 'manager'
    ELSE 'employee'
  END;

  SELECT id INTO v_user_id FROM auth.users WHERE email = _email LIMIT 1;

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, reauthentication_token,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      _email,
      crypt(_password, gen_salt('bf')),
      now(),
      '', '', '', '',
      now(), now()
    ) RETURNING id INTO v_user_id;

    -- Ensure an email identity exists
    INSERT INTO auth.identities (
      id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(), v_user_id, 'email', json_build_object('email', _email), now(), now(), now(), _email
    ) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (v_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.profiles
  SET role = v_role,
      employee_id = _employee_id,
      updated_at = now()
  WHERE user_id = v_user_id;

  UPDATE public.employees
  SET auth_email = _email
  WHERE id = _employee_id;

  RETURN v_user_id;
END;
$$;

-- 4) Permissions
REVOKE ALL ON FUNCTION public.dev_create_auth_user(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dev_create_auth_user(text, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) TO anon, authenticated, service_role;



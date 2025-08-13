-- Backfill missing timestamps for existing auth.users rows
UPDATE auth.users
SET created_at = COALESCE(created_at, now())
WHERE created_at IS NULL;

UPDATE auth.users
SET updated_at = COALESCE(updated_at, now())
WHERE updated_at IS NULL;

-- Ensure future user creation via helper functions sets timestamps

-- 1) Replace ensure_user_for_employee to include created_at/updated_at on insert
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
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      _email,
      crypt(_password, gen_salt('bf')),
      now(),
      now(),
      now()
    ) RETURNING id INTO v_user_id;
  END IF;

  -- Ensure email identity exists for both new and pre-existing users
  IF NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'email',
      json_build_object('email', _email),
      now(), now(), now(), _email
    );
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

REVOKE ALL ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) TO anon, authenticated, service_role;

-- 2) Replace dev_create_auth_user to include created_at/updated_at on insert
CREATE OR REPLACE FUNCTION public.dev_create_auth_user(_email text, _password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user directly in auth schema
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    now(),
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



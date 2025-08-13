-- Robust helper to create or link a user to an employee in one atomic step
-- This avoids client-side RLS issues and duplicate/partial creations

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
  -- Normalize role input
  v_role := CASE lower(coalesce(_role, 'employee'))
    WHEN 'admin' THEN 'admin'
    WHEN 'hr' THEN 'hr'
    WHEN 'manager' THEN 'manager'
    ELSE 'employee'
  END;

  -- Try to find existing auth user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = _email LIMIT 1;

  -- If none, create one (email/password identity)
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      _email,
      crypt(_password, gen_salt('bf')),
      now()
    ) RETURNING id INTO v_user_id;

    -- Ensure an email identity exists
    INSERT INTO auth.identities (
      id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'email',
      json_build_object('email', _email),
      now(), now(), now(), _email
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Ensure a profile exists
  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (v_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update profile with role and employee link
  UPDATE public.profiles
  SET role = v_role,
      employee_id = _employee_id,
      updated_at = now()
  WHERE user_id = v_user_id;

  -- Keep employees.auth_email in sync
  UPDATE public.employees
  SET auth_email = _email
  WHERE id = _employee_id;

  RETURN v_user_id;
END;
$$;

-- Restrict and grant execute permissions for client usage
REVOKE ALL ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_for_employee(text, text, uuid, text) TO anon, authenticated, service_role;



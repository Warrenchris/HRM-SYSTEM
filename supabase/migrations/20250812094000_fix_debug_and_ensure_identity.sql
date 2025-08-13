-- Fix debug function type mismatch and harden ensure_user_for_employee to backfill identity

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
    u.email::text,
    EXISTS (
      SELECT 1 FROM auth.identities i 
      WHERE i.user_id = u.id AND i.provider = 'email'
    ) AS has_email_identity,
    (SELECT COUNT(*) FROM auth.identities i2 WHERE i2.user_id = u.id) AS identity_count,
    (
      SELECT coalesce(json_agg(json_build_object('provider', i.provider, 'provider_id', i.provider_id)), '[]'::json)
      FROM auth.identities i
      WHERE i.user_id = u.id
    )::jsonb AS identities
  FROM auth.users u
  WHERE lower(u.email) = lower(_email)
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.debug_auth_user_info(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.debug_auth_user_info(text) TO anon, authenticated, service_role;

-- Identity backfill in ensure_user_for_employee
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



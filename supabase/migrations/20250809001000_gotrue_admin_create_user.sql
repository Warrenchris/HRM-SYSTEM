-- Local helper function to create a user directly when GoTrue admin API fails
-- WARNING: Development use only. Remove or protect in production environments.

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

  -- Ensure profile row exists
  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (new_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_user_id;
END;
$$;



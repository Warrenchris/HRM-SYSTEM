-- Fix dev_create_auth_user to prevent NULL field issues that cause GoTrue 500 errors
-- This ensures all required fields are explicitly set to non-NULL values

CREATE OR REPLACE FUNCTION public.dev_create_auth_user(_email text, _password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user directly in auth schema with ALL required fields explicitly set
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
    -- Explicitly set all token fields to empty strings to prevent NULL scanning errors
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change,
    reauthentication_token,
    phone_change_token,
    phone_change,
    -- Set metadata to empty JSON objects
    raw_app_meta_data,
    raw_user_meta_data,
    -- Ensure proper authentication context
    aud,
    role
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
    now(),
    '', -- confirmation_token
    '', -- recovery_token
    '', -- email_change_token_new
    '', -- email_change_token_current
    '', -- email_change
    '', -- reauthentication_token
    '', -- phone_change_token
    '', -- phone_change
    '{}'::jsonb, -- raw_app_meta_data
    '{}'::jsonb, -- raw_user_meta_data
    'authenticated', -- aud
    'authenticated' -- role
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

  -- Ensure profile row exists with proper role
  INSERT INTO public.profiles (user_id, role, is_active)
  VALUES (new_user_id, 'employee', true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_user_id;
END;
$$;

-- Add comment explaining the purpose
COMMENT ON FUNCTION public.dev_create_auth_user(text, text) IS 
'Creates a new auth user with all required fields explicitly set to prevent GoTrue NULL scanning errors. 
This function ensures compatibility with GoTrue by avoiding NULL values in string and timestamp fields.';

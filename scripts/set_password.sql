-- Idempotent helper to set password by email for local dev
CREATE OR REPLACE FUNCTION public.set_password_by_email(_email text, _new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email)=lower(_email) LIMIT 1;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User not found for %', _email;
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(_new_password, gen_salt('bf')),
      updated_at = now(),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      email_change = COALESCE(email_change, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
  WHERE id = uid;

  -- Ensure email identity exists
  INSERT INTO auth.identities (id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at, provider_id)
  VALUES (gen_random_uuid(), uid, 'email', json_build_object('email', _email), now(), now(), now(), _email)
  ON CONFLICT DO NOTHING;

  -- Final safety normalization
  PERFORM public.normalize_auth_user(uid);
END;
$$;

REVOKE ALL ON FUNCTION public.set_password_by_email(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_password_by_email(text, text) TO anon, authenticated, service_role;



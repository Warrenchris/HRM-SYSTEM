-- Update existing user to admin role (using the logged-in user)
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM public.profiles 
  WHERE role = 'hr' 
  LIMIT 1
);

-- Or alternatively, you can manually create an admin user by updating any existing profile
-- Just replace the email with the one you want to make admin
-- UPDATE public.profiles SET role = 'admin' WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'your-admin-email@domain.com'
-- );
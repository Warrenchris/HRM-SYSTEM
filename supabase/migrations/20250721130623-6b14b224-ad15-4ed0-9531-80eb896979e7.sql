-- Update profiles to link with employees based on auth email
UPDATE profiles 
SET employee_id = e.id
FROM employees e, auth.users u
WHERE profiles.user_id = u.id 
AND u.email = e.email 
AND profiles.employee_id IS NULL;

-- Create a function to automatically link new users to employees
CREATE OR REPLACE FUNCTION public.link_user_to_employee()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to find an employee with matching email
  UPDATE public.profiles 
  SET employee_id = e.id
  FROM employees e
  WHERE profiles.user_id = NEW.id 
  AND e.email = NEW.email
  AND profiles.employee_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically link users to employees on signup
DROP TRIGGER IF EXISTS on_auth_user_created_link_employee ON auth.users;
CREATE TRIGGER on_auth_user_created_link_employee
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_user_to_employee();
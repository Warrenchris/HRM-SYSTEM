-- Fix company owner role assignment to ensure owners are always admins
-- This migration fixes potential role discrepancies and enhances role management

-- Drop and recreate the create_company_with_owner function with stronger role guarantees
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name TEXT,
  company_display_name TEXT DEFAULT NULL,
  selected_plan_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Create the company
  INSERT INTO public.companies (
    name, 
    display_name, 
    created_by,
    subscription_plan_id
  )
  VALUES (
    company_name, 
    COALESCE(company_display_name, company_name), 
    current_user_id,
    selected_plan_id
  )
  RETURNING id INTO new_company_id;
  
  -- Add user as company owner AND ensure they are set as admin in company_members
  INSERT INTO public.company_members (
    user_id, 
    company_id, 
    role, 
    status,
    joined_at
  )
  VALUES (
    current_user_id, 
    new_company_id, 
    'owner',  -- This is their company role
    'active',
    now()
  );
  
  -- Update user's profile with company and explicitly set as admin
  -- This is their system-wide role
  UPDATE public.profiles 
  SET 
    company_id = new_company_id,
    role = 'admin',  -- Explicitly set as admin
    updated_at = now()
  WHERE user_id = current_user_id;
  
  -- Double-check role was set properly and raise exception if not
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = current_user_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Failed to set user role to admin';
  END IF;

  -- Return the new company ID
  RETURN new_company_id;
END;
$$;

-- Update function permissions
REVOKE ALL ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) TO authenticated;

-- Add a trigger to ensure company owners always have admin role in their profile
CREATE OR REPLACE FUNCTION public.ensure_company_owner_is_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is being set as a company owner
  IF NEW.role = 'owner' AND NEW.status = 'active' THEN
    -- Ensure they have admin role in their profile
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE user_id = NEW.user_id
    AND role != 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_owner_admin_role ON public.company_members;

-- Create the trigger
CREATE TRIGGER ensure_owner_admin_role
  AFTER INSERT OR UPDATE ON public.company_members
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_company_owner_is_admin();

-- Add helpful function documentation
COMMENT ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) IS 
'Creates a new company and sets up the creating user as both company owner and system admin.
Ensures the user has proper admin privileges by:
1. Setting them as owner in company_members
2. Setting them as admin in their profile
3. Verifying the role was set properly
4. Adding a safety trigger to maintain role consistency

Parameters:
- company_name: The name of the company
- company_display_name: Optional display name, defaults to company_name if not provided
- selected_plan_id: Optional subscription plan ID';

-- Add an index to improve role checks performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_id, role);

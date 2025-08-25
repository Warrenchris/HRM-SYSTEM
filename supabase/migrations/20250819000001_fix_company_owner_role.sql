-- Enhance company owner role assignment
-- Ensures company owners get admin role automatically

-- Drop the existing function to avoid conflicts
DROP FUNCTION IF EXISTS public.create_company_with_owner(TEXT, TEXT, TEXT);

-- Recreate with enhanced role management
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
  
  -- Add user as company owner
  INSERT INTO public.company_members (
    user_id, 
    company_id, 
    role, 
    status
  )
  VALUES (
    current_user_id, 
    new_company_id, 
    'owner', 
    'active'
  );
  
  -- Update user's profile with company and set as admin
  UPDATE public.profiles 
  SET 
    company_id = new_company_id,
    role = 'admin',
    updated_at = now()
  WHERE user_id = current_user_id;
  
  RETURN new_company_id;
END;
$$;

-- Update function permissions
REVOKE ALL ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) TO authenticated;

-- Add comment for documentation (disambiguate by signature)
COMMENT ON FUNCTION public.create_company_with_owner(TEXT, TEXT, TEXT) IS 
'Creates a new company and sets up the creating user as both company owner and admin. 
Updates the user''s profile with the company ID and admin role.
Parameters:
- company_name: The name of the company
- company_display_name: Optional display name, defaults to company_name if not provided
- selected_plan_id: Optional subscription plan ID';

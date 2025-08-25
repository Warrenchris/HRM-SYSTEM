-- Enable Row Level Security
-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Optional: if you prefer uuid-ossp, uncomment the next line and use uuid_generate_v4()
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Create or replace function to check company membership
CREATE OR REPLACE FUNCTION public.check_company_membership(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = $1
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$;

-- Policies for companies table
CREATE POLICY "Users can view their own companies"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = id
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Company owners can update their companies"
ON public.companies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = id
    AND user_id = auth.uid()
    AND role = 'owner'
    AND status = 'active'
  )
);

-- Policies for employees table
CREATE POLICY "Company members can view employees"
ON public.employees
FOR SELECT
USING (
  public.check_company_membership(company_id)
);

CREATE POLICY "Company admins can manage employees"
ON public.employees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = employees.company_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'hr')
    AND status = 'active'
  )
);

-- Update company_members policies
CREATE POLICY "Members can view other members in their company"
ON public.company_members
FOR SELECT
USING (
  public.check_company_membership(company_id)
);

CREATE POLICY "Owners and admins can manage members"
ON public.company_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = company_members.company_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Function to create company and assign owner
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name text,
  company_display_name text DEFAULT NULL,
  selected_plan_id uuid DEFAULT NULL,
  company_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the company
  INSERT INTO public.companies (
    name,
    display_name,
    subscription_plan_id,
    email,
    created_by,
    updated_by
  ) VALUES (
    company_name,
    COALESCE(company_display_name, company_name),
    selected_plan_id,
    COALESCE(company_email, (SELECT email FROM auth.users WHERE id = current_user_id)),
    current_user_id,
    current_user_id
  ) RETURNING id INTO new_company_id;

  -- Create company membership for owner
  INSERT INTO public.company_members (
    user_id,
    company_id,
    role,
    status,
    joined_at
  ) VALUES (
    current_user_id,
    new_company_id,
    'owner',
    'active',
    now()
  );

  -- Update user's profile with new company
  UPDATE public.profiles
  SET company_id = new_company_id
  WHERE user_id = current_user_id;

  RETURN new_company_id;
END;
$$;

-- Function to invite user to company
CREATE OR REPLACE FUNCTION public.invite_user_to_company(
  email text,
  role text,
  company_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invitation_id uuid;
  inviter_id uuid;
BEGIN
  -- Get current user ID
  inviter_id := auth.uid();
  IF inviter_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if inviter has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = inviter_id
    AND company_id = $3
    AND role IN ('owner', 'admin')
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Create invitation
  INSERT INTO public.company_invitations (
    email,
    company_id,
    role,
    invited_by,
    status,
    expires_at
  ) VALUES (
    email,
    company_id,
    role,
    inviter_id,
    'pending',
    now() + interval '7 days'
  ) RETURNING id INTO new_invitation_id;

  RETURN new_invitation_id;
END;
$$;

-- Create company invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  role text NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'hr', 'manager', 'member'))
);

-- Enable RLS on invitations
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "Company admins can view invitations"
ON public.company_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = company_invitations.company_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

CREATE POLICY "Company admins can manage invitations"
ON public.company_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = company_invitations.company_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_company_invitation(
  invitation_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_email text;
  invitation_record record;
BEGIN
  -- Get current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Get and validate invitation
  SELECT * INTO invitation_record
  FROM public.company_invitations
  WHERE id = invitation_id
  AND email = current_user_email
  AND status = 'pending'
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Create company membership
  INSERT INTO public.company_members (
    user_id,
    company_id,
    role,
    status,
    joined_at
  ) VALUES (
    auth.uid(),
    invitation_record.company_id,
    invitation_record.role,
    'active',
    now()
  );

  -- Update invitation status
  UPDATE public.company_invitations
  SET status = 'accepted',
    accepted_at = now()
  WHERE id = invitation_id;

  -- Update user's profile with new company if they don't have one
  UPDATE public.profiles
  SET company_id = COALESCE(company_id, invitation_record.company_id)
  WHERE user_id = auth.uid();

  RETURN true;
END;
$$;

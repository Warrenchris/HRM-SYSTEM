-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Add company_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add company_id to employees table  
ALTER TABLE public.employees 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add company_id to other relevant tables
ALTER TABLE public.attendance_records 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.payroll_records 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.assets 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tasks 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tickets 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Create company_members table for user-company relationships
CREATE TABLE public.company_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'hr', 'manager', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on company_members
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view companies they belong to" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = companies.id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Company owners can manage their companies" 
ON public.companies 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = companies.id 
    AND user_id = auth.uid()
    AND role = 'owner'
    AND status = 'active'
  )
);

CREATE POLICY "Users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for company_members
CREATE POLICY "Users can view company members of their companies" 
ON public.company_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

CREATE POLICY "Company owners and admins can manage members" 
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

CREATE POLICY "Users can accept invitations" 
ON public.company_members 
FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Update profiles RLS policies to work with companies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and HR can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Company members can view profiles in their company" 
ON public.profiles 
FOR SELECT 
USING (
  company_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = profiles.company_id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Company admins can manage profiles in their company" 
ON public.profiles 
FOR ALL
USING (
  company_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = profiles.company_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'hr')
    AND status = 'active'
  )
);

-- Function to get user's current company
CREATE OR REPLACE FUNCTION public.get_user_current_company()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT company_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Function to create company and assign owner
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name TEXT,
  company_display_name TEXT DEFAULT NULL,
  user_email TEXT DEFAULT NULL
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
  INSERT INTO public.companies (name, display_name, created_by)
  VALUES (company_name, COALESCE(company_display_name, company_name), current_user_id)
  RETURNING id INTO new_company_id;
  
  -- Add user as company owner
  INSERT INTO public.company_members (user_id, company_id, role, status)
  VALUES (current_user_id, new_company_id, 'owner', 'active');
  
  -- Update user's profile with company
  UPDATE public.profiles 
  SET company_id = new_company_id
  WHERE user_id = current_user_id;
  
  RETURN new_company_id;
END;
$$;

-- Trigger to update updated_at columns
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_company_members_user_company ON public.company_members(user_id, company_id);
CREATE INDEX idx_company_members_company ON public.company_members(company_id);
CREATE INDEX idx_profiles_company ON public.profiles(company_id);
CREATE INDEX idx_employees_company ON public.employees(company_id);

-- Insert sample company sizes
CREATE TABLE public.company_sizes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT
);

INSERT INTO public.company_sizes (id, label, description) VALUES
('1-10', '1-10 employees', 'Small startup or micro business'),
('11-50', '11-50 employees', 'Small business'),
('51-200', '51-200 employees', 'Medium business'),
('201-1000', '201-1000 employees', 'Large business'),
('1000+', '1000+ employees', 'Enterprise');
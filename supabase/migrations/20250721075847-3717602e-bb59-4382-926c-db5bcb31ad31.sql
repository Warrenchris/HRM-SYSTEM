-- Extend employees table with comprehensive employee information

-- Add Personal Information fields
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS second_name TEXT,
ADD COLUMN IF NOT EXISTS other_name TEXT,
ADD COLUMN IF NOT EXISTS office_email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
ADD COLUMN IF NOT EXISTS local_address TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
ADD COLUMN IF NOT EXISTS login_password TEXT,

-- Company Information fields
ADD COLUMN IF NOT EXISTS reporting_to TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS office_branch TEXT,
ADD COLUMN IF NOT EXISTS site_project TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS exit_date DATE,

-- Payment Information fields
ADD COLUMN IF NOT EXISTS basic_salary NUMERIC,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC,
ADD COLUMN IF NOT EXISTS bonuses JSONB DEFAULT '[]'::jsonb,

-- Bank Details
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_branch_location TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS branch_code TEXT,
ADD COLUMN IF NOT EXISTS bank_identifier_code TEXT,
ADD COLUMN IF NOT EXISTS kra_pin TEXT,

-- Mpesa Details
ADD COLUMN IF NOT EXISTS mpesa_name TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number TEXT,
ADD COLUMN IF NOT EXISTS mpesa_payment_status TEXT DEFAULT 'inactive',

-- Statutory Information
ADD COLUMN IF NOT EXISTS shif_number TEXT,
ADD COLUMN IF NOT EXISTS nssf_number TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT UNIQUE,

-- Academic Information
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS courses_taken JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS other_academics TEXT,

-- Documents
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb,

-- Next of Kin Information
ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_mobile TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_email TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_person TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT;

-- Update existing email field to be office_email if not already set
UPDATE public.employees 
SET office_email = email 
WHERE office_email IS NULL AND email IS NOT NULL;

-- Create storage bucket for employee documents and photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for employee documents (private)
CREATE POLICY "Employees can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'employee-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employees can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'employee-documents' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')))
);

CREATE POLICY "HR and Admin can view all employee documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'employee-documents' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr'))
);

-- Create storage policies for employee photos (public)
CREATE POLICY "Anyone can view employee photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'employee-photos');

CREATE POLICY "Employees can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'employee-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "HR and Admin can upload employee photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'employee-photos' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'hr'))
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_office_email ON public.employees(office_email);
CREATE INDEX IF NOT EXISTS idx_employees_id_number ON public.employees(id_number);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_office_branch ON public.employees(office_branch);
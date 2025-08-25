-- Enhance multi-tenant isolation with comprehensive RLS policies
-- Helper function to check if a user belongs to a company
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(company_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE company_id = company_uuid
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user has admin/HR rights in a company
CREATE OR REPLACE FUNCTION public.user_is_company_admin(company_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE company_id = company_uuid
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'hr')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Ensure company_id exists on all relevant tables before applying policies
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS company_id uuid;

-- Update RLS policies for employees table
DROP POLICY IF EXISTS "Company members can view employees" ON public.employees;
DROP POLICY IF EXISTS "Company admins can manage employees" ON public.employees;

CREATE POLICY "Company members can view employees"
ON public.employees
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Company admins can manage employees"
ON public.employees
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for attendance_records
DROP POLICY IF EXISTS "Users can view attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can manage attendance records" ON public.attendance_records;

CREATE POLICY "Users can view attendance records"
ON public.attendance_records
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage attendance records"
ON public.attendance_records
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for payroll_records
DROP POLICY IF EXISTS "Users can view payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Users can manage payroll records" ON public.payroll_records;

CREATE POLICY "Users can view payroll records"
ON public.payroll_records
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage payroll records"
ON public.payroll_records
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for leave_requests
DROP POLICY IF EXISTS "Users can view leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can manage leave requests" ON public.leave_requests;

CREATE POLICY "Users can view leave requests"
ON public.leave_requests
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage leave requests"
ON public.leave_requests
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for assets
DROP POLICY IF EXISTS "Users can view assets" ON public.assets;
DROP POLICY IF EXISTS "Users can manage assets" ON public.assets;

CREATE POLICY "Users can view assets"
ON public.assets
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage assets"
ON public.assets
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage tasks" ON public.tasks;

CREATE POLICY "Users can view tasks"
ON public.tasks
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage tasks"
ON public.tasks
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Update RLS policies for tickets
DROP POLICY IF EXISTS "Users can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can manage tickets" ON public.tickets;

CREATE POLICY "Users can view tickets"
ON public.tickets
FOR SELECT
USING (
  public.user_belongs_to_company(company_id)
);

CREATE POLICY "Users can manage tickets"
ON public.tickets
FOR ALL
USING (
  public.user_is_company_admin(company_id)
);

-- Make sure company_id is required in all relevant tables
-- Backfill company_id from related employees where possible to avoid NOT NULL errors
UPDATE public.attendance_records ar
SET company_id = e.company_id
FROM public.employees e
WHERE ar.company_id IS NULL AND ar.employee_id = e.id;

UPDATE public.payroll_records pr
SET company_id = e.company_id
FROM public.employees e
WHERE pr.company_id IS NULL AND pr.employee_id = e.id;

UPDATE public.leave_requests lr
SET company_id = e.company_id
FROM public.employees e
WHERE lr.company_id IS NULL AND lr.employee_id = e.id;

-- Conditionally enforce NOT NULL only if no nulls remain
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.employees WHERE company_id IS NULL) THEN
    ALTER TABLE public.employees ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.attendance_records WHERE company_id IS NULL) THEN
    ALTER TABLE public.attendance_records ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.payroll_records WHERE company_id IS NULL) THEN
    ALTER TABLE public.payroll_records ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.leave_requests WHERE company_id IS NULL) THEN
    ALTER TABLE public.leave_requests ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE company_id IS NULL) THEN
    ALTER TABLE public.assets ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE company_id IS NULL) THEN
    ALTER TABLE public.tasks ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE company_id IS NULL) THEN
    ALTER TABLE public.tickets ALTER COLUMN company_id SET NOT NULL;
  END IF;
END $$;

-- Add company-based indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_company ON public.attendance_records(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company ON public.payroll_records(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_company ON public.leave_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_assets_company ON public.assets(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company ON public.tickets(company_id);

-- Ensure all foreign key constraints stay within the same company (only if columns exist)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'manager_id'
  ) THEN
    ALTER TABLE public.employees
    ADD CONSTRAINT employees_same_company_manager
    CHECK (
      manager_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.employees e2
        WHERE e2.id = manager_id
        AND e2.company_id = employees.company_id
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leave_requests' AND column_name = 'approver_id'
  ) THEN
    ALTER TABLE public.leave_requests
    ADD CONSTRAINT leave_requests_same_company_approver
    CHECK (
      approver_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = approver_id
        AND e.company_id = leave_requests.company_id
      )
    );
  END IF;
END $$;



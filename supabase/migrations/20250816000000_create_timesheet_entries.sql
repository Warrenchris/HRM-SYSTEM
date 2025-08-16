-- Create timesheet_entries table
CREATE TABLE public.timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(5,2),
  entry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_timesheet_entries_employee_id ON public.timesheet_entries(employee_id);
CREATE INDEX idx_timesheet_entries_entry_date ON public.timesheet_entries(entry_date);
CREATE INDEX idx_timesheet_entries_status ON public.timesheet_entries(status);
CREATE INDEX idx_timesheet_entries_company_id ON public.timesheet_entries(company_id);

-- Create RLS policies for timesheet_entries
CREATE POLICY "Employees can view their own timesheet entries" 
ON public.timesheet_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN employees e ON p.employee_id = e.id 
    WHERE p.user_id = auth.uid() AND e.id = timesheet_entries.employee_id
  )
);

CREATE POLICY "Employees can create their own timesheet entries" 
ON public.timesheet_entries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN employees e ON p.employee_id = e.id 
    WHERE p.user_id = auth.uid() AND e.id = timesheet_entries.employee_id
  )
);

CREATE POLICY "Employees can update their own timesheet entries" 
ON public.timesheet_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN employees e ON p.employee_id = e.id 
    WHERE p.user_id = auth.uid() AND e.id = timesheet_entries.employee_id
  )
);

CREATE POLICY "HR and Admins can view all timesheet entries" 
ON public.timesheet_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager')
  )
);

CREATE POLICY "HR and Admins can update all timesheet entries" 
ON public.timesheet_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timesheet_entries_updated_at
BEFORE UPDATE ON public.timesheet_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add company_id to existing timesheet_entries if they exist (for backward compatibility)
-- This will be handled automatically by the foreign key constraint

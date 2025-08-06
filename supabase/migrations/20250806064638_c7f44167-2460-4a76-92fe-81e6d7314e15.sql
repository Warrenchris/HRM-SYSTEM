-- Create timesheet entries table
CREATE TABLE public.timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  break_duration INTEGER DEFAULT 0, -- in minutes
  total_hours NUMERIC GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_duration::NUMERIC / 60)
  ) STORED,
  entry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_id UUID
);

-- Enable RLS
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for timesheet entries
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

CREATE POLICY "Employees can update their pending timesheet entries" 
ON public.timesheet_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() AND e.id = timesheet_entries.employee_id
    AND timesheet_entries.status = 'pending'
  )
);

CREATE POLICY "HR and Admins can manage all timesheet entries" 
ON public.timesheet_entries 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
  )
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_timesheet_entries_updated_at
BEFORE UPDATE ON public.timesheet_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
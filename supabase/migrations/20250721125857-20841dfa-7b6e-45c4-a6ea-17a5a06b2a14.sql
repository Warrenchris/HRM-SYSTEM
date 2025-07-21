-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(4,2),
  break_duration DECIMAL(4,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'clocked_in' CHECK (status IN ('clocked_in', 'on_break', 'clocked_out')),
  location TEXT,
  ip_address INET,
  notes TEXT,
  approved_by UUID,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance records
CREATE POLICY "Employees can view their own attendance" 
ON public.attendance_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() AND e.id = attendance_records.employee_id
));

CREATE POLICY "Employees can create their own attendance" 
ON public.attendance_records 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() AND e.id = attendance_records.employee_id
));

CREATE POLICY "Employees can update their own attendance" 
ON public.attendance_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() AND e.id = attendance_records.employee_id
));

CREATE POLICY "HR and Admins can manage all attendance records" 
ON public.attendance_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
));

-- Create attendance settings table
CREATE TABLE public.attendance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT 'Company',
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '17:00:00',
  break_duration_minutes INTEGER DEFAULT 60,
  late_threshold_minutes INTEGER DEFAULT 15,
  overtime_threshold_hours DECIMAL(4,2) DEFAULT 8.0,
  weekend_work_allowed BOOLEAN DEFAULT false,
  location_tracking_enabled BOOLEAN DEFAULT false,
  ip_restriction_enabled BOOLEAN DEFAULT false,
  allowed_ip_addresses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance settings
CREATE POLICY "Everyone can view attendance settings" 
ON public.attendance_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage attendance settings" 
ON public.attendance_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert default settings
INSERT INTO public.attendance_settings (company_name) VALUES ('HRM Pro');

-- Create trigger for automatic timestamp updates on attendance_records
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on attendance_settings
CREATE TRIGGER update_attendance_settings_updated_at
BEFORE UPDATE ON public.attendance_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate total hours
CREATE OR REPLACE FUNCTION public.calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total hours when clocking out
  IF NEW.clock_out_time IS NOT NULL AND OLD.clock_out_time IS NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
    
    -- Subtract break duration if exists
    IF NEW.break_start_time IS NOT NULL AND NEW.break_end_time IS NOT NULL THEN
      NEW.break_duration = EXTRACT(EPOCH FROM (NEW.break_end_time - NEW.break_start_time)) / 3600;
      NEW.total_hours = NEW.total_hours - NEW.break_duration;
    END IF;
    
    -- Update status to clocked_out
    NEW.status = 'clocked_out';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating hours
CREATE TRIGGER calculate_hours_trigger
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.calculate_attendance_hours();
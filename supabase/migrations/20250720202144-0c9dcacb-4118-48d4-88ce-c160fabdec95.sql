-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  join_date DATE NOT NULL,
  salary DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employee access (assuming HR or admin roles will be implemented)
CREATE POLICY "Anyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update employees" 
ON public.employees 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete employees" 
ON public.employees 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.employees (employee_id, first_name, last_name, email, phone, department, position, join_date, salary, status, address, emergency_contact, emergency_phone) VALUES
('EMP001', 'John', 'Doe', 'john.doe@company.com', '+1-555-0101', 'Engineering', 'Senior Developer', '2023-01-15', 85000.00, 'active', '123 Main St, City, State', 'Jane Doe', '+1-555-0102'),
('EMP002', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '+1-555-0103', 'Marketing', 'Marketing Manager', '2023-02-20', 72000.00, 'active', '456 Oak Ave, City, State', 'Mike Johnson', '+1-555-0104'),
('EMP003', 'Michael', 'Brown', 'michael.brown@company.com', '+1-555-0105', 'HR', 'HR Specialist', '2023-03-10', 65000.00, 'active', '789 Pine Rd, City, State', 'Lisa Brown', '+1-555-0106'),
('EMP004', 'Emily', 'Davis', 'emily.davis@company.com', '+1-555-0107', 'Finance', 'Financial Analyst', '2023-04-05', 68000.00, 'active', '321 Elm St, City, State', 'Tom Davis', '+1-555-0108'),
('EMP005', 'David', 'Wilson', 'david.wilson@company.com', '+1-555-0109', 'Engineering', 'Junior Developer', '2023-05-12', 55000.00, 'inactive', '654 Maple Dr, City, State', 'Anna Wilson', '+1-555-0110');
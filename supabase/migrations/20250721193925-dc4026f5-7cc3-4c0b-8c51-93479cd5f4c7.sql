-- Create payroll_records table to store processed payroll data
CREATE TABLE public.payroll_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    pay_period TEXT NOT NULL,
    pay_date DATE NOT NULL,
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    allowances NUMERIC NOT NULL DEFAULT 0,
    overtime_pay NUMERIC NOT NULL DEFAULT 0,
    gross_salary NUMERIC NOT NULL DEFAULT 0,
    paye_tax NUMERIC NOT NULL DEFAULT 0,
    nssf_deduction NUMERIC NOT NULL DEFAULT 0,
    shif_deduction NUMERIC NOT NULL DEFAULT 0,
    housing_levy NUMERIC NOT NULL DEFAULT 0,
    other_deductions NUMERIC NOT NULL DEFAULT 0,
    total_deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.payroll_records 
ADD CONSTRAINT fk_payroll_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Employees can view their own payroll records" 
ON public.payroll_records 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() AND e.id = payroll_records.employee_id
));

CREATE POLICY "HR and Admins can manage all payroll records" 
ON public.payroll_records 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
));

-- Create trigger for updated_at
CREATE TRIGGER update_payroll_records_updated_at
    BEFORE UPDATE ON public.payroll_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create attendance_summary table for payroll calculations
CREATE TABLE public.attendance_summary (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    pay_period TEXT NOT NULL,
    total_hours NUMERIC NOT NULL DEFAULT 0,
    overtime_hours NUMERIC NOT NULL DEFAULT 0,
    days_worked INTEGER NOT NULL DEFAULT 0,
    days_absent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(employee_id, pay_period)
);

-- Add foreign key for attendance_summary
ALTER TABLE public.attendance_summary 
ADD CONSTRAINT fk_attendance_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Enable RLS for attendance_summary
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and Admins can manage attendance summary" 
ON public.attendance_summary 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
));

CREATE POLICY "Employees can view their attendance summary" 
ON public.attendance_summary 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() AND e.id = attendance_summary.employee_id
));
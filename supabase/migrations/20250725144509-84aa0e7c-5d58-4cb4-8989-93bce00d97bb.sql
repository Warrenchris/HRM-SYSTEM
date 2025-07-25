-- Create expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_amount NUMERIC,
  requires_receipt BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  category_id UUID NOT NULL,
  expense_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL,
  merchant TEXT,
  receipt_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  approval_comments TEXT,
  rejection_reason TEXT,
  payment_date DATE,
  payment_reference TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);

-- Create expense approvals workflow table
CREATE TABLE public.expense_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL,
  approver_id UUID NOT NULL,
  approval_level INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_categories
CREATE POLICY "Everyone can view expense categories" 
ON public.expense_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "HR and Admins can manage expense categories" 
ON public.expense_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr')
));

-- RLS Policies for expenses
CREATE POLICY "Employees can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p
  JOIN employees e ON p.employee_id = e.id
  WHERE p.user_id = auth.uid() 
  AND e.id = expenses.employee_id
));

CREATE POLICY "Employees can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p
  JOIN employees e ON p.employee_id = e.id
  WHERE p.user_id = auth.uid() 
  AND e.id = expenses.employee_id
));

CREATE POLICY "Employees can update their pending expenses" 
ON public.expenses 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p
  JOIN employees e ON p.employee_id = e.id
  WHERE p.user_id = auth.uid() 
  AND e.id = expenses.employee_id
  AND status = 'pending'
));

CREATE POLICY "Managers and HR can view all expenses" 
ON public.expenses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'manager')
));

CREATE POLICY "Managers and HR can approve/reject expenses" 
ON public.expenses 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'manager')
));

-- RLS Policies for expense_approvals
CREATE POLICY "Employees can view approvals for their expenses" 
ON public.expense_approvals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM expenses e
  JOIN profiles p ON p.employee_id = e.employee_id
  WHERE e.id = expense_approvals.expense_id
  AND p.user_id = auth.uid()
));

CREATE POLICY "Approvers can view their assigned approvals" 
ON public.expense_approvals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p
  JOIN employees e ON p.employee_id = e.id
  WHERE p.user_id = auth.uid() 
  AND e.id = expense_approvals.approver_id
));

CREATE POLICY "Managers and HR can manage approvals" 
ON public.expense_approvals 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'manager')
));

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, max_amount, requires_receipt) VALUES
('Travel', 'Business travel expenses including flights, hotels, and transportation', 5000.00, true),
('Meals', 'Business meals and entertainment', 200.00, true),
('Technology', 'Technology equipment and software', 2000.00, true),
('Office Supplies', 'Office supplies and materials', 500.00, false),
('Training', 'Professional development and training', 1500.00, true),
('Communication', 'Phone and internet expenses', 300.00, true),
('Transportation', 'Local transportation and parking', 100.00, false),
('Other', 'Other business-related expenses', 1000.00, true);

-- Create function to generate expense numbers
CREATE OR REPLACE FUNCTION public.generate_expense_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(expense_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM expenses
  WHERE expense_number ~ '^EXP-[0-9]+$';
  
  -- Format with leading zeros
  formatted_number := 'EXP-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate expense numbers
CREATE OR REPLACE FUNCTION public.set_expense_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expense_number IS NULL OR NEW.expense_number = '' THEN
    NEW.expense_number := generate_expense_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_expense_number_trigger
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_expense_number();

-- Create trigger to update timestamps
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_approvals_updated_at
  BEFORE UPDATE ON public.expense_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
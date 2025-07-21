-- Create assets table with transfer functionality
CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  asset_tag text NOT NULL UNIQUE,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'available' 
    CHECK (status IN ('available', 'assigned', 'maintenance', 'repair', 'return_to_store', 'write_off')),
  condition text NOT NULL DEFAULT 'excellent'
    CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  location text NOT NULL,
  current_employee_id uuid REFERENCES employees(id),
  purchase_date date NOT NULL,
  purchase_value numeric(10,2) NOT NULL DEFAULT 0,
  current_value numeric(10,2),
  vendor text,
  serial_number text,
  warranty_date date,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create asset transfers table to track all transfers
CREATE TABLE public.asset_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_employee_id uuid REFERENCES employees(id),
  to_employee_id uuid REFERENCES employees(id),
  transfer_status text NOT NULL 
    CHECK (transfer_status IN ('available', 'assigned', 'maintenance', 'repair', 'return_to_store', 'write_off')),
  previous_status text,
  transfer_reason text,
  transfer_notes text,
  transfer_date timestamp with time zone NOT NULL DEFAULT now(),
  transferred_by uuid NOT NULL REFERENCES employees(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for assets
CREATE POLICY "HR and Admins can manage all assets" 
ON public.assets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'hr')
));

CREATE POLICY "Employees can view assets assigned to them" 
ON public.assets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() 
  AND (e.id = current_employee_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'hr', 'manager')
  ))
));

-- RLS policies for asset transfers
CREATE POLICY "HR and Admins can manage all transfers" 
ON public.asset_transfers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'hr')
));

CREATE POLICY "Employees can view transfers they are involved in" 
ON public.asset_transfers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  JOIN employees e ON p.employee_id = e.id 
  WHERE p.user_id = auth.uid() 
  AND (e.id = from_employee_id OR e.id = to_employee_id OR e.id = transferred_by)
));

-- Add updated_at trigger for assets
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.assets (name, asset_tag, category, status, condition, location, purchase_date, purchase_value, current_value, vendor, description) VALUES
('MacBook Pro 16"', 'IT-2024-001', 'IT Equipment', 'available', 'excellent', 'Office Floor 2', '2024-01-15', 2499.00, 2000.00, 'Apple', 'High-performance laptop for development work'),
('Herman Miller Desk Chair', 'FUR-2024-025', 'Office Furniture', 'assigned', 'good', 'Office Floor 1', '2024-03-10', 850.00, 680.00, 'Herman Miller', 'Ergonomic office chair'),
('Dell Monitor 27"', 'IT-2024-045', 'IT Equipment', 'maintenance', 'fair', 'IT Storage', '2023-08-22', 450.00, 300.00, 'Dell', '4K display monitor'),
('Toyota Camry 2023', 'VEH-2023-001', 'Vehicles', 'assigned', 'good', 'Parking Lot A', '2023-06-15', 28500.00, 24000.00, 'Toyota', 'Company vehicle for business trips');
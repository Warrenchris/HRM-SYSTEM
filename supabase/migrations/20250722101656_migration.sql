-- Create organization positions table
CREATE TABLE public.organization_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  parent_position_id UUID REFERENCES public.organization_positions(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_reports INTEGER DEFAULT NULL,
  budget_authority NUMERIC DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organization_positions ENABLE ROW LEVEL SECURITY;

-- Create policies for organization positions
CREATE POLICY "Anyone can view active positions" 
ON public.organization_positions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all positions" 
ON public.organization_positions 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_organization_positions_updated_at
BEFORE UPDATE ON public.organization_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_organization_positions_parent ON public.organization_positions(parent_position_id);
CREATE INDEX idx_organization_positions_employee ON public.organization_positions(employee_id);
CREATE INDEX idx_organization_positions_level ON public.organization_positions(level);
CREATE INDEX idx_organization_positions_department ON public.organization_positions(department);

-- Insert sample organization structure

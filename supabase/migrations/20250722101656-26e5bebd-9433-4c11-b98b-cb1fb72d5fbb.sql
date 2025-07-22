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
INSERT INTO public.organization_positions (title, department, level, description, responsibilities, requirements, location) VALUES
('Chief Executive Officer', 'Executive', 1, 'Executive leadership and strategic oversight of the organization', 'Strategic planning, Board reporting, Organizational leadership, Stakeholder management', 'MBA or equivalent, 15+ years executive experience, Leadership skills', 'Head Office'),
('Chief Technology Officer', 'Technology', 2, 'Technology strategy and oversight', 'Technology strategy, Team leadership, Innovation management, Technical oversight', 'Computer Science degree, 10+ years tech leadership', 'Head Office'),
('Chief Financial Officer', 'Finance', 2, 'Financial strategy and management', 'Financial planning, Budget management, Risk management, Compliance oversight', 'CPA or Finance degree, 10+ years finance experience', 'Head Office'),
('Chief Human Resources Officer', 'Human Resources', 2, 'HR strategy and people management', 'HR strategy, Talent management, Culture development, Policy development', 'HR degree, 8+ years HR leadership experience', 'Head Office'),
('Chief Marketing Officer', 'Marketing', 2, 'Marketing strategy and brand management', 'Marketing strategy, Brand management, Customer acquisition, Campaign oversight', 'Marketing degree, 8+ years marketing leadership', 'Head Office');

-- Update parent relationships for C-level positions
UPDATE public.organization_positions 
SET parent_position_id = (SELECT id FROM public.organization_positions WHERE title = 'Chief Executive Officer')
WHERE title IN ('Chief Technology Officer', 'Chief Financial Officer', 'Chief Human Resources Officer', 'Chief Marketing Officer');
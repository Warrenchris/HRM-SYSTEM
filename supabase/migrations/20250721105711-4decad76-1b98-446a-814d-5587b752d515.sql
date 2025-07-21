-- Create appraisals table
CREATE TABLE public.appraisals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  appraiser_id UUID NOT NULL,
  appraisal_period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  due_date DATE NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  self_appraisal_completed BOOLEAN NOT NULL DEFAULT false,
  manager_appraisal_completed BOOLEAN NOT NULL DEFAULT false,
  self_appraisal_comments TEXT,
  manager_appraisal_comments TEXT,
  goals_achievement TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  development_needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;

-- Create policies for appraisals
CREATE POLICY "Employees can view their own appraisals" 
ON public.appraisals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.employee_id
  )
);

CREATE POLICY "Appraisers can view assigned appraisals" 
ON public.appraisals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.appraiser_id
  )
);

CREATE POLICY "HR and Admins can view all appraisals" 
ON public.appraisals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "HR and Admins can manage all appraisals" 
ON public.appraisals 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "Employees can update their self appraisal" 
ON public.appraisals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.employee_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.employee_id
  )
);

CREATE POLICY "Appraisers can update assigned appraisals" 
ON public.appraisals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.appraiser_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND employee_id = appraisals.appraiser_id
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appraisals_updated_at
BEFORE UPDATE ON public.appraisals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create appraisal_objectives table for tracking specific goals
CREATE TABLE public.appraisal_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  objective_title TEXT NOT NULL,
  objective_description TEXT,
  target_value TEXT,
  actual_value TEXT,
  weight_percentage INTEGER DEFAULT 100,
  employee_rating INTEGER CHECK (employee_rating >= 1 AND employee_rating <= 5),
  manager_rating INTEGER CHECK (manager_rating >= 1 AND manager_rating <= 5),
  employee_comments TEXT,
  manager_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for objectives
ALTER TABLE public.appraisal_objectives ENABLE ROW LEVEL SECURITY;

-- Create policies for appraisal objectives
CREATE POLICY "Users can view objectives for accessible appraisals" 
ON public.appraisal_objectives 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appraisals a
    JOIN public.profiles p ON (p.employee_id = a.employee_id OR p.employee_id = a.appraiser_id OR p.role IN ('admin', 'hr'))
    WHERE a.id = appraisal_objectives.appraisal_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage objectives for accessible appraisals" 
ON public.appraisal_objectives 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appraisals a
    JOIN public.profiles p ON (p.employee_id = a.employee_id OR p.employee_id = a.appraiser_id OR p.role IN ('admin', 'hr'))
    WHERE a.id = appraisal_objectives.appraisal_id 
    AND p.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on objectives
CREATE TRIGGER update_appraisal_objectives_updated_at
BEFORE UPDATE ON public.appraisal_objectives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_appraisals_employee_id ON public.appraisals(employee_id);
CREATE INDEX idx_appraisals_appraiser_id ON public.appraisals(appraiser_id);
CREATE INDEX idx_appraisals_status ON public.appraisals(status);
CREATE INDEX idx_appraisal_objectives_appraisal_id ON public.appraisal_objectives(appraisal_id);
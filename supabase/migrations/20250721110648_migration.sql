-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID NOT NULL REFERENCES public.employees(id),
  assigned_to UUID NOT NULL REFERENCES public.employees(id),
  department TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'escalated', 'cancelled')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  complexity_level TEXT NOT NULL DEFAULT 'medium' CHECK (complexity_level IN ('low', 'medium', 'high', 'expert')),
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID REFERENCES public.employees(id),
  escalation_reason TEXT,
  escalated_at TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks assigned to them" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_to
  )
);

CREATE POLICY "Users can view tasks they assigned" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_by
  )
);

CREATE POLICY "Managers and above can view all tasks" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  )
);

CREATE POLICY "Managers can assign tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('admin', 'hr', 'manager') OR e.id = tasks.assigned_by)
  )
);

CREATE POLICY "Task assignees can update their tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_to
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_to
  )
);

CREATE POLICY "Task assigners can update their assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_by
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.employees e ON p.employee_id = e.id
    WHERE p.user_id = auth.uid() 
    AND e.id = tasks.assigned_by
  )
);

CREATE POLICY "Managers can manage all tasks" 
ON public.tasks 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  )
);

-- Create task_comments table for communication
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible tasks" 
ON public.task_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.profiles p ON p.user_id = auth.uid()
    JOIN public.employees e ON p.employee_id = e.id
    WHERE t.id = task_comments.task_id 
    AND (t.assigned_to = e.id OR t.assigned_by = e.id OR p.role IN ('admin', 'hr', 'manager'))
  )
);

CREATE POLICY "Users can add comments to accessible tasks" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.profiles p ON p.user_id = auth.uid()
    JOIN public.employees e ON p.employee_id = e.id
    WHERE t.id = task_comments.task_id 
    AND (t.assigned_to = e.id OR t.assigned_by = e.id OR p.role IN ('admin', 'hr', 'manager'))
  )
  AND auth.uid() = task_comments.user_id
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
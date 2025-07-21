-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  category TEXT NOT NULL CHECK (category IN ('technical', 'hr', 'equipment', 'facility', 'policy', 'other')) DEFAULT 'other',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket comments table for communication
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
CREATE POLICY "Users can view their own tickets" 
ON public.tickets 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tickets" 
ON public.tickets 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Managers and admins can view all tickets
CREATE POLICY "Managers can view department tickets" 
ON public.tickets 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'hr', 'manager')
);

-- Managers can update assigned tickets
CREATE POLICY "Managers can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (
  public.get_current_user_role() IN ('admin', 'hr', 'manager') OR 
  auth.uid() = assigned_to
);

-- Policies for ticket comments
CREATE POLICY "Users can view comments on their tickets" 
ON public.ticket_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE id = ticket_id 
    AND (created_by = auth.uid() OR assigned_to = auth.uid())
  ) OR 
  public.get_current_user_role() IN ('admin', 'hr', 'manager')
);

CREATE POLICY "Users can add comments to accessible tickets" 
ON public.ticket_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE id = ticket_id 
    AND (created_by = auth.uid() OR assigned_to = auth.uid())
  ) OR 
  public.get_current_user_role() IN ('admin', 'hr', 'manager')
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_department ON public.tickets(department);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
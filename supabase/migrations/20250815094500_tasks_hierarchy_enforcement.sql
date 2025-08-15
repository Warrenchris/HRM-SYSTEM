-- Strengthen tasks RLS: only managers/admins can insert, and managers can only assign to subordinates per organization_positions tree.

-- Recreate insert policy to remove loophole allowing employees to assign
DROP POLICY IF EXISTS "Managers can assign tasks" ON public.tasks;

-- Utility: determine if assigned_to is a descendant of assigned_by in organization_positions
CREATE OR REPLACE FUNCTION public.is_descendant_assignee(_assigned_by uuid, _assigned_to uuid)
RETURNS boolean AS $$
WITH RECURSIVE pos_tree AS (
  SELECT id, parent_position_id, employee_id
  FROM public.organization_positions
  WHERE employee_id = _assigned_by AND is_active = true
  UNION ALL
  SELECT p.id, p.parent_position_id, p.employee_id
  FROM public.organization_positions p
  JOIN pos_tree pt ON p.parent_position_id = pt.id
  WHERE p.is_active = true
)
SELECT EXISTS (
  SELECT 1 FROM pos_tree WHERE employee_id = _assigned_to
);
$$ LANGUAGE SQL STABLE;

-- Insert policy: admin can assign to anyone; manager can assign only to descendants; HR can also assign broadly if needed
CREATE POLICY "Managers/admins can assign tasks with hierarchy"
ON public.tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (
      p.role = 'admin' OR 
      p.role = 'hr' OR
      (p.role = 'manager' AND public.is_descendant_assignee(tasks.assigned_by, tasks.assigned_to))
    )
  )
);

-- Optional: prevent updates that reassign outside hierarchy by managers
DROP POLICY IF EXISTS "Managers can manage all tasks" ON public.tasks;
CREATE POLICY "Managers/admins can manage tasks with hierarchy"
ON public.tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('admin','hr','manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (
      p.role IN ('admin','hr') OR
      (p.role = 'manager' AND public.is_descendant_assignee(tasks.assigned_by, tasks.assigned_to))
    )
  )
);



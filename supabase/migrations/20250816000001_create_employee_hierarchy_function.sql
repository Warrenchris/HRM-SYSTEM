-- Create a function to efficiently get all employee descendants in the organization hierarchy
-- This function uses a recursive CTE to traverse the organization_positions tree

CREATE OR REPLACE FUNCTION public.get_employee_descendants(manager_employee_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  department text,
  position text
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE employee_hierarchy AS (
    -- Base case: start with the manager's position
    SELECT 
      op.id,
      op.parent_position_id,
      op.employee_id,
      op.is_active,
      0 as level
    FROM public.organization_positions op
    WHERE op.employee_id = manager_employee_id 
      AND op.is_active = true
    
    UNION ALL
    
    -- Recursive case: find all child positions
    SELECT 
      child.id,
      child.parent_position_id,
      child.employee_id,
      child.is_active,
      eh.level + 1
    FROM public.organization_positions child
    INNER JOIN employee_hierarchy eh ON child.parent_position_id = eh.id
    WHERE child.is_active = true
      AND eh.level < 10  -- Prevent infinite recursion, max 10 levels
  )
  -- Get employee details for all descendant positions
  SELECT DISTINCT
    e.id,
    e.first_name,
    e.last_name,
    e.department,
    e.position
  FROM employee_hierarchy eh
  INNER JOIN public.employees e ON eh.employee_id = e.id
  WHERE e.status = 'active'
    AND eh.employee_id != manager_employee_id  -- Exclude the manager themselves
  ORDER BY e.first_name, e.last_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_employee_descendants(uuid) TO authenticated;

-- Create an index to improve performance of the hierarchy queries
CREATE INDEX IF NOT EXISTS idx_org_positions_hierarchy_lookup 
ON public.organization_positions(parent_position_id, employee_id, is_active);

-- Add a comment explaining the function
COMMENT ON FUNCTION public.get_employee_descendants(uuid) IS 
'Returns all employees below a given manager in the organization hierarchy. Uses recursive CTE for efficient tree traversal.';

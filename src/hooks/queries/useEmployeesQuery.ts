import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  join_date?: string;
  basic_salary?: number;
}

export interface EmployeeListItem {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
}

// Query keys for better cache management
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  stats: () => [...employeeKeys.all, 'stats'] as const,
} as const;

// Lightweight employee list for dropdowns and tables
export function useEmployeesList(options?: {
  department?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: employeeKeys.list(options || {}),
    queryFn: async (): Promise<EmployeeListItem[]> => {
      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, department, position');

      if (options?.department) {
        query = query.eq('department', options.department);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      } else {
        // Default to active employees
        query = query.eq('status', 'active');
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for better performance
    gcTime: 2 * 60 * 60 * 1000, // 2 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Full employee data with pagination
export function useEmployeesQuery(options?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return useQuery({
    queryKey: employeeKeys.list({ ...options, page, limit }),
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          email,
          department,
          position,
          status,
          join_date,
          basic_salary
        `, { count: 'exact' });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        employees: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    },
  });
}

// Single employee detail
export function useEmployeeQuery(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async (): Promise<Employee> => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Employee statistics
export function useEmployeeStatsQuery() {
  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: async () => {
      // Get all counts in parallel
      const [totalResult, activeResult, exitedResult] = await Promise.all([
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .is('exit_date', null),
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .or('status.eq.inactive,exit_date.not.is.null')
      ]);

      if (totalResult.error) throw totalResult.error;
      if (activeResult.error) throw activeResult.error;
      if (exitedResult.error) throw exitedResult.error;

      return {
        totalEmployees: totalResult.count || 0,
        activeEmployees: activeResult.count || 0,
        exitedEmployees: exitedResult.count || 0,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for stats
    gcTime: 60 * 60 * 1000, // 1 hour retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Utility hook to invalidate employee queries
export function useInvalidateEmployees() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: employeeKeys.stats() }),
  };
}

// Hook to fetch employees below the current user in the hierarchy
export function useEmployeesByHierarchy() {
  return useQuery({
    queryKey: [...employeeKeys.all, 'hierarchy'],
    queryFn: async (): Promise<EmployeeListItem[]> => {
      try {
        // Get current user's employee ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, employee_id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return [];

        const userRole = profile.role;
        const currentEmployeeId = profile.employee_id;

        // Admin can see all employees
        if (userRole === 'admin') {
          const { data, error } = await supabase
            .from('employees')
            .select('id, first_name, last_name, department, position')
            .eq('status', 'active')
            .order('first_name');
          
          if (error) throw error;
          return data || [];
        }

        // HR can see all employees
        if (userRole === 'hr') {
          const { data, error } = await supabase
            .from('employees')
            .select('id, first_name, last_name, department, position')
            .eq('status', 'active')
            .order('first_name');
          
          if (error) throw error;
          return data || [];
        }

        // Managers can only see employees below them in the hierarchy
        if (userRole === 'manager' && currentEmployeeId) {
          // Use a recursive CTE to find all descendants in the organization hierarchy
          const { data, error } = await supabase
            .rpc('get_employee_descendants', { 
              manager_employee_id: currentEmployeeId 
            });

          if (error) {
            // Fallback to manual hierarchy calculation if RPC doesn't exist
            return await getEmployeeDescendantsManually(currentEmployeeId);
          }

          return data || [];
        }

        // Regular employees can't see anyone
        return [];
      } catch (error) {
        console.error('Error fetching employees by hierarchy:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for hierarchy data
    gcTime: 30 * 60 * 1000, // 30 minutes retention
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Fallback function to manually calculate employee descendants
async function getEmployeeDescendantsManually(managerEmployeeId: string): Promise<EmployeeListItem[]> {
  try {
    // Get all organization positions
    const { data: positions, error: positionsError } = await supabase
      .from('organization_positions')
      .select('id, parent_position_id, employee_id, is_active')
      .eq('is_active', true);

    if (positionsError) throw positionsError;

    // Find the manager's position
    const managerPosition = positions?.find(p => p.employee_id === managerEmployeeId);
    if (!managerPosition) return [];

    // Build a map of parent to children positions
    const childrenMap = new Map<string, any[]>();
    for (const position of positions || []) {
      if (position.parent_position_id) {
        const children = childrenMap.get(position.parent_position_id) || [];
        children.push(position);
        childrenMap.set(position.parent_position_id, children);
      }
    }

    // Recursively find all descendant employee IDs
    const descendantEmployeeIds = new Set<string>();
    const findDescendants = (positionId: string) => {
      const children = childrenMap.get(positionId) || [];
      for (const child of children) {
        if (child.employee_id) {
          descendantEmployeeIds.add(child.employee_id);
        }
        findDescendants(child.id);
      }
    };

    findDescendants(managerPosition.id);

    // Fetch the actual employee data for descendants
    if (descendantEmployeeIds.size === 0) return [];

    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, department, position')
      .eq('status', 'active')
      .in('id', Array.from(descendantEmployeeIds))
      .order('first_name');

    if (employeesError) throw employeesError;
    return employees || [];
  } catch (error) {
    console.error('Error in manual hierarchy calculation:', error);
    return [];
  }
}
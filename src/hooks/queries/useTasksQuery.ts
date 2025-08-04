import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_by: string;
  assigned_to: string;
  department: string;
  priority: string;
  status: string;
  progress_percentage: number;
  complexity_level: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date: string;
  started_at?: string;
  completed_at?: string;
  escalated_to?: string;
  escalation_reason?: string;
  escalated_at?: string;
  tags: any;
  attachments: any;
  created_at: string;
  updated_at: string;
  employee_assigned?: {
    first_name: string;
    last_name: string;
  };
  employee_assigner?: {
    first_name: string;
    last_name: string;
  };
}

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
  myTasks: (employeeId: string) => [...taskKeys.all, 'myTasks', employeeId] as const,
} as const;

// Tasks query with optimized joins
export function useTasksQuery(options?: {
  assignedTo?: string;
  assignedBy?: string;
  status?: string;
  priority?: string;
  department?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 25;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return useQuery({
    queryKey: taskKeys.list(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          employee_assigned:employees!tasks_assigned_to_fkey(first_name, last_name),
          employee_assigner:employees!tasks_assigned_by_fkey(first_name, last_name)
        `, { count: 'exact' });

      if (options?.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }

      if (options?.assignedBy) {
        query = query.eq('assigned_by', options.assignedBy);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options?.department) {
        query = query.eq('department', options.department);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        tasks: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    },
  });
}

// My tasks for current user
export function useMyTasksQuery(employeeId: string) {
  return useQuery({
    queryKey: taskKeys.myTasks(employeeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          employee_assigned:employees!tasks_assigned_to_fkey(first_name, last_name),
          employee_assigner:employees!tasks_assigned_by_fkey(first_name, last_name)
        `)
        .eq('assigned_to', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000, // 2 minutes for my tasks
  });
}

// Task statistics
export function useTaskStatsQuery(filters?: {
  assignedTo?: string;
  department?: string;
}) {
  return useQuery({
    queryKey: [...taskKeys.stats(), filters],
    queryFn: async () => {
      // Build filters for queries
      const buildQuery = (baseQuery: any) => {
        let query = baseQuery;
        if (filters?.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters?.department) {
          query = query.eq('department', filters.department);
        }
        return query;
      };

      // Get counts for different statuses in parallel
      const [
        totalResult,
        pendingResult,
        inProgressResult,
        completedResult,
        overDueResult
      ] = await Promise.all([
        buildQuery(supabase.from('tasks')).select('*', { count: 'exact', head: true }),
        buildQuery(supabase.from('tasks')).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        buildQuery(supabase.from('tasks')).select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        buildQuery(supabase.from('tasks')).select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        buildQuery(supabase.from('tasks')).select('*', { count: 'exact', head: true })
          .neq('status', 'completed')
          .lt('due_date', new Date().toISOString())
      ]);

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        inProgress: inProgressResult.count || 0,
        completed: completedResult.count || 0,
        overdue: overDueResult.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  });
}

// Update task mutation with optimistic updates
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          employee_assigned:employees!tasks_assigned_to_fkey(first_name, last_name),
          employee_assigner:employees!tasks_assigned_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous values
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: taskKeys.all },
        (old: any) => {
          if (!old?.tasks) return old;
          
          return {
            ...old,
            tasks: old.tasks.map((task: Task) =>
              task.id === id ? { ...task, ...updates } : task
            ),
          };
        }
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Create task mutation
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'employee_assigned' | 'employee_assigner'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select(`
          *,
          employee_assigned:employees!assigned_to(first_name, last_name),
          employee_assigner:employees!assigned_by(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      
      // Create notification
      const assignedEmployee = data.employee_assigned as any;
      const assignerEmployee = data.employee_assigner as any;
      const assignedName = `${assignedEmployee?.first_name || ''} ${assignedEmployee?.last_name || ''}`.trim();
      const assignerName = `${assignerEmployee?.first_name || ''} ${assignerEmployee?.last_name || ''}`.trim();
      
      // Dispatch custom event for notification
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: {
          title: 'New Task Assignment',
          message: `${assignerName} assigned a task "${data.title}" to ${assignedName}`,
          type: 'task_assignment',
          employeeName: assignedName,
          requestId: data.id,
        }
      }));
    },
  });
}

// Utility hook to invalidate task queries
export function useInvalidateTasks() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
    invalidateMyTasks: (employeeId: string) => queryClient.invalidateQueries({ queryKey: taskKeys.myTasks(employeeId) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: taskKeys.stats() }),
  };
}
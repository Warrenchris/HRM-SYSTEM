import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  applied_date: string;
  emergency_contact?: string;
  handover_notes?: string;
  manager_approval_status?: string;
  hr_approval_status?: string;
  ceo_approval_status?: string;
  manager_comments?: string;
  hr_comments?: string;
  ceo_comments?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  max_days_per_year: number;
  carry_over_allowed: boolean;
  max_carry_over_days?: number;
  requires_medical_certificate?: boolean;
  notice_period_days?: number;
  color?: string;
  is_active: boolean;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  carried_over_days: number;
  leave_types?: {
    name: string;
    color?: string;
    max_days_per_year: number;
    carry_over_allowed: boolean;
  };
}

// Query keys
export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  requests: () => [...leaveKeys.all, 'requests'] as const,
  requestList: (filters: Record<string, any>) => [...leaveKeys.requests(), filters] as const,
  balances: () => [...leaveKeys.all, 'balances'] as const,
  balanceList: (employeeId: string, year?: number) => [...leaveKeys.balances(), employeeId, year] as const,
  approvals: () => [...leaveKeys.all, 'approvals'] as const,
  approvalList: (role: string) => [...leaveKeys.approvals(), role] as const,
} as const;

// Leave types query (cached for long time as they rarely change)
export function useLeaveTypesQuery() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: async (): Promise<LeaveType[]> => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Leave requests with joins and filters
export function useLeaveRequestsQuery(options?: {
  employeeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return useQuery({
    queryKey: leaveKeys.requestList(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('leave_requests')
        .select('*', { count: 'exact' });

      if (options?.employeeId) {
        query = query.eq('employee_id', options.employeeId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        requests: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    },
  });
}

// Leave balances with join to leave types
export function useLeaveBalancesQuery(employeeId?: string, year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: leaveKeys.balanceList(employeeId || '', currentYear),
    queryFn: async () => {
      let query = supabase
        .from('leave_balances')
        .select('*')
        .eq('year', currentYear);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
}

// Pending approvals for managers/HR
export function usePendingApprovalsQuery(userRole: 'manager' | 'hr' | 'ceo' | 'admin') {
  return useQuery({
    queryKey: leaveKeys.approvalList(userRole),
    queryFn: async () => {
      let query = supabase
        .from('leave_requests')
        .select('*');

      // Filter based on approval workflow and user role
      if (userRole === 'manager') {
        query = query.eq('manager_approval_status', 'pending');
      } else if (userRole === 'hr') {
        query = query.eq('hr_approval_status', 'pending');
      } else if (userRole === 'ceo') {
        query = query.eq('ceo_approval_status', 'pending');
      }
      // Admin sees all pending requests

      query = query
        .eq('status', 'pending')
        .order('applied_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: ['manager', 'hr', 'ceo', 'admin'].includes(userRole),
  });
}

// Mutations with optimistic updates
export function useSubmitLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      employee_id: string;
      leave_type_id: string;
      start_date: string;
      end_date: string;
      total_days: number;
      reason: string;
      emergency_contact?: string;
      handover_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balances() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() });
    },
  });
}

export function useUpdateLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<LeaveRequest>;
    }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balances() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() });
    },
  });
}

// Utility hook to invalidate leave queries
export function useInvalidateLeave() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
    invalidateRequests: () => queryClient.invalidateQueries({ queryKey: leaveKeys.requests() }),
    invalidateBalances: (employeeId?: string) => {
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveKeys.balanceList(employeeId) });
      } else {
        queryClient.invalidateQueries({ queryKey: leaveKeys.balances() });
      }
    },
    invalidateApprovals: () => queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() }),
  };
}
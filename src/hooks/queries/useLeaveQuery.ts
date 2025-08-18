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
  // Joined data from employees table
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    position: string;
  };
  // Joined data from leave_types table  
  leave_types?: {
    name: string;
    color?: string;
  };
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

// Default leave types required by product
const DEFAULT_LEAVE_TYPES: Array<
  Pick<LeaveType, 'name' | 'description' | 'max_days_per_year' | 'carry_over_allowed' | 'max_carry_over_days' | 'requires_medical_certificate' | 'notice_period_days' | 'color' | 'is_active'>
> = [
  {
    name: 'Academic Leave',
    description: 'Leave for academic pursuits or studies',
    max_days_per_year: 30,
    carry_over_allowed: false,
    max_carry_over_days: 0,
    requires_medical_certificate: false,
    notice_period_days: 14,
    color: '#0EA5E9',
    is_active: true,
  },
  {
    name: 'Annual Leave',
    description: 'Paid time off for vacation',
    max_days_per_year: 21,
    carry_over_allowed: true,
    max_carry_over_days: 10,
    requires_medical_certificate: false,
    notice_period_days: 7,
    color: '#10B981',
    is_active: true,
  },
  {
    name: 'Compassionate Leave',
    description: 'Leave for bereavement or urgent family matters',
    max_days_per_year: 7,
    carry_over_allowed: false,
    max_carry_over_days: 0,
    requires_medical_certificate: false,
    notice_period_days: 0,
    color: '#8B5CF6',
    is_active: true,
  },
  {
    name: 'Maternal Leave',
    description: 'Leave related to childbirth',
    max_days_per_year: 90,
    carry_over_allowed: false,
    max_carry_over_days: 0,
    requires_medical_certificate: false,
    notice_period_days: 30,
    color: '#F59E0B',
    is_active: true,
  },
  {
    name: 'Sick Leave',
    description: 'Time off for illness',
    max_days_per_year: 10,
    carry_over_allowed: false,
    max_carry_over_days: 0,
    requires_medical_certificate: true,
    notice_period_days: 0,
    color: '#EF4444',
    is_active: true,
  },
];

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
      const baseQuery = () =>
        supabase
          .from('leave_types')
          .select('*')
          .eq('is_active', true)
          .order('name');

      const { data, error } = await baseQuery();
      if (error) throw error;

      const existing = data || [];

      // Ensure required defaults exist without requiring a DB reset
      const existingNames = new Set(existing.map((t) => t.name.toLowerCase()));
      const missingDefaults = DEFAULT_LEAVE_TYPES.filter(
        (d) => !existingNames.has(d.name.toLowerCase())
      );

      if (missingDefaults.length > 0) {
        const { error: insertError } = await supabase
          .from('leave_types')
          .insert(missingDefaults);

        if (insertError) {
          // If insertion fails, return existing to avoid blocking the UI
          console.warn('Failed to insert default leave types:', insertError);
          return existing;
        }

        const { data: refreshed, error: refetchError } = await baseQuery();
        if (!refetchError) {
          return refreshed || [];
        }
      }

      return existing;
    },
    // Shorter cache to ensure the dropdown reflects new types without requiring a full reset
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
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

      const { data: requests, error, count } = await query;

      if (error) throw error;

      // Fetch employee details separately to avoid foreign key issues
      const requestsWithEmployees = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: employee } = await supabase
            .from('employees')
            .select('first_name, last_name, employee_id, department, position')
            .eq('id', request.employee_id)
            .maybeSingle();

          const { data: leaveType } = await supabase
            .from('leave_types')
            .select('name, color')
            .eq('id', request.leave_type_id)
            .maybeSingle();

          return {
            ...request,
            employees: employee,
            leave_types: leaveType
          };
        })
      );

      return {
        requests: requestsWithEmployees,
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

      // Filter based on approval stage and workflow
      if (userRole === 'manager') {
        // Only requests awaiting manager action
        query = query.eq('manager_approval_status', 'pending');
      } else if (userRole === 'hr') {
        // Awaiting HR, i.e., manager approved and HR pending
        query = query.eq('hr_approval_status', 'pending').eq('manager_approval_status', 'approved');
      } else if (userRole === 'ceo') {
        // For CEO: show requests awaiting CEO approval
        query = query.eq('ceo_approval_status', 'pending');
      }
      // Admin sees all pending requests

      query = query
        .eq('status', 'pending')
        .order('applied_date', { ascending: true });

      const { data: requests, error } = await query;

      if (error) throw error;

      // Fetch related info in bulk (employees, leave types, balances) to render full details
      const employeeIds = Array.from(new Set(requests.map(r => r.employee_id)));
      const leaveTypeIds = Array.from(new Set(requests.map(r => r.leave_type_id)));

      const currentYear = new Date().getFullYear();
      const [employeesRes, leaveTypesRes, balancesRes] = await Promise.all([
        supabase
          .from('employees')
          .select('id, first_name, last_name, employee_id, department, position'),
        supabase
          .from('leave_types')
          .select('id, name, color, max_days_per_year'),
        supabase
          .from('leave_balances')
          .select('employee_id, leave_type_id, allocated_days, used_days, pending_days, carried_over_days')
          .eq('year', currentYear),
      ]);

      const employees = employeesRes.data || [];
      const leaveTypes = leaveTypesRes.data || [];
      const balances = balancesRes.data || [];

      // Exclude the current user's own requests from their approval queue
      // Exception: CEO/Admin can see and approve their own requests
      const { data: { user } } = await supabase.auth.getUser();
      let currentEmployeeId: string | null = null;
      let currentUserRole: string | null = null;
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id, role')
          .eq('user_id', user.id)
          .single();
        currentEmployeeId = (profile?.employee_id as string) || null;
        currentUserRole = (profile?.role as string) || null;
      }

      return (requests || [])
        .filter((req) => {
          // If no employee ID, include the request
          if (!currentEmployeeId) return true;
          
          // If it's not their own request, include it
          if (req.employee_id !== currentEmployeeId) return true;
          
          // If it's their own request, only include if they're CEO/Admin
          return currentUserRole === 'ceo' || currentUserRole === 'admin';
        })
        .map((req) => {
        const employee = employees.find(e => e.id === req.employee_id);
        const leaveType = leaveTypes.find(t => t.id === req.leave_type_id);
        const balance = balances.find(b => b.employee_id === req.employee_id && b.leave_type_id === req.leave_type_id);
        return {
          ...req,
          employees: employee,
          leave_types: leaveType,
          // Provide a computed remaining balance for UI convenience
          remaining_balance_days: balance
            ? Math.max(0, (balance.allocated_days + balance.carried_over_days) - (balance.used_days + balance.pending_days))
            : undefined,
        } as any;
      });
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
      console.log('Submitting leave request to database:', request);
      
      // First, check if the employee is in HR department to set appropriate workflow
      const { data: employeeDept, error: empError } = await supabase
        .from('employees')
        .select('department')
        .eq('id', request.employee_id)
        .single();
      
      if (empError) throw empError;
      
      // Set approval workflow based on department
      let approvalWorkflow = 'manager_hr';
      let initialUpdates: any = {};
      
      if (employeeDept?.department === 'HR' || employeeDept?.department === 'Human Resources') {
        // HR requests go directly to CEO approval
        approvalWorkflow = 'manager_hr_ceo';
        initialUpdates = {
          ...request,
          approval_workflow: approvalWorkflow,
          ceo_approval_status: 'pending',
          manager_approval_status: 'approved', // Auto-approve manager for HR
          hr_approval_status: 'approved', // Auto-approve HR for HR
        };
      } else {
        // Regular employees go through manager -> HR workflow
        initialUpdates = {
          ...request,
          approval_workflow: approvalWorkflow,
          manager_approval_status: 'pending',
        };
      }
      
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(initialUpdates)
        .select('*')
        .single();

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      // Fetch minimal related info for notification without ambiguous joins
      const [{ data: employee }, { data: leaveType }] = await Promise.all([
        supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('id', data.employee_id)
          .maybeSingle(),
        supabase
          .from('leave_types')
          .select('name')
          .eq('id', data.leave_type_id)
          .maybeSingle(),
      ]);

      return { ...data, employees: employee, leave_types: leaveType } as any;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balances() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() });
      
      // Create notification
      const employee = data.employees as any;
      const leaveType = data.leave_types as any;
      const employeeName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
      
      // Dispatch custom event for notification
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: {
          title: 'New Leave Request',
          message: `${employeeName} submitted a ${leaveType?.name || 'leave'} request`,
          type: 'leave_request',
          employeeName,
          requestId: data.id,
        }
      }));
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
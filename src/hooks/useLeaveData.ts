import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  max_days_per_year: number;
  carry_over_allowed: boolean;
  max_carry_over_days: number | null;
  requires_medical_certificate: boolean | null;
  notice_period_days: number | null;
  is_active: boolean;
  color: string | null;
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
  leave_type?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  emergency_contact: string | null;
  handover_notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approval_workflow: 'manager_hr' | 'hr_only' | 'manager_hr_ceo';
  manager_approval_status: 'pending' | 'approved' | 'rejected';
  manager_approved_by: string | null;
  manager_approved_date: string | null;
  manager_comments: string | null;
  hr_approval_status: 'pending' | 'approved' | 'rejected';
  hr_approved_by: string | null;
  hr_approved_date: string | null;
  hr_comments: string | null;
  ceo_approval_status: 'pending' | 'approved' | 'rejected';
  ceo_approved_by: string | null;
  ceo_approved_date: string | null;
  ceo_comments: string | null;
  applied_date: string;
  created_at: string;
  updated_at: string;
  leave_type?: LeaveType;
  employee?: {
    first_name: string;
    last_name: string;
    department: string;
    position: string;
  };
}

export function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('leave_types')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setLeaveTypes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave types');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  return { leaveTypes, loading, error };
}

export function useLeaveBalances(employeeId?: string) {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchBalances = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const { data, error } = await supabase
          .from('leave_balances')
          .select(`
            *,
            leave_type:leave_types(*)
          `)
          .eq('employee_id', employeeId)
          .eq('year', currentYear);

        if (error) throw error;
        setBalances(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave balances');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [employeeId]);

  return { balances, loading, error, refetch: () => setLoading(true) };
}

export function useLeaveRequests(employeeId?: string) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [employeeId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          leave_type:leave_types(*),
          employee:employees(first_name, last_name, department, position)
        `)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests((data || []) as unknown as LeaveRequest[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (requestData: {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    emergency_contact?: string;
    handover_notes?: string;
    employee_id: string;
  }) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval.",
      });

      fetchRequests();
      return true;
    } catch (err) {
      toast({
        title: "Error Submitting Request",
        description: err instanceof Error ? err.message : 'Failed to submit leave request',
        variant: "destructive",
      });
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'approved' | 'rejected',
    approvalType: 'manager' | 'hr' | 'ceo',
    comments?: string
  ) => {
    try {
      const updates: any = {};
      
      if (approvalType === 'manager') {
        updates.manager_approval_status = status;
        updates.manager_comments = comments;
        updates.manager_approved_date = new Date().toISOString();
        if (status === 'approved') {
          updates.hr_approval_status = 'pending';
        } else {
          updates.status = 'rejected';
        }
      } else if (approvalType === 'hr') {
        updates.hr_approval_status = status;
        updates.hr_comments = comments;
        updates.hr_approved_date = new Date().toISOString();
        if (status === 'approved') {
          // Check if this requires CEO approval
          const request = requests.find(r => r.id === requestId);
          if (request?.approval_workflow === 'manager_hr_ceo') {
            updates.ceo_approval_status = 'pending';
          } else {
            updates.status = 'approved';
          }
        } else {
          updates.status = 'rejected';
        }
      } else if (approvalType === 'ceo') {
        updates.ceo_approval_status = status;
        updates.ceo_comments = comments;
        updates.ceo_approved_date = new Date().toISOString();
        updates.status = status;
      }

      const { error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The leave request has been ${status} successfully.`,
      });

      fetchRequests();
      return true;
    } catch (err) {
      toast({
        title: "Error Updating Request",
        description: err instanceof Error ? err.message : 'Failed to update leave request',
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Leave Request Cancelled",
        description: "Your leave request has been cancelled successfully.",
      });

      fetchRequests();
      return true;
    } catch (err) {
      toast({
        title: "Error Cancelling Request",
        description: err instanceof Error ? err.message : 'Failed to cancel leave request',
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    requests,
    loading,
    error,
    submitRequest,
    updateRequestStatus,
    cancelRequest,
    refetch: fetchRequests
  };
}

export function usePendingApprovals(userRole: 'manager' | 'hr' | 'ceo') {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, [userRole]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      let statusFilter: string;
      
      if (userRole === 'manager') {
        statusFilter = 'pending_manager';
      } else if (userRole === 'hr') {
        statusFilter = 'pending_hr';
      } else {
        statusFilter = 'pending_ceo';
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          leave_type:leave_types(*),
          employee:employees(first_name, last_name, department, position)
        `)
        .or(`manager_approval_status.eq.${statusFilter.replace('pending_', '')},hr_approval_status.eq.${statusFilter.replace('pending_', '')},ceo_approval_status.eq.${statusFilter.replace('pending_', '')}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as LeaveRequest[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  return { requests, loading, error, refetch: fetchPendingApprovals };
}

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}
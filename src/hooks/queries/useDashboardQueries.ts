import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

// Query keys for dashboard data
export const dashboardKeys = {
  upcomingBirthdays: ['dashboard', 'birthdays'] as const,
  todayAttendance: ['dashboard', 'attendance', 'today'] as const,
  attendanceStats: ['dashboard', 'attendance', 'stats'] as const,
  contractsExpiring: ['dashboard', 'contracts', 'expiring'] as const,
  pendingActions: ['dashboard', 'pending', 'actions'] as const,
  recentActivities: ['dashboard', 'recent', 'activities'] as const,
} as const;

interface UpcomingBirthday {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  department: string;
  daysUntil: number;
}

interface TodayAttendance {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  clock_in_time: string;
  clock_out_time?: string;
  status: string;
  total_hours?: number;
}

interface AttendanceStats {
  clockedIn: number;
  clockedOut: number;
  late: number;
  onBreak: number;
}

// Optimized upcoming birthdays query
export function useUpcomingBirthdaysQuery() {
  return useQuery({
    queryKey: dashboardKeys.upcomingBirthdays,
    queryFn: async (): Promise<UpcomingBirthday[]> => {
      const today = new Date();
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, date_of_birth, department')
        .not('date_of_birth', 'is', null)
        .eq('status', 'active');

      if (error) throw error;

      const birthdaysWithDays = data
        .map(employee => {
          if (!employee.date_of_birth) return null;
          
          const birthDate = new Date(employee.date_of_birth);
          const currentYear = today.getFullYear();
          const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
          
          if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(currentYear + 1);
          }
          
          const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...employee,
            daysUntil
          };
        })
        .filter(employee => employee && employee.daysUntil <= 14)
        .sort((a, b) => a!.daysUntil - b!.daysUntil)
        .slice(0, 5) as UpcomingBirthday[];

      return birthdaysWithDays;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - birthdays don't change often
  });
}

// Optimized today's attendance query - separate queries but cached
export function useTodayAttendanceQuery() {
  const { currentCompany } = useCompany();
  return useQuery({
    queryKey: dashboardKeys.todayAttendance,
    queryFn: async (): Promise<{ attendance: TodayAttendance[]; stats: AttendanceStats }> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get attendance records for today (limit to reduce load)
      let attendanceQuery = supabase
        .from('attendance_records')
        .select('id, employee_id, clock_in_time, clock_out_time, status, total_hours')
        .gte('clock_in_time', `${today}T00:00:00`)
        .lt('clock_in_time', `${today}T23:59:59`)
        .order('clock_in_time', { ascending: false })
        .limit(15);

      if (currentCompany?.id) {
        attendanceQuery = attendanceQuery.eq('company_id', currentCompany.id);
      }

      const { data: attendanceData, error: attendanceError } = await attendanceQuery;

      if (attendanceError) throw attendanceError;

      if (!attendanceData || attendanceData.length === 0) {
        return {
          attendance: [],
          stats: { clockedIn: 0, clockedOut: 0, late: 0, onBreak: 0 }
        };
      }

      // Get unique employee IDs and their details
      const employeeIds = [...new Set(attendanceData.map(record => record.employee_id))];
      let employeesQuery = supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .in('id', employeeIds)
        .eq('status', 'active');

      if (currentCompany?.id) {
        employeesQuery = employeesQuery.eq('company_id', currentCompany.id);
      }

      const { data: employeesData, error: employeesError } = await employeesQuery;

      if (employeesError) throw employeesError;

      // Create employee map for quick lookup
      const employeeMap = (employeesData || []).reduce((acc, emp) => {
        acc[emp.id] = emp;
        return acc;
      }, {} as Record<string, any>);

      const formattedAttendanceData = attendanceData.map(record => {
        const employee = employeeMap[record.employee_id];
        return {
          id: record.id,
          employee_id: record.employee_id,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
          department: employee?.department || 'Unknown',
          clock_in_time: record.clock_in_time,
          clock_out_time: record.clock_out_time,
          status: record.status,
          total_hours: record.total_hours
        };
      });

      // Calculate stats efficiently
      const stats = {
        clockedIn: formattedAttendanceData.filter(a => a.status === 'clocked_in').length,
        clockedOut: formattedAttendanceData.filter(a => a.status === 'clocked_out').length,
        late: formattedAttendanceData.filter(a => {
          const clockInTime = new Date(a.clock_in_time);
          const workStartTime = new Date();
          workStartTime.setHours(9, 0, 0, 0);
          return clockInTime > workStartTime;
        }).length,
        onBreak: formattedAttendanceData.filter(a => a.status === 'on_break').length
      };

      return {
        attendance: formattedAttendanceData.slice(0, 8),
        stats
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: false, // Disable auto-refresh to reduce load
    enabled: !!currentCompany?.id,
  });
}

// Contracts expiring within next N days (default 60)
export interface ContractExpiryItem {
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  contract_end_date: string;
  daysRemaining: number;
}

export function useContractsExpiringQuery(daysAhead: number = 60) {
  return useQuery({
    queryKey: [...dashboardKeys.contractsExpiring, daysAhead],
    queryFn: async (): Promise<ContractExpiryItem[]> => {
      const today = new Date();
      const end = new Date(today);
      end.setDate(end.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position, contract_end_date')
        .not('contract_end_date', 'is', null)
        .gte('contract_end_date', today.toISOString().split('T')[0])
        .lte('contract_end_date', end.toISOString().split('T')[0])
        .eq('status', 'active')
        .order('contract_end_date', { ascending: true })
        .limit(12);

      if (error) throw error;

      return (data || []).map((e) => {
        const expiry = new Date(e.contract_end_date as unknown as string);
        const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          employee_id: e.id,
          first_name: (e as any).first_name,
          last_name: (e as any).last_name,
          department: (e as any).department,
          position: (e as any).position,
          contract_end_date: (e as any).contract_end_date,
          daysRemaining,
        } as ContractExpiryItem;
      });
    },
    staleTime: 15 * 60 * 1000,
  });
}

// Pending actions aggregated from leave requests, expenses, and tasks
export interface PendingActionItem {
  type: 'leave' | 'expense' | 'task';
  status: string;
  employee_id?: string;
  employee?: string;
  department?: string;
  amount?: number;
  days?: number;
  date?: string;
}

export function usePendingActionsQuery(limitPerType: number = 5) {
  return useQuery({
    queryKey: [...dashboardKeys.pendingActions, limitPerType],
    queryFn: async (): Promise<PendingActionItem[]> => {
      // Fetch leave requests (pending)
      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .select('id, employee_id, total_days, applied_date, status')
        .eq('status', 'pending')
        .order('applied_date', { ascending: false })
        .limit(limitPerType);

      if (leaveError) throw leaveError;

      // Fetch expenses (pending)
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('id, employee_id, amount, submitted_at, status')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(limitPerType);

      if (expenseError) throw expenseError;

      // Fetch tasks (pending/in-progress)
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, assigned_to, status, due_date')
        .in('status', ['pending', 'in-progress'])
        .order('due_date', { ascending: true })
        .limit(limitPerType);

      if (taskError) throw taskError;

      const normalized: PendingActionItem[] = [];

      (leaveData || []).forEach((lr: any) =>
        normalized.push({
          type: 'leave',
          status: lr.status,
          employee_id: lr.employee_id,
          days: lr.total_days,
          date: lr.applied_date,
        })
      );

      (expenseData || []).forEach((ex: any) =>
        normalized.push({
          type: 'expense',
          status: ex.status,
          employee_id: ex.employee_id,
          amount: Number(ex.amount),
          date: ex.submitted_at,
        })
      );

      (taskData || []).forEach((t: any) =>
        normalized.push({
          type: 'task',
          status: t.status,
          employee_id: t.assigned_to,
          date: t.due_date,
        })
      );

      // Attach employee names and departments
      const employeeIds = Array.from(
        new Set(normalized.map((n) => n.employee_id).filter(Boolean))
      ) as string[];

      if (employeeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('id, first_name, last_name, department')
          .in('id', employeeIds);

        if (employeesError) throw employeesError;

        const empMap = (employeesData || []).reduce((acc: Record<string, any>, e: any) => {
          acc[e.id] = e;
          return acc;
        }, {} as Record<string, any>);

        normalized.forEach((n) => {
          if (n.employee_id && empMap[n.employee_id]) {
            const e = empMap[n.employee_id];
            n.employee = `${e.first_name} ${e.last_name}`;
            n.department = e.department;
          }
        });
      }

      // Sort by date desc and limit overall
      return normalized
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, limitPerType * 2);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Recent activities from user activity logs
export interface RecentActivityItem {
  action: string;
  category: string;
  user_id?: string;
  employee?: string;
  department?: string;
  created_at: string;
}

export function useRecentActivitiesQuery(limit: number = 8) {
  return useQuery({
    queryKey: [...dashboardKeys.recentActivities, limit],
    queryFn: async (): Promise<RecentActivityItem[]> => {
      const { data: logs, error } = await supabase
        .from('user_activity_logs')
        .select('user_id, action, category, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const userIds = Array.from(new Set((logs || []).map((l: any) => l.user_id).filter(Boolean)));
      if (userIds.length === 0) return logs || [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, employee_id')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const employeeIds = Array.from(new Set((profiles || []).map((p: any) => p.employee_id).filter(Boolean)));
      let employeesMap: Record<string, any> = {};
      if (employeeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('id, first_name, last_name, department')
          .in('id', employeeIds);

        if (employeesError) throw employeesError;

        employeesMap = (employeesData || []).reduce((acc: Record<string, any>, e: any) => {
          acc[e.id] = e;
          return acc;
        }, {});
      }

      const profileMap = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
        acc[p.user_id] = p.employee_id;
        return acc;
      }, {});

      return (logs || []).map((l: any) => {
        const empId = profileMap[l.user_id];
        const emp = empId ? employeesMap[empId] : null;
        return {
          action: l.action,
          category: l.category,
          user_id: l.user_id,
          employee: emp ? `${emp.first_name} ${emp.last_name}` : undefined,
          department: emp?.department,
          created_at: l.created_at,
        } as RecentActivityItem;
      });
    },
    staleTime: 60 * 1000,
  });
}

// Cache invalidation utilities
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    invalidateBirthdays: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.upcomingBirthdays }),
    invalidateAttendance: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.todayAttendance }),
  };
}
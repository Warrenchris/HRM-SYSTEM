import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  break_duration?: number;
  break_start_time?: string;
  break_end_time?: string;
  status: string;
  location?: string;
  notes?: string;
  clock_in_latitude?: number;
  clock_in_longitude?: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  clock_in_gps_timestamp?: string;
  clock_out_gps_timestamp?: string;
  ip_address?: any;
  clock_out_ip_address?: any;
  is_approved?: boolean;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  records: () => [...attendanceKeys.all, 'records'] as const,
  recordList: (filters: Record<string, any>) => [...attendanceKeys.records(), filters] as const,
  todayRecord: (employeeId: string) => [...attendanceKeys.all, 'today', employeeId] as const,
  stats: () => [...attendanceKeys.all, 'stats'] as const,
  summary: () => [...attendanceKeys.all, 'summary'] as const,
} as const;

// Attendance records query with optimized filtering
export function useAttendanceRecordsQuery(options?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { currentCompany } = useCompany();
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return useQuery({
    queryKey: attendanceKeys.recordList(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*', { count: 'exact' });

      if (currentCompany?.id) {
        query = query.eq('company_id', currentCompany.id);
      }

      if (options?.employeeId) {
        query = query.eq('employee_id', options.employeeId);
      }

      if (options?.startDate) {
        query = query.gte('clock_in_time', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('clock_in_time', options.endDate);
      }

      query = query
        .order('clock_in_time', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        records: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    },
    enabled: !!currentCompany?.id,
  });
}

// Today's attendance record for an employee
export function useTodayAttendanceQuery(employeeId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: attendanceKeys.todayRecord(employeeId),
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('clock_in_time', `${today}T00:00:00.000Z`)
        .lt('clock_in_time', `${today}T23:59:59.999Z`)
        .order('clock_in_time', { ascending: false })
        .limit(1);

      if (currentCompany?.id) {
        query = query.eq('company_id', currentCompany.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId && !!currentCompany?.id,
    staleTime: 30 * 1000, // 30 seconds for today's record
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Attendance statistics
export function useAttendanceStatsQuery(options?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { currentCompany } = useCompany();
  return useQuery({
    queryKey: [...attendanceKeys.stats(), options],
    queryFn: async () => {
      // Build the query with filters
      let query = supabase
        .from('attendance_records')
        .select('total_hours, clock_in_time, status');

      if (currentCompany?.id) {
        query = query.eq('company_id', currentCompany.id);
      }

      if (options?.employeeId) {
        query = query.eq('employee_id', options.employeeId);
      }

      if (options?.startDate) {
        query = query.gte('clock_in_time', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('clock_in_time', options.endDate);
      }

      // Get aggregated stats
      const { data, error } = await query;

      if (error) throw error;

      const records = data || [];
      const totalHours = records.reduce((sum, record) => sum + (record.total_hours || 0), 0);
      const daysWorked = records.filter(record => record.total_hours && record.total_hours > 0).length;
      const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

      return {
        totalHours,
        daysWorked,
        avgHoursPerDay,
        totalRecords: records.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!currentCompany?.id,
  });
}

// Clock in mutation
export function useClockInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      location?: string;
      notes?: string;
      clock_in_latitude?: number;
      clock_in_longitude?: number;
      clock_in_gps_timestamp?: string;
      ip_address?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('attendance_records')
        .insert({
          ...data,
          clock_in_time: new Date().toISOString(),
          status: 'clocked_in',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      // Invalidate today's attendance
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.todayRecord(data.employee_id) 
      });
      // Invalidate records list
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.records() 
      });
    },
  });
}

// Clock out mutation
export function useClockOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      data,
    }: {
      recordId: string;
      data: {
        clock_out_time: string;
        location?: string;
        notes?: string;
        clock_out_latitude?: number;
        clock_out_longitude?: number;
        clock_out_gps_timestamp?: string;
        clock_out_ip_address?: string;
      };
    }) => {
      const { data: result, error } = await supabase
        .from('attendance_records')
        .update(data)
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      // Invalidate today's attendance
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.todayRecord(data.employee_id) 
      });
      // Invalidate records list
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.records() 
      });
      // Invalidate stats
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.stats() 
      });
    },
  });
}

// Break start mutation
export function useStartBreakMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          break_start_time: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.todayRecord(data.employee_id) 
      });
    },
  });
}

// Break end mutation
export function useEndBreakMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          break_end_time: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.todayRecord(data.employee_id) 
      });
    },
  });
}

// Utility hook to invalidate attendance queries
export function useInvalidateAttendance() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
    invalidateRecords: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.records() }),
    invalidateTodayRecord: (employeeId: string) => 
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayRecord(employeeId) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() }),
  };
}
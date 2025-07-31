import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys for dashboard data
export const dashboardKeys = {
  upcomingBirthdays: ['dashboard', 'birthdays'] as const,
  todayAttendance: ['dashboard', 'attendance', 'today'] as const,
  attendanceStats: ['dashboard', 'attendance', 'stats'] as const,
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
  return useQuery({
    queryKey: dashboardKeys.todayAttendance,
    queryFn: async (): Promise<{ attendance: TodayAttendance[]; stats: AttendanceStats }> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get attendance records for today (limit to reduce load)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('id, employee_id, clock_in_time, clock_out_time, status, total_hours')
        .gte('clock_in_time', `${today}T00:00:00`)
        .lt('clock_in_time', `${today}T23:59:59`)
        .order('clock_in_time', { ascending: false })
        .limit(15);

      if (attendanceError) throw attendanceError;

      if (!attendanceData || attendanceData.length === 0) {
        return {
          attendance: [],
          stats: { clockedIn: 0, clockedOut: 0, late: 0, onBreak: 0 }
        };
      }

      // Get unique employee IDs and their details
      const employeeIds = [...new Set(attendanceData.map(record => record.employee_id))];
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .in('id', employeeIds)
        .eq('status', 'active');

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
    enabled: true,
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
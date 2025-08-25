import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys for reports data
export const reportKeys = {
  overview: ['reports', 'overview'] as const,
  employees: ['reports', 'employees'] as const,
  attendance: ['reports', 'attendance'] as const,
  performance: ['reports', 'performance'] as const,
  recruitment: ['reports', 'recruitment'] as const,
  payroll: ['reports', 'payroll'] as const,
  departmentDistribution: ['reports', 'department', 'distribution'] as const,
  monthlyTrends: ['reports', 'monthly', 'trends'] as const,
} as const;

// Overview metrics interface
interface OverviewMetrics {
  totalEmployees: number;
  avgPerformance: number;
  attendanceRate: number;
  openPositions: number;
  employeeGrowth: string;
  performanceChange: string;
  attendanceChange: string;
  positionsFilled: string;
}

// Department distribution interface
interface DepartmentDistribution {
  department: string;
  count: number;
  percentage: number;
}

// Monthly trends interface
interface MonthlyTrends {
  month: string;
  employees: number;
  attendance: number;
  performance: number;
}

// Overview metrics query
export function useOverviewMetricsQuery(timeRange: string = 'last-30-days') {
  return useQuery({
    queryKey: [...reportKeys.overview, timeRange],
    queryFn: async (): Promise<OverviewMetrics> => {
      const today = new Date();
      let startDate: Date;
      
      // Calculate date range based on selection
      switch (timeRange) {
        case 'last-7-days':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last-quarter':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          break;
        case 'last-year':
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          break;
        default: // last-30-days
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get total employees count
      const { count: totalEmployees, error: totalError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (totalError) throw totalError;

      // Get previous period count for growth calculation
      const previousStartDate = new Date(startDate.getTime() - (today.getTime() - startDate.getTime()));
      const { count: previousEmployees, error: previousError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('created_at', previousStartDate.toISOString());

      if (previousError) throw previousError;

      // Calculate employee growth
      const currentCount = totalEmployees || 0;
      const previousCount = previousEmployees || 0;
      const growth = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;
      const employeeGrowth = growth > 0 ? `+${growth.toFixed(1)}% from last period` : `${growth.toFixed(1)}% from last period`;

      // Get average performance (from appraisals if available)
      const { data: performanceData, error: performanceError } = await supabase
        .from('appraisals')
        .select('overall_rating')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', today.toISOString())
        .not('overall_rating', 'is', null);

      if (performanceError) throw performanceError;

      const avgPerformance = performanceData && performanceData.length > 0
        ? performanceData.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / performanceData.length
        : 0;

      // Get attendance rate for the period
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('status, clock_in_time')
        .gte('clock_in_time', startDate.toISOString())
        .lte('clock_in_time', today.toISOString());

      if (attendanceError) throw attendanceError;

      const totalRecords = attendanceData?.length || 0;
      const presentRecords = attendanceData?.filter(record => record.status === 'clocked_in' || record.status === 'clocked_out').length || 0;
      const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

      // Get previous period attendance for comparison
      const { data: previousAttendanceData, error: previousAttendanceError } = await supabase
        .from('attendance_records')
        .select('status, clock_in_time')
        .gte('clock_in_time', previousStartDate.toISOString())
        .lt('clock_in_time', startDate.toISOString());

      if (previousAttendanceError) throw previousAttendanceError;

      const previousTotalRecords = previousAttendanceData?.length || 0;
      const previousPresentRecords = previousAttendanceData?.filter(record => record.status === 'clocked_in' || record.status === 'clocked_out').length || 0;
      const previousAttendanceRate = previousTotalRecords > 0 ? (previousPresentRecords / previousTotalRecords) * 100 : 0;

      const attendanceChange = previousAttendanceRate > 0 
        ? `${((attendanceRate - previousAttendanceRate) / previousAttendanceRate * 100).toFixed(1)}% from last period`
        : 'No previous data';

      // Get performance change
      const { data: previousPerformanceData, error: previousPerformanceError } = await supabase
        .from('appraisals')
        .select('overall_rating')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .not('overall_rating', 'is', null);

      if (previousPerformanceError) throw previousPerformanceError;

      const previousAvgPerformance = previousPerformanceData && previousPerformanceData.length > 0
        ? previousPerformanceData.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / previousPerformanceData.length
        : 0;

      const performanceChange = previousAvgPerformance > 0
        ? `${((avgPerformance - previousAvgPerformance) / previousAvgPerformance * 100).toFixed(1)}% from last period`
        : 'No previous data';

      // Get open positions count (positions without an assigned employee)
      const { count: openPositions, error: openPositionsError } = await supabase
        .from('organization_positions')
        .select('*', { count: 'exact', head: true })
        .is('employee_id', null)
        .eq('is_active', true);

      if (openPositionsError) throw openPositionsError;

      // Get filled positions count for the period
      const { count: filledPositions, error: filledError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gte('join_date', startDate.toISOString())
        .lte('join_date', today.toISOString());

      if (filledError) throw filledError;

      const positionsFilled = `${filledPositions || 0} filled this period`;

      return {
        totalEmployees: currentCount,
        avgPerformance: parseFloat(avgPerformance.toFixed(1)),
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        openPositions: openPositions || 0,
        employeeGrowth,
        performanceChange,
        attendanceChange,
        positionsFilled,
      };
    },
    staleTime: 30 * 60 * 1000, // Increased from 10 to 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Department distribution query
export function useDepartmentDistributionQuery() {
  return useQuery({
    queryKey: reportKeys.departmentDistribution,
    queryFn: async (): Promise<DepartmentDistribution[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('status', 'active');

      if (error) throw error;

      const departmentCounts = (data || []).reduce((acc, employee) => {
        const dept = employee.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = Object.values(departmentCounts).reduce((sum, count) => sum + count, 0);

      return Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: parseFloat(((count / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 60 * 60 * 1000, // Increased from 30 to 60 minutes
    gcTime: 4 * 60 * 60 * 1000, // 4 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Monthly trends query
export function useMonthlyTrendsQuery(months: number = 6) {
  return useQuery({
    queryKey: [...reportKeys.monthlyTrends, months],
    queryFn: async (): Promise<MonthlyTrends[]> => {
      const today = new Date();
      const trends: MonthlyTrends[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Get employee count for this month
        const { count: employees, error: employeesError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .lte('join_date', endOfMonth.toISOString());

        if (employeesError) throw employeesError;

        // Get attendance rate for this month
        let query3 = supabase
          .from('attendance_records')
          .select('status, clock_in_time')
          .gte('clock_in_time', startOfMonth.toISOString())
          .lte('clock_in_time', endOfMonth.toISOString());

        try {
          const { data: profile } = await supabase.auth.getUser();
          if (profile.user) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('user_id', profile.user.id)
              .maybeSingle();
            if (prof?.company_id) {
              query3 = query3.eq('company_id', prof.company_id);
            }
          }
        } catch {}

        const { data: attendanceData, error: attendanceError } = await query3;

        if (attendanceError) throw attendanceError;

        const totalRecords = attendanceData?.length || 0;
        const presentRecords = attendanceData?.filter(record => record.status === 'clocked_in' || record.status === 'clocked_out').length || 0;
        const attendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        // Get average performance for this month
        const { data: performanceData, error: performanceError } = await supabase
          .from('appraisals')
          .select('overall_rating')
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
          .not('overall_rating', 'is', null);

        if (performanceError) throw performanceError;

        const avgPerformance = performanceData && performanceData.length > 0
          ? performanceData.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / performanceData.length
          : 0;

        trends.push({
          month: monthName,
          employees: employees || 0,
          attendance: parseFloat(attendance.toFixed(1)),
          performance: parseFloat(avgPerformance.toFixed(1)),
        });
      }

      return trends;
    },
    staleTime: 60 * 60 * 1000, // Increased from 30 to 60 minutes
    gcTime: 4 * 60 * 60 * 1000, // 4 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Employee analytics query
export function useEmployeeAnalyticsQuery() {
  return useQuery({
    queryKey: reportKeys.employees,
    queryFn: async () => {
      // Get employee demographics and statistics
      const { data: employees, error } = await supabase
        .from('employees')
        .select('department, position, join_date, basic_salary, status')
        .eq('status', 'active');

      if (error) throw error;

      const totalEmployees = employees?.length || 0;
      const avgSalary = employees && employees.length > 0
        ? employees.reduce((sum, emp) => sum + (emp.basic_salary || 0), 0) / employees.length
        : 0;

      const departments = [...new Set(employees?.map(emp => emp.department).filter(Boolean) || [])];
      const positions = [...new Set(employees?.map(emp => emp.position).filter(Boolean) || [])];

      return {
        totalEmployees,
        avgSalary: parseFloat(avgSalary.toFixed(2)),
        departments,
        positions,
        employeeData: employees || [],
      };
    },
    staleTime: 30 * 60 * 1000, // Increased from 15 to 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Attendance analytics query
export function useAttendanceAnalyticsQuery() {
  return useQuery({
    queryKey: reportKeys.attendance,
    queryFn: async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: attendanceData, error } = await supabase
        .from('attendance_records')
        .select('clock_in_time, clock_out_time, total_hours, status')
        .gte('clock_in_time', startOfMonth.toISOString())
        .lte('clock_in_time', today.toISOString());

      if (error) throw error;

      const records = attendanceData || [];
      const totalHours = records.reduce((sum, record) => sum + (record.total_hours || 0), 0);
      const avgHoursPerDay = records.length > 0 ? totalHours / records.length : 0;
      const lateArrivals = records.filter(record => {
        const clockInTime = new Date(record.clock_in_time);
        const workStartTime = new Date(clockInTime);
        workStartTime.setHours(9, 0, 0, 0);
        return clockInTime > workStartTime;
      }).length;

      return {
        totalRecords: records.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(2)),
        lateArrivals,
        attendanceRate: records.length > 0 ? ((records.length - lateArrivals) / records.length) * 100 : 0,
      };
    },
    staleTime: 30 * 60 * 1000, // Increased from 10 to 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

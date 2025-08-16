import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimesheetEntry {
  id: string;
  employee_id: string;
  project_name: string;
  task_name: string;
  description?: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  total_hours: number;
  entry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimesheetEntryData {
  employee_id: string;
  project_name: string;
  task_name: string;
  description?: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  entry_date: string;
}

// New interface for timesheet statistics
export interface TimesheetStats {
  hoursThisWeek: number;
  daysLogged: number;
  billableHours: number;
  approvedSheets: number;
  weekChange: number;
  billableRate: number;
}

// New interface for timesheet table data
export interface TimesheetTableEntry {
  id: string;
  week: string;
  period: string;
  totalHours: number;
  billableHours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedDate?: string;
  approvedBy?: string;
  projects: string[];
}

const timesheetKeys = {
  all: ['timesheets'] as const,
  entries: (employeeId?: string, date?: string) => [...timesheetKeys.all, 'entries', employeeId, date] as const,
  stats: (employeeId?: string) => [...timesheetKeys.all, 'stats', employeeId] as const,
  tableData: (employeeId?: string) => [...timesheetKeys.all, 'tableData', employeeId] as const,
};

export function useTimesheetEntriesQuery(employeeId?: string, date?: string) {
  return useQuery({
    queryKey: timesheetKeys.entries(employeeId, date),
    queryFn: async () => {
      if (!employeeId) return [];
      
      let query = supabase
        .from('timesheet_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('entry_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimesheetEntry[];
    },
    enabled: !!employeeId,
  });
}

export function useTimesheetStatsQuery(employeeId?: string) {
  return useQuery({
    queryKey: timesheetKeys.stats(employeeId),
    queryFn: async () => {
      if (!employeeId) return null;
      
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(weekStart.getDate() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

      // Get this week's entries
      const { data: thisWeekEntries, error: thisWeekError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('entry_date', weekStart.toISOString().split('T')[0])
        .lte('entry_date', weekEnd.toISOString().split('T')[0]);

      if (thisWeekError) throw thisWeekError;

      // Get last week's entries
      const { data: lastWeekEntries, error: lastWeekError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('entry_date', lastWeekStart.toISOString().split('T')[0])
        .lte('entry_date', lastWeekEnd.toISOString().split('T')[0]);

      if (lastWeekError) throw lastWeekError;

      // Calculate statistics
      const thisWeekHours = (thisWeekEntries || []).reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const lastWeekHours = (lastWeekEntries || []).reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const weekChange = thisWeekHours - lastWeekHours;
      
      const uniqueDays = new Set((thisWeekEntries || []).map(entry => entry.entry_date)).size;
      const billableHours = (thisWeekEntries || []).reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const billableRate = thisWeekHours > 0 ? (billableHours / thisWeekHours) * 100 : 0;

      // Get approved timesheets count for this month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data: monthEntries, error: monthError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('entry_date', monthStart.toISOString().split('T')[0])
        .eq('status', 'approved');

      if (monthError) throw monthError;

      const approvedSheets = (monthEntries || []).length;

      return {
        hoursThisWeek: thisWeekHours,
        daysLogged: uniqueDays,
        billableHours: billableHours,
        approvedSheets: approvedSheets,
        weekChange: weekChange,
        billableRate: billableRate,
      } as TimesheetStats;
    },
    enabled: !!employeeId,
  });
}

export function useTimesheetTableDataQuery(employeeId?: string) {
  return useQuery({
    queryKey: timesheetKeys.tableData(employeeId),
    queryFn: async () => {
      if (!employeeId) return [];
      
      const now = new Date();
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(now.getDate() - 28);

      // Get entries for the last 4 weeks
      const { data: entries, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('entry_date', fourWeeksAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (error) throw error;

      // Group entries by week and create table data
      const weeklyData: Record<string, any> = {};
      
      (entries || []).forEach(entry => {
        const entryDate = new Date(entry.entry_date);
        const weekStart = new Date(entryDate);
        weekStart.setDate(entryDate.getDate() - entryDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            weekStart,
            weekEnd,
            entries: [],
            totalHours: 0,
            billableHours: 0,
            projects: new Set<string>(),
          };
        }
        
        weeklyData[weekKey].entries.push(entry);
        weeklyData[weekKey].totalHours += entry.total_hours || 0;
        weeklyData[weekKey].billableHours += entry.total_hours || 0; // Assuming all hours are billable for now
        weeklyData[weekKey].projects.add(entry.project_name);
      });

      // Convert to table format
      const tableData: TimesheetTableEntry[] = Object.entries(weeklyData).map(([weekKey, data]: [string, any]) => {
        const weekNumber = Math.ceil((now.getTime() - data.weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weekLabel = weekNumber === 1 ? 'Current Week' : `Week ${weekNumber}`;
        
        return {
          id: weekKey,
          week: weekLabel,
          period: `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${data.weekEnd.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`,
          totalHours: data.totalHours,
          billableHours: data.billableHours,
          status: 'draft' as const, // Default status, can be enhanced later
          projects: Array.from(data.projects),
        };
      });

      return tableData;
    },
    enabled: !!employeeId,
  });
}

export function useTimesheetApprovalsQuery() {
  return useQuery({
    queryKey: [...timesheetKeys.all, 'approvals'],
    queryFn: async () => {
      // Get all timesheet entries that need approval
      const { data: entries, error } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            department,
            position
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the approval interface
      const approvals = (entries || []).map(entry => {
        const entryDate = new Date(entry.entry_date);
        const weekStart = new Date(entryDate);
        weekStart.setDate(entryDate.getDate() - entryDate.getDay());
        const weekNumber = Math.ceil((new Date().getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        return {
          id: entry.id,
          employeeName: `${entry.employees.first_name} ${entry.employees.last_name}`,
          employeeId: entry.employees.id,
          department: entry.employees.department,
          position: entry.employees.position,
          week: `Week ${weekNumber}`,
          period: entry.entry_date,
          totalHours: entry.total_hours || 0,
          billableHours: entry.total_hours || 0,
          submittedDate: new Date(entry.created_at),
          overtime: 0, // Not implemented yet
          projects: [{ name: entry.project_name, hours: entry.total_hours || 0 }],
          comments: entry.description,
          lineManager: "Manager", // Placeholder
          isManager: false,
          approvalStatus: 'pending_manager' as const,
        };
      });

      return approvals;
    },
  });
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: [...timesheetKeys.all, 'projects'],
    queryFn: async () => {
      // Get unique project names from timesheet entries
      const { data: entries, error } = await supabase
        .from('timesheet_entries')
        .select('project_name')
        .not('project_name', 'is', null);

      if (error) throw error;

      // Extract unique project names
      const uniqueProjects = [...new Set((entries || []).map(entry => entry.project_name))];
      
      // Add some default projects if none exist yet
      if (uniqueProjects.length === 0) {
        return [
          "HR Management System",
          "E-commerce Platform",
          "Mobile App Development",
          "Data Analytics Dashboard",
          "Client Website",
        ];
      }

      return uniqueProjects.sort();
    },
  });
}

export function useCreateTimesheetEntryMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTimesheetEntryData) => {
      // Calculate total hours from start and end time
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);
      const breakMinutes = data.break_duration || 0;
      
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = (durationMs / (1000 * 60)) - breakMinutes;
      const totalHours = Math.max(0, durationMinutes / 60);

      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          ...data,
          total_hours: totalHours,
          status: 'pending', // Default status for new entries
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result as TimesheetEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.entries(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: timesheetKeys.stats(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: timesheetKeys.tableData(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: [...timesheetKeys.all, 'projects'] });
      toast({
        title: "Time Entry Saved",
        description: `${data.total_hours?.toFixed(1) || '0'} hours logged for ${data.task_name}`,
      });
    },
    onError: (error: any) => {
      console.error('Failed to create timesheet entry:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save time entry",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTimesheetEntryMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTimesheetEntryData> }) => {
      let updateData = { ...data };
      
      // If start_time or end_time is being updated, recalculate total_hours
      if (data.start_time || data.end_time) {
        const startTime = new Date(data.start_time || '');
        const endTime = new Date(data.end_time || '');
        const breakMinutes = data.break_duration || 0;
        
        if (startTime && endTime) {
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = (durationMs / (1000 * 60)) - breakMinutes;
          const totalHours = Math.max(0, durationMinutes / 60);
          updateData.total_hours = totalHours;
        }
      }

      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as TimesheetEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.entries(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: timesheetKeys.stats(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: timesheetKeys.tableData(data.employee_id) });
      queryClient.invalidateQueries({ queryKey: [...timesheetKeys.all, 'projects'] });
      toast({
        title: "Time Entry Updated",
        description: "Time entry has been updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Failed to update timesheet entry:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update time entry",
        variant: "destructive",
      });
    },
  });
}
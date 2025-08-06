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

const timesheetKeys = {
  all: ['timesheets'] as const,
  entries: (employeeId?: string, date?: string) => [...timesheetKeys.all, 'entries', employeeId, date] as const,
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

export function useCreateTimesheetEntryMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTimesheetEntryData) => {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result as TimesheetEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.entries(data.employee_id) });
      toast({
        title: "Time Entry Saved",
        description: `${data.total_hours} hours logged for ${data.task_name}`,
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
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as TimesheetEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.entries(data.employee_id) });
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
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  total_hours: number | null;
  break_duration: number | null;
  status: string;
  location: string | null;
  notes: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export function useAttendanceRecords(employeeId?: string, date?: Date) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) {
      fetchRecords();
    }
  }, [employeeId, date]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('clock_in_time', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('clock_in_time', startOfDay.toISOString())
                    .lte('clock_in_time', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string, location?: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .insert([{
          employee_id: employeeId,
          clock_in_time: new Date().toISOString(),
          location,
          notes,
          status: 'clocked_in'
        }]);

      if (error) throw error;

      toast({
        title: "Clocked In",
        description: "Successfully clocked in for today.",
      });

      fetchRecords();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to clock in',
        variant: "destructive",
      });
      return false;
    }
  };

  const clockOut = async (recordId: string, location?: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: new Date().toISOString(),
          clock_out_location: location,
          notes,
          status: 'clocked_out'
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Clocked Out",
        description: "Successfully clocked out for today.",
      });

      fetchRecords();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to clock out',
        variant: "destructive",
      });
      return false;
    }
  };

  const startBreak = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          break_start_time: new Date().toISOString(),
          status: 'on_break'
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Break Started",
        description: "Break time has been recorded.",
      });

      fetchRecords();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to start break',
        variant: "destructive",
      });
      return false;
    }
  };

  const endBreak = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          break_end_time: new Date().toISOString(),
          status: 'clocked_in'
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Break Ended",
        description: "Back to work! Break time has been recorded.",
      });

      fetchRecords();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to end break',
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    records,
    loading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    refetch: fetchRecords
  };
}

export function useTodayAttendance(employeeId?: string) {
  const today = new Date();
  return useAttendanceRecords(employeeId, today);
}
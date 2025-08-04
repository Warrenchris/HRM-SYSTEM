import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

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
    } else {
      setLoading(false);
      setRecords([]);
    }
  }, [employeeId, date]);

  const fetchRecords = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('clock_in_time', { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('clock_in_time', startOfDay.toISOString())
                    .lte('clock_in_time', endOfDay.toISOString());
      }

      console.log('Fetching attendance records for employee:', employeeId);
      const { data, error } = await query;

      if (error) {
        console.error('Attendance fetch error:', error);
        throw error;
      }
      
      console.log('Attendance records fetched successfully:', data?.length);
      setRecords(data || []);
    } catch (err) {
      console.error('Error in fetchRecords:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string, location?: string, notes?: string, gpsLocation?: GPSLocation) => {
    try {
      console.log('clockIn called with employeeId:', employeeId);
      
      // Get current user's company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      const clockInData: any = {
        employee_id: employeeId,
        clock_in_time: new Date().toISOString(),
        location,
        notes,
        status: 'clocked_in',
        company_id: profile?.company_id || null
      };

      if (gpsLocation) {
        clockInData.clock_in_latitude = gpsLocation.latitude;
        clockInData.clock_in_longitude = gpsLocation.longitude;
        clockInData.clock_in_gps_timestamp = gpsLocation.timestamp.toISOString();
      }

      console.log('Inserting clock in data:', clockInData);
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([clockInData])
        .select();

      if (error) {
        console.error('Clock in error:', error);
        throw error;
      }

      console.log('Clock in successful, inserted data:', data);
      toast({
        title: "Clocked In",
        description: "Successfully clocked in for today.",
      });

      fetchRecords();
      return true;
    } catch (err) {
      console.error('Clock in failed:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to clock in',
        variant: "destructive",
      });
      return false;
    }
  };

  const clockOut = async (recordId: string, location?: string, notes?: string, gpsLocation?: GPSLocation) => {
    try {
      const clockOutData: any = {
        clock_out_time: new Date().toISOString(),
        clock_out_location: location,
        notes,
        status: 'clocked_out'
      };

      if (gpsLocation) {
        clockOutData.clock_out_latitude = gpsLocation.latitude;
        clockOutData.clock_out_longitude = gpsLocation.longitude;
        clockOutData.clock_out_gps_timestamp = gpsLocation.timestamp.toISOString();
      }

      const { error } = await supabase
        .from('attendance_records')
        .update(clockOutData)
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
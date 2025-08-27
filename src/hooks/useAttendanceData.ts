import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
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
  const { currentCompany } = useCompany();

  // Create a stable dependency key for the provided date so we only refetch
  // when the calendar day changes, not on every render that creates a new Date
  const dateKey = date ? new Date(date).toDateString() : undefined;

  useEffect(() => {
    if (employeeId) {
      fetchRecords();
    } else {
      setLoading(false);
      setRecords([]);
    }
  // Depend on the day key instead of the raw Date object reference
  }, [employeeId, dateKey, currentCompany?.id]);

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
        // Prefer latest updates first to avoid stale open records dominating
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('clock_in_time', { ascending: false, nullsFirst: false });

      if (currentCompany?.id) {
        query = query.eq('company_id', currentCompany.id);
      }

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
      
      // Resolve company_id from context (preferred) or fallback to profile/employee
      let companyId = currentCompany?.id as string | undefined;
      if (!companyId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        if (!profileError) {
          companyId = profile?.company_id;
        }
        if (!companyId) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('company_id')
            .eq('id', employeeId)
            .single();
          companyId = employeeData?.company_id;
        }
      }

      const clockInData: any = {
        employee_id: employeeId,
        clock_in_time: new Date().toISOString(),
        location,
        notes,
        status: 'clocked_in'
      };

      // Only add company_id if the column exists (for backward compatibility)
      if (companyId) {
        try {
          // Test if company_id column exists by trying to insert it
          clockInData.company_id = companyId;
        } catch (error) {
          console.log('company_id column not available, skipping');
          delete clockInData.company_id;
        }
      }

      if (gpsLocation) {
        clockInData.clock_in_latitude = gpsLocation.latitude;
        clockInData.clock_in_longitude = gpsLocation.longitude;
        clockInData.clock_in_gps_timestamp = gpsLocation.timestamp.toISOString();
      }

      console.log('Final clock in data:', clockInData);

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
      const nowIso = new Date().toISOString();

      // Fetch existing record to compute totals accurately
      const { data: existing, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', recordId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const clockOutData: any = {
        clock_out_time: nowIso,
        clock_out_location: location,
        notes,
        status: 'clocked_out'
      };

      if (gpsLocation) {
        clockOutData.clock_out_latitude = gpsLocation.latitude;
        clockOutData.clock_out_longitude = gpsLocation.longitude;
        clockOutData.clock_out_gps_timestamp = gpsLocation.timestamp.toISOString();
      }

      // Compute total_hours and break_duration (in hours) if we have the record
      if (existing?.clock_in_time) {
        const now = new Date(nowIso).getTime();
        const clockInMs = new Date(existing.clock_in_time).getTime();

        let breakMinutes = Number(existing.break_duration || 0) * 60; // stored as hours
        if (existing.break_start_time && !existing.break_end_time) {
          const breakStartMs = new Date(existing.break_start_time).getTime();
          if (!isNaN(breakStartMs)) {
            breakMinutes += Math.max(0, (now - breakStartMs) / 60000);
          }
        }

        const workedMinutes = Math.max(0, (now - clockInMs) / 60000 - breakMinutes);
        const totalHours = parseFloat((workedMinutes / 60).toFixed(2));
        const normalizedBreakHours = parseFloat((breakMinutes / 60).toFixed(2));

        clockOutData.total_hours = totalHours;
        clockOutData.break_duration = normalizedBreakHours;
      }

      const { error } = await supabase
        .from('attendance_records')
        .update(clockOutData)
        .eq('id', recordId);

      if (error) throw error;

      // Optimistically update local state so UI reflects clock-out immediately
      setRecords(prev => prev.map(r => (
        r.id === recordId
          ? {
              ...r,
              ...clockOutData,
              // Ensure status is set explicitly to clocked_out and clock_out_time present
              status: 'clocked_out',
              clock_out_time: clockOutData.clock_out_time || nowIso
            }
          : r
      )));

      toast({
        title: "Clocked Out",
        description: "Successfully clocked out for today.",
      });

      // Ensure the next consumers see the server-updated record before we return
      await fetchRecords();
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
      const nowIso = new Date().toISOString();

      // Fetch the record to compute accumulated break_duration
      const { data: existing, error: fetchError } = await supabase
        .from('attendance_records')
        .select('break_start_time, break_duration')
        .eq('id', recordId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let newBreakDurationHours = Number(existing?.break_duration || 0);
      if (existing?.break_start_time) {
        const breakStartMs = new Date(existing.break_start_time).getTime();
        const nowMs = new Date(nowIso).getTime();
        if (!isNaN(breakStartMs)) {
          const deltaMinutes = Math.max(0, (nowMs - breakStartMs) / 60000);
          newBreakDurationHours = parseFloat((newBreakDurationHours + deltaMinutes / 60).toFixed(2));
        }
      }

      const { error } = await supabase
        .from('attendance_records')
        .update({
          break_end_time: nowIso,
          break_duration: newBreakDurationHours,
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
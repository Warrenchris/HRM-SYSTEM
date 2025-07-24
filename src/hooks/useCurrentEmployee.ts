import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CurrentEmployee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  status: string;
}

export function useCurrentEmployee() {
  const [employee, setEmployee] = useState<CurrentEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    const fetchCurrentEmployee = async () => {
      try {
        setLoading(true);
        
        // First get the user's profile to find their employee_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile?.employee_id) {
          // No employee linked to this user
          setEmployee(null);
          setLoading(false);
          return;
        }

        // Get employee details
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, employee_id, first_name, last_name, email, department, position, status')
          .eq('id', profile.employee_id)
          .single();

        if (employeeError) {
          throw employeeError;
        }

        setEmployee(employeeData);
      } catch (err) {
        console.error('Error fetching current employee:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentEmployee();
  }, [user]);

  return { employee, loading, error };
}
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
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          if (profileError.code === 'PGRST116') {
            // No profile found, create one
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{ user_id: user.id, role: 'employee' }])
              .select('employee_id')
              .single();
            
            if (createError) {
              throw createError;
            }
            
        // Try to find an employee with matching email
        const { data: matchingEmployee, error: employeeSearchError } = await supabase
          .from('employees')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        
        if (employeeSearchError) {
          console.log('No employee found with email:', user.email);
          // Try to create a basic employee profile
          const { data: newEmployee, error: createEmployeeError } = await supabase
            .from('employees')
            .insert([{
              email: user.email,
              first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Unknown',
              last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User',
              status: 'active',
              department: 'General',
              position: 'Employee'
            }])
            .select('id')
            .single();
          
          if (createEmployeeError) {
            console.error('Failed to create employee:', createEmployeeError);
            setEmployee(null);
            setLoading(false);
            return;
          }
          
          // Update profile with new employee_id
          await supabase
            .from('profiles')
            .update({ employee_id: newEmployee.id })
            .eq('user_id', user.id);
          
          profile = { employee_id: newEmployee.id };
        } else if (matchingEmployee) {
          // Update profile with employee_id
          await supabase
            .from('profiles')
            .update({ employee_id: matchingEmployee.id })
            .eq('user_id', user.id);
          
          profile = { employee_id: matchingEmployee.id };
        } else {
          setEmployee(null);
          setLoading(false);
          return;
        }
          } else {
            throw profileError;
          }
        }

        if (!profile?.employee_id) {
          // Try to find an employee with matching email
          const { data: matchingEmployee } = await supabase
            .from('employees')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
          
          if (matchingEmployee) {
            // Update profile with employee_id
            await supabase
              .from('profiles')
              .update({ employee_id: matchingEmployee.id })
              .eq('user_id', user.id);
            
            profile.employee_id = matchingEmployee.id;
          } else {
            setEmployee(null);
            setLoading(false);
            return;
          }
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

        console.log('Employee data loaded successfully:', employeeData);
        setEmployee(employeeData);
      } catch (err) {
        console.error('Error fetching current employee:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch employee data');
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentEmployee();
  }, [user]);

  return { employee, loading, error };
}
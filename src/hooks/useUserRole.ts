import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setRole(null);
        setIsEmployee(false);
        setLoading(false);
        return;
      }

      try {
        // First check if user exists in employees table
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('id, email')
          .eq('email', user.email)
          .maybeSingle();

        if (employee) {
          setRole('employee');
          setIsEmployee(true);
          setLoading(false);
          return;
        }

        // If not an employee, check profiles table for admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.role) {
          setRole(profile.role);
          setIsEmployee(profile.role === 'employee');
        } else {
          // Default to admin if no specific role found
          setRole('admin');
          setIsEmployee(false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Default to admin if any error occurs
        setRole('admin');
        setIsEmployee(false);
      }

      setLoading(false);
    }

    checkUserRole();
  }, [user]);

  return { role, isEmployee, loading };
}
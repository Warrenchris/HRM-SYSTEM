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
        // Check if user has a profile with role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, employee_id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setRole(profile.role);
          setIsEmployee(profile.role === 'employee' || !!profile.employee_id);
        } else {
          // Check if user exists in employees table
          const { data: employee } = await supabase
            .from('employees')
            .select('id')
            .eq('email', user.email)
            .single();

          if (employee) {
            setRole('employee');
            setIsEmployee(true);
          } else {
            setRole('admin');
            setIsEmployee(false);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('admin'); // Default to admin if uncertain
        setIsEmployee(false);
      }

      setLoading(false);
    }

    checkUserRole();
  }, [user]);

  return { role, isEmployee, loading };
}
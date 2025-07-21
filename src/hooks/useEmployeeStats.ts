import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  exitedEmployees: number;
  loading: boolean;
  error: string | null;
}

export function useEmployeeStats(): EmployeeStats {
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    exitedEmployees: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Get total employees count
      const { count: totalCount, error: totalError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get active employees count (status = 'active' AND no exit_date)
      const { count: activeCount, error: activeError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('exit_date', null);

      if (activeError) throw activeError;

      // Get exited employees count (status = 'inactive' OR has exit_date)
      const { count: exitedCount, error: exitedError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.inactive,exit_date.not.is.null');

      if (exitedError) throw exitedError;

      setStats({
        totalEmployees: totalCount || 0,
        activeEmployees: activeCount || 0,
        exitedEmployees: exitedCount || 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employee statistics',
      }));
    }
  };

  return stats;
}
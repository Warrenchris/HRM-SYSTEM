import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys for general data
export const generalKeys = {
  announcements: ['announcements'] as const,
  leaveTypes: ['leaveTypes'] as const,
  departments: ['departments'] as const,
  positions: ['positions'] as const,
} as const;

// Announcements query (cached for longer since they don't change often)
export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: generalKeys.announcements,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'active')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Departments list (cached for long time)
export function useDepartmentsQuery() {
  return useQuery({
    queryKey: generalKeys.departments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_positions')
        .select('department')
        .eq('is_active', true);

      if (error) throw error;
      
      // Extract unique departments
      const departments = [...new Set((data || []).map(item => item.department))];
      return departments.filter(Boolean);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Positions list (cached for long time)
export function usePositionsQuery(department?: string) {
  return useQuery({
    queryKey: [...generalKeys.positions, department],
    queryFn: async () => {
      let query = supabase
        .from('organization_positions')
        .select('*')
        .eq('is_active', true);

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query.order('title');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
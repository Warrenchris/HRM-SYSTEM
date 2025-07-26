import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Position {
  id: string;
  title: string;
  department: string;
  description?: string;
  level: number;
  is_active: boolean;
}

export function usePositions(department?: string) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPositions();
  }, [department]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('organization_positions')
        .select('id, title, department, description, level, is_active')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('title', { ascending: true });

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setPositions(data || []);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  return { positions, loading, error, refetch: fetchPositions };
}

export function useDepartments() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_positions')
        .select('department')
        .eq('is_active', true)
        .order('department');

      if (error) throw error;

      // Get unique departments
      const uniqueDepartments = Array.from(
        new Set(data?.map(item => item.department) || [])
      );
      
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return { departments, loading };
}
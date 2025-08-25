import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export function useCompanyData() {
  const { currentCompany } = useCompany();

  const companyAwareQuery = <T>(query: PostgrestFilterBuilder<T>) => {
    if (!currentCompany?.id) {
      throw new Error('No company context available');
    }
    return query.eq('company_id', currentCompany.id);
  };

  const from = <T = any>(table: string) => {
    const query = supabase.from(table).select('*');
    return companyAwareQuery(query);
  };

  const fromWithSelect = <T = any>(table: string, select: string) => {
    const query = supabase.from(table).select(select);
    return companyAwareQuery(query);
  };

  const insert = async <T>(table: string, data: Partial<T> | Partial<T>[]) => {
    if (!currentCompany?.id) {
      throw new Error('No company context available');
    }

    const dataWithCompany = Array.isArray(data)
      ? data.map(item => ({ ...item, company_id: currentCompany.id }))
      : { ...data, company_id: currentCompany.id };

    return supabase.from(table).insert(dataWithCompany);
  };

  const update = <T>(table: string, data: Partial<T>) => {
    if (!currentCompany?.id) {
      throw new Error('No company context available');
    }

    return supabase
      .from(table)
      .update(data)
      .eq('company_id', currentCompany.id);
  };

  const remove = (table: string, id: string) => {
    if (!currentCompany?.id) {
      throw new Error('No company context available');
    }

    return supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('company_id', currentCompany.id);
  };

  return {
    from,
    fromWithSelect,
    insert,
    update,
    remove,
    currentCompanyId: currentCompany?.id
  };
}

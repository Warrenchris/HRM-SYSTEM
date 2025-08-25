export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  registration_number?: string;
  tax_id?: string;
  industry?: string;
  founded_year?: string;
  description?: string;
  website?: string;
  employee_count?: number;
  currency?: string;
  timezone?: string;
  fiscal_year_start?: string;
  created_at?: string;
  updated_at?: string;
}

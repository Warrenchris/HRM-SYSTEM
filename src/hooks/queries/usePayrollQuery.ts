import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayslipRecord {
  id: string;
  employee_id: string;
  pay_period: string;
  pay_date: string;
  basic_salary: number;
  allowances: number;
  overtime_pay: number;
  gross_salary: number;
  paye_tax: number;
  nssf_deduction: number;
  shif_deduction: number;
  housing_levy: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PayslipListItem {
  id: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  status: string;
  generatedDate: string;
}

// Query keys for better cache management
export const payrollKeys = {
  all: ['payroll'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...payrollKeys.lists(), filters] as const,
  details: () => [...payrollKeys.all, 'detail'] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
  employee: (employeeId: string) => [...payrollKeys.all, 'employee', employeeId] as const,
} as const;

// Hook to fetch payslips for the current employee
export function useEmployeePayslips() {
  return useQuery({
    queryKey: payrollKeys.employee('current'),
    queryFn: async (): Promise<PayslipListItem[]> => {
      try {
        // Get current user's employee ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.employee_id) return [];

        // Fetch payslips for this employee
        const { data, error } = await supabase
          .from('payroll_records')
          .select('*')
          .eq('employee_id', profile.employee_id)
          .eq('status', 'processed')
          .order('pay_date', { ascending: false });

        if (error) throw error;

        // Transform data to match the expected format
        return (data || []).map(record => ({
          id: record.id,
          period: record.pay_period,
          grossSalary: record.gross_salary,
          netSalary: record.net_salary,
          status: record.status === 'processed' ? 'Available' : 'Pending',
          generatedDate: record.pay_date
        }));
      } catch (error) {
        console.error('Error fetching employee payslips:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch a specific payslip by ID
export function usePayslipDetail(id: string) {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: async (): Promise<PayslipRecord | null> => {
      try {
        const { data, error } = await supabase
          .from('payroll_records')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching payslip detail:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook to generate a new payslip
export function useGeneratePayslip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ period, payDate }: { period: string; payDate: string }) => {
      try {
        // Get current user's employee ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.employee_id) throw new Error('Employee profile not found');

        // Get employee's basic salary and other details
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('basic_salary, hourly_rate')
          .eq('id', profile.employee_id)
          .single();

        if (employeeError) throw employeeError;

        // Calculate basic payroll (this is a simplified version)
        const basicSalary = employee.basic_salary || 0;
        const allowances = basicSalary * 0.2; // 20% of basic salary
        const overtime = 0; // Would need to calculate from attendance records
        const grossSalary = basicSalary + allowances + overtime;

        // Calculate deductions (simplified Kenyan tax calculations)
        const paye = Math.max(0, (grossSalary - 24000) * 0.25); // Basic PAYE calculation
        const nssf = Math.min(grossSalary * 0.06, 6000); // NSSF 6% capped at 6k
        const shif = Math.min(grossSalary * 0.0175, 1750); // SHIF 1.75% capped at 1.75k
        const housingLevy = grossSalary * 0.015; // Housing Levy 1.5%
        const totalDeductions = paye + nssf + shif + housingLevy;
        const netSalary = grossSalary - totalDeductions;

        // Create the payslip record
        const { data, error } = await supabase
          .from('payroll_records')
          .insert({
            employee_id: profile.employee_id,
            pay_period: period,
            pay_date: payDate,
            basic_salary: basicSalary,
            allowances: allowances,
            overtime_pay: overtime,
            gross_salary: grossSalary,
            paye_tax: paye,
            nssf_deduction: nssf,
            shif_deduction: shif,
            housing_levy: housingLevy,
            other_deductions: 0,
            total_deductions: totalDeductions,
            net_salary: netSalary,
            status: 'processed',
            processed_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error generating payslip:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Payslip Generated",
        description: `Your payslip for ${data.pay_period} has been generated successfully.`,
      });
      // Invalidate and refetch payslips
      queryClient.invalidateQueries({ queryKey: payrollKeys.employee('current') });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate payslip: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook to get available pay periods
export function useAvailablePayPeriods() {
  return useQuery({
    queryKey: [...payrollKeys.all, 'periods'],
    queryFn: async (): Promise<string[]> => {
      try {
        // Get current user's employee ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.employee_id) return [];

        // Get existing pay periods to avoid duplicates
        const { data: existingPeriods } = await supabase
          .from('payroll_records')
          .select('pay_period')
          .eq('employee_id', profile.employee_id);

        const existing = new Set(existingPeriods?.map(p => p.pay_period) || []);

        // Generate available periods for the last 12 months
        const periods: string[] = [];
        const now = new Date();
        
        for (let i = 0; i < 12; i++) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const period = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
          
          if (!existing.has(period)) {
            periods.push(period);
          }
        }

        return periods;
      } catch (error) {
        console.error('Error fetching available pay periods:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PayrollEmployee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  basic_salary: number;
  salary: number;
  hourly_rate?: number;
  status: string;
  bank_account_number?: string;
}

export interface PayrollRecord {
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
}

// Kenyan SHIF rates based on gross salary
export const getShifRate = (grossSalary: number): number => {
  if (grossSalary <= 5999) return 150;
  if (grossSalary <= 7999) return 300;
  if (grossSalary <= 11999) return 400;
  if (grossSalary <= 14999) return 500;
  if (grossSalary <= 19999) return 600;
  if (grossSalary <= 24999) return 750;
  if (grossSalary <= 29999) return 850;
  if (grossSalary <= 34999) return 900;
  if (grossSalary <= 39999) return 950;
  if (grossSalary <= 44999) return 1000;
  if (grossSalary <= 49999) return 1100;
  if (grossSalary <= 59999) return 1200;
  if (grossSalary <= 69999) return 1300;
  if (grossSalary <= 79999) return 1400;
  if (grossSalary <= 89999) return 1500;
  if (grossSalary <= 99999) return 1600;
  return 1700;
};

// Kenyan PAYE calculation
export const calculatePaye = (grossSalary: number): number => {
  const personalRelief = 2400;
  let taxableIncome = grossSalary - personalRelief;
  let tax = 0;

  if (taxableIncome <= 24000) {
    tax = taxableIncome * 0.1;
  } else if (taxableIncome <= 32333) {
    tax = 24000 * 0.1 + (taxableIncome - 24000) * 0.25;
  } else if (taxableIncome <= 500000) {
    tax = 24000 * 0.1 + 8333 * 0.25 + (taxableIncome - 32333) * 0.3;
  } else if (taxableIncome <= 800000) {
    tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + (taxableIncome - 500000) * 0.325;
  } else {
    tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + 300000 * 0.325 + (taxableIncome - 800000) * 0.35;
  }

  return Math.max(0, tax);
};

export const calculatePayroll = (employee: PayrollEmployee, allowances = 0, overtime = 0) => {
  const basicSalary = employee.basic_salary || employee.salary || 0;
  const grossSalary = basicSalary + allowances + overtime;
  const nssf = Math.min(grossSalary * 0.06, 2160); // 6% or max 2160
  const shif = getShifRate(grossSalary);
  const housingLevy = grossSalary * 0.015; // 1.5%
  const paye = calculatePaye(grossSalary - nssf);
  const totalDeductions = nssf + shif + housingLevy + paye;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    allowances,
    overtime,
    grossSalary,
    nssf,
    shif,
    housingLevy,
    paye,
    totalDeductions,
    netSalary
  };
};

export function usePayrollEmployees() {
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching employees",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { employees, loading, error, refetch: fetchEmployees };
}

export function usePayrollRecords(payPeriod?: string) {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, [payPeriod]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payroll_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (payPeriod) {
        query = query.eq('pay_period', payPeriod);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecords(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching payroll records",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async (employeeId: string, payPeriod: string, payDate: string, calculations: any) => {
    try {
      const { data, error } = await supabase
        .from('payroll_records')
        .insert({
          employee_id: employeeId,
          pay_period: payPeriod,
          pay_date: payDate,
          basic_salary: calculations.basicSalary,
          allowances: calculations.allowances,
          overtime_pay: calculations.overtime,
          gross_salary: calculations.grossSalary,
          paye_tax: calculations.paye,
          nssf_deduction: calculations.nssf,
          shif_deduction: calculations.shif,
          housing_levy: calculations.housingLevy,
          other_deductions: 0,
          total_deductions: calculations.totalDeductions,
          net_salary: calculations.netSalary,
          status: 'processed'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payroll Processed",
        description: "Employee payroll has been successfully processed.",
      });

      await fetchRecords();
      return data;
    } catch (err: any) {
      toast({
        title: "Error processing payroll",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { records, loading, error, processPayroll, refetch: fetchRecords };
}
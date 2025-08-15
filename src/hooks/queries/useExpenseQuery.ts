import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interfaces
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  requires_receipt: boolean;
  max_amount?: number;
  is_active: boolean;
}
// Default categories to ensure a useful dropdown without manual seeding
const DEFAULT_EXPENSE_CATEGORIES: Array<Omit<ExpenseCategory, 'id'>> = [
  { name: 'Travel', description: 'Transport, taxis, flights, mileage', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Meals', description: 'Meals and entertainment for business', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Accommodation', description: 'Hotel and lodging', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Office Supplies', description: 'Stationery, small equipment', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Fuel', description: 'Fuel for company or reimbursable travel', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Software', description: 'Software subscriptions and licenses', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Training', description: 'Courses, workshops, and certifications', requires_receipt: true, max_amount: undefined as any, is_active: true },
  { name: 'Communication', description: 'Internet, phone, and data', requires_receipt: true, max_amount: undefined as any, is_active: true },
];


export interface Expense {
  id: string;
  employee_id: string;
  category_id: string;
  title: string;
  description?: string;
  amount: number;
  expense_date: string;
  merchant?: string;
  expense_number: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_urls?: string[];
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  approval_comments?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  payment_date?: string;
  payment_reference?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  category_id: string;
  title: string;
  description?: string;
  amount: number;
  expense_date: string;
  merchant?: string;
  employee_id: string;
  receipt_urls?: string[];
}

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  categories: () => [...expenseKeys.all, 'categories'] as const,
  expenses: (filters?: any) => [...expenseKeys.all, 'list', filters] as const,
  expense: (id: string) => [...expenseKeys.all, 'detail', id] as const,
  myExpenses: (employeeId?: string) => [...expenseKeys.all, 'my', employeeId] as const,
  pendingApprovals: () => [...expenseKeys.all, 'pending-approvals'] as const,
};

// Fetch expense categories
export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: async () => {
      const baseQuery = () =>
        supabase
          .from('expense_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

      const { data, error } = await baseQuery();
      if (error) throw error;

      const existing = (data || []) as ExpenseCategory[];
      const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
      const missing = DEFAULT_EXPENSE_CATEGORIES.filter(c => !existingNames.has(c.name.toLowerCase()));

      if (missing.length > 0) {
        const { error: insertError } = await supabase.from('expense_categories').insert(missing as any);
        if (insertError) {
          console.warn('Failed to insert default expense categories:', insertError);
          return existing;
        }
        const { data: refreshed, error: refetchError } = await baseQuery();
        if (!refetchError) return (refreshed || []) as ExpenseCategory[];
      }

      return existing;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// Fetch user's expenses
export function useMyExpensesQuery(employeeId?: string) {
  return useQuery({
    queryKey: expenseKeys.myExpenses(employeeId),
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories(name, description)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Expense & { expense_categories: { name: string; description?: string } })[];
    },
    enabled: !!employeeId,
  });
}

// Fetch all expenses (for managers/HR)
export function useExpensesQuery(filters?: { status?: string; employeeId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: expenseKeys.expenses(filters),
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          expense_categories(name, description),
          employees(first_name, last_name, employee_id)
        `);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      if (filters?.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as any; // Type assertion for complex joined query
    },
  });
}

// Submit new expense
export function useSubmitExpenseMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert([{
          ...data,
          expense_number: '', // Will be auto-generated by trigger
        }])
        .select('*')
        .single();

      if (error) throw error;
      // Fetch related display fields without ambiguous embedding
      const [{ data: employee }, { data: category }] = await Promise.all([
        supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('id', expense.employee_id)
          .maybeSingle(),
        supabase
          .from('expense_categories')
          .select('name')
          .eq('id', expense.category_id)
          .maybeSingle(),
      ]);

      return { ...expense, employees: employee, expense_categories: category } as any;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast({
        title: "Success",
        description: "Expense submitted successfully!",
      });
      
      // Create notification
      const employee = data.employees as any;
      const category = data.expense_categories as any;
      const employeeName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
      
      // Dispatch custom event for notification
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: {
          title: 'New Expense Request',
          message: `${employeeName} submitted an expense claim for ${category?.name || 'expense'}`,
          type: 'expense_request',
          employeeName,
          requestId: data.id,
        }
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit expense. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Update expense status (for approvals/rejections)
export function useUpdateExpenseStatusMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      comments, 
      rejectionReason 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      comments?: string;
      rejectionReason?: string;
    }) => {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approval_comments = comments;
      } else if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast({
        title: "Success",
        description: `Expense ${variables.status} successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Get expense statistics
export function useExpenseStatsQuery(employeeId?: string) {
  return useQuery({
    queryKey: [...expenseKeys.all, 'stats', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('expenses')
        .select('status, amount')
        .eq('employee_id', employeeId)
        .gte('expense_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('expense_date', lastDayOfMonth.toISOString().split('T')[0]);

      if (error) throw error;

      const stats = {
        total: data.reduce((sum, expense) => sum + expense.amount, 0),
        pending: data.filter(e => e.status === 'pending').length,
        approved: data.filter(e => e.status === 'approved').length,
        rejected: data.filter(e => e.status === 'rejected').length,
      };

      return stats;
    },
    enabled: !!employeeId,
  });
}

// Cache invalidation helper
export function useInvalidateExpenses() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: expenseKeys.categories() }),
    invalidateMyExpenses: (employeeId?: string) => 
      queryClient.invalidateQueries({ queryKey: expenseKeys.myExpenses(employeeId) }),
    invalidateExpense: (id: string) => 
      queryClient.invalidateQueries({ queryKey: expenseKeys.expense(id) }),
  };
}
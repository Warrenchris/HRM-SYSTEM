import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, FileText, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingExpense {
  id: string;
  expense_number: string;
  employee_name: string;
  employee_avatar?: string;
  expense_date: string;
  category_name: string;
  title: string;
  description: string;
  amount: number;
  merchant: string;
  submitted_at: string;
  receipt_urls: string[];
}

export function ExpenseApprovals() {
  const [selectedExpense, setSelectedExpense] = useState<PendingExpense | null>(null);
  const [comment, setComment] = useState("");
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      
      // First get expenses with basic data
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          employee_id,
          category_id,
          expense_number,
          title,
          description,
          amount,
          expense_date,
          merchant,
          submitted_at,
          receipt_urls
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (expensesError) throw expensesError;

      if (!expensesData || expensesData.length === 0) {
        setPendingExpenses([]);
        return;
      }

      // Get employee details
      const employeeIds = expensesData.map(expense => expense.employee_id);
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, passport_photo_url')
        .in('id', employeeIds);

      if (employeesError) throw employeesError;

      // Get category details
      const categoryIds = expensesData.map(expense => expense.category_id);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('id, name')
        .in('id', categoryIds);

      if (categoriesError) throw categoriesError;

      // Combine the data
      const formattedExpenses: PendingExpense[] = expensesData.map(expense => {
        const employee = employeesData?.find(emp => emp.id === expense.employee_id);
        const category = categoriesData?.find(cat => cat.id === expense.category_id);
        
        return {
          id: expense.id,
          expense_number: expense.expense_number,
          employee_name: employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 'Unknown Employee',
          employee_avatar: employee?.passport_photo_url || '',
          expense_date: expense.expense_date,
          category_name: category?.name || 'Other',
          title: expense.title,
          description: expense.description || '',
          amount: Number(expense.amount),
          merchant: expense.merchant || '',
          submitted_at: new Date(expense.submitted_at).toLocaleString(),
          receipt_urls: Array.isArray(expense.receipt_urls) ? expense.receipt_urls as string[] : []
        };
      });

      setPendingExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load pending expenses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: string, expenseNumber: string) => {
    try {
      setProcessing(expenseId);
      
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approval_comments: comment || null
        })
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Expense Approved",
        description: `Expense ${expenseNumber} has been approved successfully.`,
      });

      // Refresh the list and close dialog
      await fetchPendingExpenses();
      setSelectedExpense(null);
      setComment("");
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (expenseId: string, expenseNumber: string) => {
    try {
      setProcessing(expenseId);
      
      if (!comment.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this expense.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: comment
        })
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Expense Rejected",
        description: `Expense ${expenseNumber} has been rejected.`,
        variant: "destructive"
      });

      // Refresh the list and close dialog
      await fetchPendingExpenses();
      setSelectedExpense(null);
      setComment("");
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: "Error",
        description: "Failed to reject expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          Review and approve expense claims submitted by team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading pending expenses...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Expense ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={expense.employee_avatar} />
                          <AvatarFallback>
                            {expense.employee_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{expense.employee_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{expense.expense_number}</TableCell>
                    <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category_name}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.title}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.submitted_at}
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedExpense(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Expense Details - {selectedExpense?.expense_number}</DialogTitle>
                            <DialogDescription>
                              Review the expense claim details and attachments
                            </DialogDescription>
                          </DialogHeader>
                          {selectedExpense && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Employee</Label>
                                  <p className="text-sm">{selectedExpense.employee_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Amount</Label>
                                  <p className="text-sm font-semibold">${selectedExpense.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <p className="text-sm">{selectedExpense.category_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Merchant</Label>
                                  <p className="text-sm">{selectedExpense.merchant || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Date</Label>
                                  <p className="text-sm">{new Date(selectedExpense.expense_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Submitted</Label>
                                  <p className="text-sm">{selectedExpense.submitted_at}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Title</Label>
                                <p className="text-sm mt-1 font-medium">{selectedExpense.title}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm mt-1">{selectedExpense.description || 'No description provided'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Receipts</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {selectedExpense.receipt_urls.length > 0 ? (
                                    selectedExpense.receipt_urls.map((receipt, index) => (
                                      <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">{receipt}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No receipts uploaded</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="comment">Comments {processing === selectedExpense.id && '(Required for rejection)'}</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="Add any comments for the employee..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => handleReject(selectedExpense?.id!, selectedExpense?.expense_number!)}
                              disabled={processing === selectedExpense?.id}
                            >
                              {processing === selectedExpense?.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleApprove(selectedExpense?.id!, selectedExpense?.expense_number!)}
                              disabled={processing === selectedExpense?.id}
                            >
                              {processing === selectedExpense?.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(expense.id, expense.expense_number)}
                        disabled={processing === expense.id}
                      >
                        {processing === expense.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(expense.id, expense.expense_number)}
                        disabled={processing === expense.id}
                      >
                        {processing === expense.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!loading && pendingExpenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending expense approvals at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
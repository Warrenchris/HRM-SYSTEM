import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Download, Search, Filter } from "lucide-react";
import { useMyExpensesQuery } from "@/hooks/queries/useExpenseQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { format } from "date-fns";

interface ExpenseHistoryProps {
  limit?: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function ExpenseHistory({ limit }: ExpenseHistoryProps) {
  const { employee } = useCurrentEmployee();
  const { data: expenses = [], isLoading } = useMyExpensesQuery(employee?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredExpenses = expenses
    .filter(expense => {
      if (!expense) return false;
      const matchesSearch = (expense.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (expense.merchant?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading expenses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense History</CardTitle>
        <CardDescription>
          Track and manage your submitted expense claims
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!limit && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                {!limit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.expense_number}</TableCell>
                  <TableCell>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{expense.expense_categories?.name || 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.title}
                  </TableCell>
                  <TableCell>{expense.merchant || 'N/A'}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  {!limit && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {!limit && filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No expenses found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
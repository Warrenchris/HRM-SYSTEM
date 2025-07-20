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

interface ExpenseHistoryProps {
  limit?: number;
}

const mockExpenses = [
  {
    id: "EXP-001",
    date: "2024-01-15",
    category: "Travel",
    description: "Business trip to Chicago",
    amount: 450.00,
    status: "approved",
    merchant: "Delta Airlines",
    approvedBy: "Sarah Johnson"
  },
  {
    id: "EXP-002",
    date: "2024-01-14",
    category: "Meals",
    description: "Client dinner meeting",
    amount: 89.50,
    status: "pending",
    merchant: "The Steakhouse",
    approvedBy: null
  },
  {
    id: "EXP-003",
    date: "2024-01-12",
    category: "Office Supplies",
    description: "Office equipment and supplies",
    amount: 125.75,
    status: "approved",
    merchant: "Office Depot",
    approvedBy: "Mike Wilson"
  },
  {
    id: "EXP-004",
    date: "2024-01-10",
    category: "Technology",
    description: "Software subscription renewal",
    amount: 99.00,
    status: "rejected",
    merchant: "Adobe",
    approvedBy: "Sarah Johnson"
  },
  {
    id: "EXP-005",
    date: "2024-01-08",
    category: "Travel",
    description: "Taxi to airport",
    amount: 35.00,
    status: "approved",
    merchant: "Uber",
    approvedBy: "Mike Wilson"
  }
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredExpenses = mockExpenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .slice(0, limit);

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
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.id}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell>{expense.merchant}</TableCell>
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
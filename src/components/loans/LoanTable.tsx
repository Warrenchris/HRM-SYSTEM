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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Download, Search, Calculator, CreditCard } from "lucide-react";

interface LoanTableProps {
  limit?: number;
}

const mockLoans = [
  {
    id: "LOAN-001",
    type: "Personal Loan",
    amount: 150000,
    disbursedDate: "2023-12-01",
    tenure: 24,
    interestRate: 12,
    monthlyEmi: 7065,
    outstandingBalance: 98000,
    nextDueDate: "2024-02-01",
    status: "active"
  },
  {
    id: "LOAN-002",
    type: "Emergency Loan",
    amount: 35000,
    disbursedDate: "2024-01-15",
    tenure: 12,
    interestRate: 8,
    monthlyEmi: 3128,
    outstandingBalance: 31872,
    nextDueDate: "2024-02-15",
    status: "active"
  },
  {
    id: "LOAN-003",
    type: "Salary Advance",
    amount: 20000,
    disbursedDate: "2024-01-10",
    tenure: 3,
    interestRate: 0,
    monthlyEmi: 6667,
    outstandingBalance: 13333,
    nextDueDate: "2024-02-10",
    status: "active"
  },
  {
    id: "LOAN-004",
    type: "Personal Loan",
    amount: 200000,
    disbursedDate: "2023-06-01",
    tenure: 36,
    interestRate: 12,
    monthlyEmi: 6645,
    outstandingBalance: 0,
    nextDueDate: null,
    status: "completed"
  },
  {
    id: "LOAN-005",
    type: "Equipment Loan",
    amount: 80000,
    disbursedDate: "2023-11-01",
    tenure: 18,
    interestRate: 10,
    monthlyEmi: 4889,
    outstandingBalance: 63111,
    nextDueDate: "2024-02-01",
    status: "active"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Completed</Badge>;
    case "overdue":
      return <Badge variant="destructive">Overdue</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function LoanTable({ limit }: LoanTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  const filteredLoans = mockLoans
    .filter(loan => {
      const matchesSearch = loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loan.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .slice(0, limit);

  const calculateProgress = (loan: any) => {
    const totalAmount = loan.amount;
    const paidAmount = totalAmount - loan.outstandingBalance;
    return (paidAmount / totalAmount) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Portfolio</CardTitle>
        <CardDescription>
          Manage and track your loan applications and repayments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!limit && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Monthly EMI</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                {!limit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{loan.type}</p>
                      <p className="text-sm text-muted-foreground">{loan.interestRate}% p.a.</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    KSh {loan.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    KSh {loan.monthlyEmi.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="font-medium">KSh {loan.outstandingBalance.toLocaleString()}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full" 
                          style={{ width: `${calculateProgress(loan)}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {loan.nextDueDate ? (
                      <div>
                        <p className="text-sm">{loan.nextDueDate}</p>
                        <p className="text-xs text-muted-foreground">Due in 5 days</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Completed</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  {!limit && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLoan(loan)}
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Loan Details - {loan?.id}</DialogTitle>
                              <DialogDescription>
                                Complete loan information and amortization schedule
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLoan && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Loan Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Loan Type:</span>
                                        <span>{selectedLoan.type}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Principal Amount:</span>
                                        <span>KSh {selectedLoan.amount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Interest Rate:</span>
                                        <span>{selectedLoan.interestRate}% p.a.</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tenure:</span>
                                        <span>{selectedLoan.tenure} months</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Disbursed Date:</span>
                                        <span>{selectedLoan.disbursedDate}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Repayment Status</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Monthly EMI:</span>
                                        <span className="font-medium">KSh {selectedLoan.monthlyEmi.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Outstanding Balance:</span>
                                        <span className="font-medium text-red-600">KSh {selectedLoan.outstandingBalance.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Paid Amount:</span>
                                        <span className="font-medium text-green-600">KSh {(selectedLoan.amount - selectedLoan.outstandingBalance).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Progress:</span>
                                        <span>{Math.round(calculateProgress(selectedLoan))}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Next Due Date:</span>
                                        <span>{selectedLoan.nextDueDate || "Completed"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-4">
                                  <div className="flex justify-between space-x-4">
                                    <Button variant="outline">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Statement
                                    </Button>
                                    <Button>
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Make Payment
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
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
        
        {!limit && filteredLoans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No loans found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
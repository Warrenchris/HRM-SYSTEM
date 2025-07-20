import { useState } from "react";
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
import { Check, X, Eye, Calculator, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pendingLoans = [
  {
    id: "LOAN-APP-006",
    employeeName: "James Kiprotich",
    employeeId: "EMP-023",
    employeeAvatar: "",
    loanType: "Personal Loan",
    requestedAmount: 180000,
    purpose: "Home renovation and furniture purchase",
    tenure: 30,
    interestRate: 12,
    monthlyEmi: 6508,
    guarantor: "Sarah Muthoni (EMP-015)",
    appliedDate: "2024-01-18",
    basicSalary: 85000,
    netSalary: 62500
  },
  {
    id: "LOAN-APP-007",
    employeeName: "Grace Waweru",
    employeeId: "EMP-031",
    employeeAvatar: "",
    loanType: "Emergency Loan",
    requestedAmount: 40000,
    purpose: "Medical emergency for family member",
    tenure: 12,
    interestRate: 8,
    monthlyEmi: 3567,
    guarantor: "Peter Otieno (EMP-018)",
    appliedDate: "2024-01-20",
    basicSalary: 65000,
    netSalary: 48750
  },
  {
    id: "LOAN-APP-008",
    employeeName: "Michael Ochieng",
    employeeId: "EMP-042",
    employeeAvatar: "",
    loanType: "Equipment Loan",
    requestedAmount: 120000,
    purpose: "Laptop and development tools for remote work",
    tenure: 24,
    interestRate: 10,
    monthlyEmi: 5507,
    guarantor: "David Kipkoech (EMP-025)",
    appliedDate: "2024-01-19",
    basicSalary: 95000,
    netSalary: 71250
  }
];

export function LoanApprovals() {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApprove = (loanId: string) => {
    toast({
      title: "Loan Approved",
      description: `Loan application ${loanId} has been approved and will be disbursed within 2 business days.`,
    });
  };

  const handleReject = (loanId: string) => {
    toast({
      title: "Loan Rejected",
      description: `Loan application ${loanId} has been rejected. The employee will be notified.`,
      variant: "destructive"
    });
  };

  const calculateDebtToIncomeRatio = (emi: number, netSalary: number) => {
    return ((emi / netSalary) * 100).toFixed(1);
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio <= 30) return { level: "Low", color: "text-green-600" };
    if (ratio <= 50) return { level: "Medium", color: "text-yellow-600" };
    return { level: "High", color: "text-red-600" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Approvals</CardTitle>
        <CardDescription>
          Review and approve loan applications from employees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Monthly EMI</TableHead>
                <TableHead>Debt Ratio</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingLoans.map((loan) => {
                const debtRatio = parseFloat(calculateDebtToIncomeRatio(loan.monthlyEmi, loan.netSalary));
                const risk = getRiskLevel(debtRatio);
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={loan.employeeAvatar} />
                          <AvatarFallback>
                            {loan.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{loan.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{loan.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{loan.loanType}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {loan.requestedAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      KSh {loan.monthlyEmi.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`font-medium ${risk.color}`}>{debtRatio}%</p>
                        <p className={`text-xs ${risk.color}`}>{risk.level} Risk</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {loan.appliedDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLoan(loan)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Loan Application Review - {loan?.id}</DialogTitle>
                              <DialogDescription>
                                Complete loan application details and risk assessment
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLoan && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Employee Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Name:</span>
                                        <span>{selectedLoan.employeeName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Employee ID:</span>
                                        <span>{selectedLoan.employeeId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Basic Salary:</span>
                                        <span>KSh {selectedLoan.basicSalary.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Net Salary:</span>
                                        <span>KSh {selectedLoan.netSalary.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Guarantor:</span>
                                        <span>{selectedLoan.guarantor}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Loan Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Loan Type:</span>
                                        <span>{selectedLoan.loanType}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Requested Amount:</span>
                                        <span>KSh {selectedLoan.requestedAmount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tenure:</span>
                                        <span>{selectedLoan.tenure} months</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Interest Rate:</span>
                                        <span>{selectedLoan.interestRate}% p.a.</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Monthly EMI:</span>
                                        <span className="font-medium">KSh {selectedLoan.monthlyEmi.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Purpose</h4>
                                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedLoan.purpose}</p>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                                    <p className={`text-lg font-bold ${getRiskLevel(parseFloat(calculateDebtToIncomeRatio(selectedLoan.monthlyEmi, selectedLoan.netSalary))).color}`}>
                                      {calculateDebtToIncomeRatio(selectedLoan.monthlyEmi, selectedLoan.netSalary)}%
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Risk Level</p>
                                    <p className={`text-lg font-bold ${getRiskLevel(parseFloat(calculateDebtToIncomeRatio(selectedLoan.monthlyEmi, selectedLoan.netSalary))).color}`}>
                                      {getRiskLevel(parseFloat(calculateDebtToIncomeRatio(selectedLoan.monthlyEmi, selectedLoan.netSalary))).level}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Remaining Salary</p>
                                    <p className="text-lg font-bold">
                                      KSh {(selectedLoan.netSalary - selectedLoan.monthlyEmi).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="comment">Approval Comments</Label>
                                  <Textarea
                                    id="comment"
                                    placeholder="Add comments regarding the loan approval/rejection..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => handleReject(selectedLoan?.id)}>
                                <X className="h-4 w-4 mr-2" />
                                Reject Application
                              </Button>
                              <Button onClick={() => handleApprove(selectedLoan?.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approve Loan
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(loan.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(loan.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {pendingLoans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending loan applications at this time.</p>
          </div>
        )}
        
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Approval Guidelines</h4>
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div>
              <p className="font-medium text-green-600">Low Risk (≤30%)</p>
              <p className="text-muted-foreground">Auto-approve eligible</p>
            </div>
            <div>
              <p className="font-medium text-yellow-600">Medium Risk (31-50%)</p>
              <p className="text-muted-foreground">Requires review</p>
            </div>
            <div>
              <p className="font-medium text-red-600">High Risk (&gt;50%)</p>
              <p className="text-muted-foreground">Caution advised</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Calculator, FileText, CheckCircle, XCircle } from "lucide-react";

const loanApplications = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeId: "EMP001",
    amount: 10000,
    purpose: "Home Improvement",
    isMember: true,
    interestRate: 5.0,
    tenure: 24,
    emi: 439.31,
    status: "pending",
    appliedDate: "2024-01-15"
  },
  {
    id: "2",
    employeeName: "Sarah Wilson",
    employeeId: "EMP004",
    amount: 5000,
    purpose: "Medical Emergency",
    isMember: false,
    interestRate: 6.0,
    tenure: 12,
    emi: 430.33,
    status: "approved",
    appliedDate: "2024-01-10"
  },
  {
    id: "3",
    employeeName: "Mike Chen",
    employeeId: "EMP005",
    amount: 15000,
    purpose: "Education",
    isMember: true,
    interestRate: 5.0,
    tenure: 36,
    emi: 449.22,
    status: "active",
    appliedDate: "2023-12-20"
  }
];

export function WelfareLoans() {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("");
  const [calculatedEMI, setCalculatedEMI] = useState(0);

  const calculateEMI = () => {
    if (!loanAmount || !loanTenure || !membershipStatus) return;
    
    const principal = parseFloat(loanAmount);
    const rate = membershipStatus === "member" ? 5 : 6;
    const tenure = parseInt(loanTenure);
    
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    setCalculatedEMI(emi);
  };

  const handleLoanApplication = () => {
    if (!selectedEmployee || !loanAmount || !loanPurpose || !loanTenure || !membershipStatus) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Loan Application Submitted",
      description: `Loan application for $${loanAmount} submitted successfully`,
    });

    // Reset form
    setSelectedEmployee("");
    setLoanAmount("");
    setLoanPurpose("");
    setLoanTenure("");
    setMembershipStatus("");
    setCalculatedEMI(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMembershipBadge = (isMember: boolean) => {
    return isMember ? 
      <Badge variant="secondary" className="bg-green-100 text-green-800">Member (5%)</Badge> :
      <Badge variant="outline">Non-Member (6%)</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welfare Loans</h2>
          <p className="text-muted-foreground">Manage welfare loans with preferential rates for members</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Welfare Loan Application</DialogTitle>
              <DialogDescription>
                Apply for a welfare loan with competitive interest rates
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">John Doe (EMP001)</SelectItem>
                    <SelectItem value="EMP002">Jane Smith (EMP002)</SelectItem>
                    <SelectItem value="EMP003">Bob Johnson (EMP003)</SelectItem>
                    <SelectItem value="EMP004">Sarah Wilson (EMP004)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership">Membership Status</Label>
                <Select value={membershipStatus} onValueChange={(value) => {
                  setMembershipStatus(value);
                  calculateEMI();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Welfare Member (5% APR)</SelectItem>
                    <SelectItem value="non-member">Non-Member (6% APR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter loan amount"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(e.target.value);
                    calculateEMI();
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Loan Tenure (months)</Label>
                <Select value={loanTenure} onValueChange={(value) => {
                  setLoanTenure(value);
                  calculateEMI();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="home">Home Improvement</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {calculatedEMI > 0 && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">Monthly EMI</div>
                      <div className="text-2xl font-bold text-primary">${calculatedEMI.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Interest Rate: {membershipStatus === "member" ? "5%" : "6%"} per annum
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setSelectedEmployee("");
                setLoanAmount("");
                setLoanPurpose("");
                setLoanTenure("");
                setMembershipStatus("");
                setCalculatedEMI(0);
              }}>
                Cancel
              </Button>
              <Button onClick={handleLoanApplication}>Submit Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Member Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-semibold text-green-600">5% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold text-green-600">Waived</span>
              </div>
              <div className="flex justify-between">
                <span>Max Amount:</span>
                <span className="font-semibold">$50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Max Tenure:</span>
                <span className="font-semibold">36 months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              Non-Member Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-semibold">6% APR</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold">2% of loan</span>
              </div>
              <div className="flex justify-between">
                <span>Max Amount:</span>
                <span className="font-semibold">$30,000</span>
              </div>
              <div className="flex justify-between">
                <span>Max Tenure:</span>
                <span className="font-semibold">24 months</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications & Active Loans</CardTitle>
          <CardDescription>Manage loan applications and track active loans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>EMI</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanApplications.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{loan.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{loan.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>${loan.amount.toLocaleString()}</TableCell>
                  <TableCell>{loan.purpose}</TableCell>
                  <TableCell>{getMembershipBadge(loan.isMember)}</TableCell>
                  <TableCell>${loan.emi.toFixed(2)}</TableCell>
                  <TableCell>{loan.tenure} months</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>{loan.appliedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "Loan Details",
                          description: `Viewing details for ${loan.employeeName}'s loan`,
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {loan.status === "pending" && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast({
                              title: "Loan Approved",
                              description: `Loan for ${loan.employeeName} has been approved`,
                            })}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast({
                              title: "Loan Rejected",
                              description: `Loan for ${loan.employeeName} has been rejected`,
                              variant: "destructive",
                            })}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
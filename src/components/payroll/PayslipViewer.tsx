import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Download, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const samplePayslips = [
  {
    id: "PAY-2024-001",
    employeeId: "EMP001",
    employeeName: "John Doe",
    period: "January 2024",
    grossSalary: 160000,
    netSalary: 129090,
    status: "Generated",
    generatedDate: "2024-01-31"
  },
  {
    id: "PAY-2024-002",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    period: "January 2024",
    grossSalary: 117000,
    netSalary: 96285,
    status: "Generated",
    generatedDate: "2024-01-31"
  },
  {
    id: "PAY-2024-003",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    period: "January 2024",
    grossSalary: 111500,
    netSalary: 91997,
    status: "Draft",
    generatedDate: "2024-01-31"
  }
];

const payslipDetails = {
  employee: {
    name: "John Doe",
    id: "EMP001",
    department: "Engineering",
    position: "Senior Developer",
    bankAccount: "****1234"
  },
  period: "January 2024",
  earnings: {
    basicSalary: 120000,
    houseAllowance: 15000,
    transportAllowance: 8000,
    medicalAllowance: 5000,
    overtime: 12000
  },
  deductions: {
    paye: 25600,
    nssf: 2160,
    shif: 750,
    housingLevy: 2400,
    loan: 5000
  },
  grossSalary: 160000,
  totalDeductions: 35910,
  netSalary: 129090
};

export function PayslipViewer() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [viewingPayslip, setViewingPayslip] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadPayslip = (payslipId: string) => {
    toast({
      title: "Downloading Payslip",
      description: `Payslip ${payslipId} is being downloaded as PDF.`,
    });
  };

  const handlePrintPayslip = (payslipId: string) => {
    toast({
      title: "Printing Payslip",
      description: `Payslip ${payslipId} is being sent to printer.`,
    });
  };

  const handleEmailPayslip = (payslipId: string) => {
    toast({
      title: "Sending Payslip",
      description: `Payslip ${payslipId} has been emailed to the employee.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payslip Viewer</h2>
          <p className="text-muted-foreground">View and manage employee payslips</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              <SelectItem value="EMP001">John Doe</SelectItem>
              <SelectItem value="EMP002">Jane Smith</SelectItem>
              <SelectItem value="EMP003">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Payslips</CardTitle>
          <CardDescription>
            View and manage payslips for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payslip ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePayslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">{payslip.id}</TableCell>
                  <TableCell>{payslip.employeeName}</TableCell>
                  <TableCell>{payslip.period}</TableCell>
                  <TableCell>KSh {payslip.grossSalary.toLocaleString()}</TableCell>
                  <TableCell>KSh {payslip.netSalary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={payslip.status === "Generated" ? "default" : "secondary"}>
                      {payslip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setViewingPayslip(payslip.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Payslip Details - {payslip.id}</DialogTitle>
                            <DialogDescription>
                              Detailed payslip for {payslip.employeeName} - {payslip.period}
                            </DialogDescription>
                          </DialogHeader>
                          <PayslipDetailsView />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(payslip.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePrintPayslip(payslip.id)}>
                        <Printer className="h-4 w-4" />
                      </Button>
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

function PayslipDetailsView() {
  return (
    <div className="space-y-6 p-6 bg-white">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold">COMPANY NAME</h1>
        <p className="text-muted-foreground">Payslip for {payslipDetails.period}</p>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Employee Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {payslipDetails.employee.name}</p>
            <p><strong>Employee ID:</strong> {payslipDetails.employee.id}</p>
            <p><strong>Department:</strong> {payslipDetails.employee.department}</p>
            <p><strong>Position:</strong> {payslipDetails.employee.position}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Period:</strong> {payslipDetails.period}</p>
            <p><strong>Bank Account:</strong> {payslipDetails.employee.bankAccount}</p>
            <p><strong>Pay Date:</strong> 31/01/2024</p>
          </div>
        </div>
      </div>

      {/* Earnings and Deductions */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-green-700">Earnings</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (KSh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Basic Salary</TableCell>
                <TableCell className="text-right">{payslipDetails.earnings.basicSalary.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>House Allowance</TableCell>
                <TableCell className="text-right">{payslipDetails.earnings.houseAllowance.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Transport Allowance</TableCell>
                <TableCell className="text-right">{payslipDetails.earnings.transportAllowance.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Medical Allowance</TableCell>
                <TableCell className="text-right">{payslipDetails.earnings.medicalAllowance.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overtime</TableCell>
                <TableCell className="text-right">{payslipDetails.earnings.overtime.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Total Earnings</TableCell>
                <TableCell className="text-right">{payslipDetails.grossSalary.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-red-700">Deductions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (KSh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>PAYE</TableCell>
                <TableCell className="text-right">{payslipDetails.deductions.paye.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>NSSF</TableCell>
                <TableCell className="text-right">{payslipDetails.deductions.nssf.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SHIF</TableCell>
                <TableCell className="text-right">{payslipDetails.deductions.shif.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Housing Levy</TableCell>
                <TableCell className="text-right">{payslipDetails.deductions.housingLevy.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loan Repayment</TableCell>
                <TableCell className="text-right">{payslipDetails.deductions.loan.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right">{payslipDetails.totalDeductions.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Net Salary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Net Salary:</span>
          <span className="text-green-600">KSh {payslipDetails.netSalary.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
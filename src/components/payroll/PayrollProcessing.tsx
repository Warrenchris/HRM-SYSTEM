import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Play, CheckCircle, AlertTriangle, DollarSign, Download, FileText, CreditCard, Calculator, Users, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const payrollSteps = [
  { id: 1, name: "Import Attendance", status: "completed", description: "Attendance data imported successfully" },
  { id: 2, name: "Calculate Earnings", status: "completed", description: "Basic salary and allowances calculated" },
  { id: 3, name: "Apply Deductions", status: "completed", description: "Statutory deductions processed" },
  { id: 4, name: "Review & Approve", status: "completed", description: "Management approved" },
  { id: 5, name: "Generate Payslips", status: "ready", description: "Ready to generate individual payslips" },
  { id: 6, name: "Process Payments", status: "pending", description: "Bank transfers to be initiated" }
];

const employeePayrollData = [
  {
    id: "EMP001",
    name: "John Doe",
    department: "Engineering",
    basicSalary: 120000,
    allowances: { house: 15000, transport: 8000, medical: 5000 },
    overtime: 12000,
    grossSalary: 160000,
    deductions: { paye: 25600, nssf: 2160, shif: 750, housingLevy: 2400 },
    netSalary: 129090,
    bankAccount: "****1234",
    approved: true
  },
  {
    id: "EMP002", 
    name: "Jane Smith",
    department: "Design",
    basicSalary: 95000,
    allowances: { house: 12000, transport: 6000, medical: 4000 },
    overtime: 0,
    grossSalary: 117000,
    deductions: { paye: 16200, nssf: 2160, shif: 600, housingLevy: 1755 },
    netSalary: 96285,
    bankAccount: "****5678",
    approved: true
  },
  {
    id: "EMP003",
    name: "Mike Johnson", 
    department: "Marketing",
    basicSalary: 85000,
    allowances: { house: 10000, transport: 5000, medical: 3500 },
    overtime: 8000,
    grossSalary: 111500,
    deductions: { paye: 15120, nssf: 2160, shif: 550, housingLevy: 1673 },
    netSalary: 91997,
    bankAccount: "****9012",
    approved: false
  }
];

const payrollSummary = {
  totalEmployees: 48,
  totalGross: 2850000,
  totalPaye: 456000,
  totalNssf: 142500,
  totalShif: 76800,
  totalHousingLevy: 42750,
  totalOtherDeductions: 96250,
  totalNet: 2035750,
  approvedEmployees: 45,
  pendingApprovals: 3
};

export function PayrollProcessing() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [payrollPeriod, setPayrollPeriod] = useState("monthly");
  const [currentStep, setCurrentStep] = useState(5);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(employeePayrollData.map(emp => emp.id));
  const [isGeneratingPayslips, setIsGeneratingPayslips] = useState(false);
  const [isProcessingPayments, setIsProcessingPayments] = useState(false);
  const [showPayslipPreview, setShowPayslipPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const getStepIcon = (step: any) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "ready":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "in-progress":
        return <Play className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "pending":
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleGeneratePayslips = async () => {
    setIsGeneratingPayslips(true);
    
    // Simulate payslip generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Payslips Generated Successfully",
      description: `Generated ${selectedEmployees.length} payslips for January 2024.`,
    });
    
    setIsGeneratingPayslips(false);
    setCurrentStep(6);
  };

  const handleProcessPayments = async () => {
    setIsProcessingPayments(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Payments Processed",
      description: `KSh ${payrollSummary.totalNet.toLocaleString()} transferred to ${selectedEmployees.length} employees.`,
    });
    
    setIsProcessingPayments(false);
  };

  const handleExportPayslips = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting payslips in ${format.toUpperCase()} format...`,
    });
  };

  const handleBulkApproval = () => {
    toast({
      title: "Bulk Approval Completed",
      description: `Approved payroll for ${selectedEmployees.length} employees.`,
    });
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const progressPercentage = (currentStep / payrollSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {payrollSummary.approvedEmployees} approved, {payrollSummary.pendingApprovals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {payrollSummary.totalGross.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KSh {(payrollSummary.totalPaye + payrollSummary.totalNssf + payrollSummary.totalShif + payrollSummary.totalHousingLevy).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tax & statutory deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KSh {payrollSummary.totalNet.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              To be paid out
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Configuration</CardTitle>
            <CardDescription>
              Set up the payroll period and processing date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payroll Period</label>
              <Select value={payrollPeriod} onValueChange={setPayrollPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
            <CardDescription>
              Current payroll processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} />
              </div>
              
              <div className="space-y-3">
                {payrollSteps.slice(0, 3).map((step) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Selection and Payslip Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Employee Payroll Review
          </CardTitle>
          <CardDescription>
            Review and approve individual employee payroll before generating payslips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedEmployees.length === employeePayrollData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEmployees(employeePayrollData.map(emp => emp.id));
                    } else {
                      setSelectedEmployees([]);
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  Select All ({selectedEmployees.length} of {employeePayrollData.length} selected)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkApproval}>
                  Bulk Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportPayslips('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePayrollData.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee.id} • {employee.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">KSh {employee.grossSalary.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Basic: KSh {employee.basicSalary.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>PAYE: KSh {employee.deductions.paye.toLocaleString()}</div>
                          <div>NSSF: KSh {employee.deductions.nssf.toLocaleString()}</div>
                          <div>Other: KSh {(employee.deductions.shif + employee.deductions.housingLevy).toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          KSh {employee.netSalary.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.bankAccount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.approved ? "default" : "secondary"}>
                          {employee.approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowPayslipPreview(employee.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Payslip Preview - {employee.name}</DialogTitle>
                                <DialogDescription>
                                  January 2024 payslip for {employee.name} ({employee.id})
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Earnings</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Basic Salary:</span>
                                        <span>KSh {employee.basicSalary.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>House Allowance:</span>
                                        <span>KSh {employee.allowances.house.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Transport Allowance:</span>
                                        <span>KSh {employee.allowances.transport.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Medical Allowance:</span>
                                        <span>KSh {employee.allowances.medical.toLocaleString()}</span>
                                      </div>
                                      {employee.overtime > 0 && (
                                        <div className="flex justify-between">
                                          <span>Overtime:</span>
                                          <span>KSh {employee.overtime.toLocaleString()}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-medium border-t pt-1">
                                        <span>Gross Salary:</span>
                                        <span>KSh {employee.grossSalary.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Deductions</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>PAYE Tax:</span>
                                        <span>KSh {employee.deductions.paye.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>NSSF:</span>
                                        <span>KSh {employee.deductions.nssf.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>SHIF:</span>
                                        <span>KSh {employee.deductions.shif.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Housing Levy:</span>
                                        <span>KSh {employee.deductions.housingLevy.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-medium border-t pt-1">
                                        <span>Total Deductions:</span>
                                        <span>KSh {Object.values(employee.deductions).reduce((sum, val) => sum + val, 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-green-600 border-t pt-1">
                                        <span>Net Salary:</span>
                                        <span>KSh {employee.netSalary.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Generation
          </CardTitle>
          <CardDescription>
            Generate and distribute payslips for selected employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Ready to Generate Payslips</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All calculations completed. {selectedEmployees.length} employees selected for payslip generation.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Generation Options</h4>
                <p className="text-sm text-muted-foreground">Choose format and delivery method</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleGeneratePayslips()}
                  disabled={isGeneratingPayslips || selectedEmployees.length === 0}
                  className="animate-fade-in"
                >
                  {isGeneratingPayslips ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Payslips
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleExportPayslips('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Processing
          </CardTitle>
          <CardDescription>
            Process bank transfers and finalize payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Net Amount:</span>
                    <span className="font-medium">KSh {payrollSummary.totalNet.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Transfers:</span>
                    <span className="font-medium">{selectedEmployees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Date:</span>
                    <span className="font-medium">{format(selectedDate, "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-medium">KSh 2,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Method:</span>
                    <span className="font-medium">RTGS/EFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Completion:</span>
                    <span className="font-medium">Same Day</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button variant="outline">
                Download Bank File
              </Button>
              <Button 
                onClick={handleProcessPayments}
                disabled={isProcessingPayments || currentStep < 5}
                className="animate-fade-in"
              >
                {isProcessingPayments ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payments...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process All Payments
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
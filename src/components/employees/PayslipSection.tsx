import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const myPayslips = [
  {
    id: "PAY-2024-001",
    period: "January 2024",
    grossSalary: 160000,
    netSalary: 129090,
    status: "Available",
    generatedDate: "2024-01-31"
  },
  {
    id: "PAY-2023-012",
    period: "December 2023",
    grossSalary: 155000,
    netSalary: 125650,
    status: "Available",
    generatedDate: "2023-12-31"
  },
  {
    id: "PAY-2023-011",
    period: "November 2023",
    grossSalary: 160000,
    netSalary: 129090,
    status: "Available",
    generatedDate: "2023-11-30"
  }
];

const currentPayslipDetails = {
  employee: {
    name: "John Doe",
    id: "EMP001",
    department: "Engineering",
    position: "Senior Developer"
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

export function PayslipSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [isGeneratingPayslip, setIsGeneratingPayslip] = useState(false);
  const { toast } = useToast();

  const handleGeneratePayslip = async () => {
    setIsGeneratingPayslip(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGeneratingPayslip(false);
    toast({
      title: "Payslip Generated",
      description: `Your payslip for ${selectedPeriod} has been generated successfully.`,
    });
  };

  const handleDownloadPayslip = (payslipId: string) => {
    toast({
      title: "Downloading Payslip",
      description: `Payslip ${payslipId} is being downloaded as PDF.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Generate New Payslip */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Generate Payslip
          </CardTitle>
          <CardDescription>
            Generate your payslip for a specific period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2023-12">December 2023</SelectItem>
                  <SelectItem value="2023-11">November 2023</SelectItem>
                  <SelectItem value="2023-10">October 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGeneratePayslip}
              disabled={isGeneratingPayslip}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingPayslip ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payslips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            My Payslips
          </CardTitle>
          <CardDescription>
            View and download your recent payslips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myPayslips.map((payslip) => (
              <div key={payslip.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium">{payslip.period}</h4>
                    <Badge variant="default" className="text-xs">
                      {payslip.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Net Salary: KSh {payslip.netSalary.toLocaleString()} • Generated: {payslip.generatedDate}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Payslip Details - {payslip.period}</DialogTitle>
                        <DialogDescription>
                          Your detailed payslip breakdown
                        </DialogDescription>
                      </DialogHeader>
                      <PayslipDetailsView />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadPayslip(payslip.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
        <p className="text-muted-foreground">Payslip for {currentPayslipDetails.period}</p>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Employee Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {currentPayslipDetails.employee.name}</p>
            <p><strong>Employee ID:</strong> {currentPayslipDetails.employee.id}</p>
            <p><strong>Department:</strong> {currentPayslipDetails.employee.department}</p>
            <p><strong>Position:</strong> {currentPayslipDetails.employee.position}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Period:</strong> {currentPayslipDetails.period}</p>
            <p><strong>Pay Date:</strong> 31/01/2024</p>
            <p><strong>Payment Method:</strong> Bank Transfer</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            KSh {currentPayslipDetails.grossSalary.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Gross Salary</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            KSh {currentPayslipDetails.totalDeductions.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Deductions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            KSh {currentPayslipDetails.netSalary.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Net Salary</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-green-700">Earnings Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span>KSh {currentPayslipDetails.earnings.basicSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>House Allowance</span>
              <span>KSh {currentPayslipDetails.earnings.houseAllowance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport Allowance</span>
              <span>KSh {currentPayslipDetails.earnings.transportAllowance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Medical Allowance</span>
              <span>KSh {currentPayslipDetails.earnings.medicalAllowance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime</span>
              <span>KSh {currentPayslipDetails.earnings.overtime.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-red-700">Deductions Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>PAYE Tax</span>
              <span>KSh {currentPayslipDetails.deductions.paye.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>NSSF</span>
              <span>KSh {currentPayslipDetails.deductions.nssf.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIF</span>
              <span>KSh {currentPayslipDetails.deductions.shif.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Housing Levy</span>
              <span>KSh {currentPayslipDetails.deductions.housingLevy.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Loan Repayment</span>
              <span>KSh {currentPayslipDetails.deductions.loan.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
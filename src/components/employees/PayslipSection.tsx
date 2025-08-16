import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmployeePayslips, usePayslipDetail, useGeneratePayslip, useAvailablePayPeriods } from "@/hooks/queries/usePayrollQuery";
import { supabase } from "@/integrations/supabase/client";

export function PayslipSection() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch real data from backend
  const { data: payslips, isLoading: payslipsLoading } = useEmployeePayslips();
  const { data: availablePeriods, isLoading: periodsLoading } = useAvailablePayPeriods();
  const { data: selectedPayslip } = usePayslipDetail(selectedPayslipId || "");
  const generatePayslipMutation = useGeneratePayslip();

  const handleGeneratePayslip = async () => {
    if (!selectedPeriod) {
      toast({
        title: "Error",
        description: "Please select a pay period",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set pay date to last day of the selected month
      const [month, year] = selectedPeriod.split(' ');
      const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth();
      const payDate = new Date(parseInt(year), monthIndex + 1, 0).toISOString().split('T')[0];

      await generatePayslipMutation.mutateAsync({ period: selectedPeriod, payDate });
      setSelectedPeriod(""); // Reset selection
    } catch (error) {
      console.error('Error generating payslip:', error);
    }
  };

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      // For now, just show a toast. In a real implementation, this would generate and download a PDF
      toast({
        title: "Downloading Payslip",
        description: "Payslip is being prepared for download. This feature will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download payslip",
        variant: "destructive",
      });
    }
  };

  const handleViewPayslip = (payslipId: string) => {
    setSelectedPayslipId(payslipId);
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
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
                disabled={periodsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={periodsLoading ? "Loading periods..." : "Select period"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods?.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGeneratePayslip}
              disabled={generatePayslipMutation.isPending || !selectedPeriod || periodsLoading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {generatePayslipMutation.isPending ? "Generating..." : "Generate"}
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
          {payslipsLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading payslips...</div>
            </div>
          ) : payslips && payslips.length > 0 ? (
            <div className="space-y-3">
              {payslips.map((payslip) => (
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPayslip(payslip.id)}
                        >
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
                        {selectedPayslip && <PayslipDetailsView payslip={selectedPayslip} />}
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
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No payslips found</div>
              <div className="text-sm text-muted-foreground mt-1">
                Generate your first payslip using the form above
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface PayslipDetailsViewProps {
  payslip: any;
}

function PayslipDetailsView({ payslip }: PayslipDetailsViewProps) {
  if (!payslip) return <div>Loading payslip details...</div>;

  return (
    <div className="space-y-6 p-6 bg-white">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold">COMPANY NAME</h1>
        <p className="text-muted-foreground">Payslip for {payslip.pay_period}</p>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Employee Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Employee ID:</strong> {payslip.employee_id}</p>
            <p><strong>Pay Period:</strong> {payslip.pay_period}</p>
            <p><strong>Pay Date:</strong> {payslip.pay_date}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Status:</strong> {payslip.status}</p>
            <p><strong>Generated:</strong> {new Date(payslip.created_at).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> Bank Transfer</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            KSh {payslip.gross_salary?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-muted-foreground">Gross Salary</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            KSh {payslip.total_deductions?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-muted-foreground">Total Deductions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            KSh {payslip.net_salary?.toLocaleString() || '0'}
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
              <span>KSh {payslip.basic_salary?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Allowances</span>
              <span>KSh {payslip.allowances?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Pay</span>
              <span>KSh {payslip.overtime_pay?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-red-700">Deductions Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>PAYE Tax</span>
              <span>KSh {payslip.paye_tax?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>NSSF</span>
              <span>KSh {payslip.nssf_deduction?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIF</span>
              <span>KSh {payslip.shif_deduction?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Housing Levy</span>
              <span>KSh {payslip.housing_levy?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Deductions</span>
              <span>KSh {payslip.other_deductions?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
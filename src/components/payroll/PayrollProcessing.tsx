import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Play, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const payrollSteps = [
  { id: 1, name: "Import Attendance", status: "completed", description: "Attendance data imported successfully" },
  { id: 2, name: "Calculate Earnings", status: "completed", description: "Basic salary and allowances calculated" },
  { id: 3, name: "Apply Deductions", status: "in-progress", description: "Statutory deductions being processed" },
  { id: 4, name: "Review & Approve", status: "pending", description: "Awaiting management approval" },
  { id: 5, name: "Generate Payslips", status: "pending", description: "Individual payslips to be generated" },
  { id: 6, name: "Process Payments", status: "pending", description: "Bank transfers to be initiated" }
];

const payrollSummary = {
  totalEmployees: 48,
  totalGross: 2850000,
  totalPaye: 456000,
  totalNssf: 142500,
  totalShif: 76800,
  totalHousingLevy: 42750,
  totalOtherDeductions: 96250,
  totalNet: 2035750
};

export function PayrollProcessing() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [payrollPeriod, setPayrollPeriod] = useState("monthly");
  const [currentStep, setCurrentStep] = useState(3);
  const { toast } = useToast();

  const getStepIcon = (step: any) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleProcessStep = () => {
    if (currentStep < payrollSteps.length) {
      setCurrentStep(currentStep + 1);
      toast({
        title: "Step Completed",
        description: `${payrollSteps[currentStep - 1].name} has been processed successfully.`,
      });
    }
  };

  const handleCompletePayroll = () => {
    toast({
      title: "Payroll Processed",
      description: "January 2024 payroll has been completed and payments initiated.",
    });
  };

  const progressPercentage = (currentStep / payrollSteps.length) * 100;

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
          <CardDescription>
            January 2024 payroll breakdown before final processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Gross Salaries</span>
              </div>
              <p className="text-2xl font-bold">KSh {payrollSummary.totalGross.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{payrollSummary.totalEmployees} employees</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">PAYE Tax</span>
              </div>
              <p className="text-2xl font-bold text-red-600">KSh {payrollSummary.totalPaye.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">16.0% of gross</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">NSSF + SHIF</span>
              </div>
              <p className="text-2xl font-bold text-red-600">KSh {(payrollSummary.totalNssf + payrollSummary.totalShif).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Statutory contributions</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">Net Salaries</span>
              </div>
              <p className="text-2xl font-bold text-green-600">KSh {payrollSummary.totalNet.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">71.4% of gross</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Steps</CardTitle>
          <CardDescription>
            Complete each step to finalize the payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollSteps.map((step, index) => (
              <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step)}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={step.status === "completed" ? "default" : 
                            step.status === "in-progress" ? "secondary" : "outline"}
                  >
                    {step.status === "completed" ? "Completed" :
                     step.status === "in-progress" ? "In Progress" : "Pending"}
                  </Badge>
                  {step.status === "in-progress" && (
                    <Button size="sm" onClick={handleProcessStep}>
                      Process
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outline">
              Save Draft
            </Button>
            <Button onClick={handleCompletePayroll} disabled={currentStep < payrollSteps.length}>
              Complete Payroll Processing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
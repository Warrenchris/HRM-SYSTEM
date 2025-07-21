import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, Users, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const employeesForPayslip = [
  {
    id: "EMP001",
    name: "John Doe",
    department: "Engineering",
    position: "Senior Developer",
    grossSalary: 160000,
    netSalary: 129090,
    status: "ready"
  },
  {
    id: "EMP002", 
    name: "Jane Smith",
    department: "Design",
    position: "UI/UX Designer",
    grossSalary: 117000,
    netSalary: 96285,
    status: "ready"
  },
  {
    id: "EMP003",
    name: "Mike Johnson", 
    department: "Marketing",
    position: "Marketing Manager",
    grossSalary: 111500,
    netSalary: 91997,
    status: "pending"
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    department: "HR",
    position: "HR Specialist",
    grossSalary: 95000,
    netSalary: 78450,
    status: "ready"
  }
];

export function PayslipGenerator() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(employeesForPayslip.filter(emp => emp.status === "ready").map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleGeneratePayslips = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Employees Selected",
        description: "Please select at least one employee to generate payslips.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast({
      title: "Payslips Generated Successfully",
      description: `Generated ${selectedEmployees.length} payslip(s) for ${selectedPeriod}.`,
    });
  };

  const handleBulkEmail = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Employees Selected",
        description: "Please select employees to email payslips.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sending Payslips",
      description: `Emailing payslips to ${selectedEmployees.length} employee(s).`,
    });
  };

  const handleBulkDownload = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Employees Selected",
        description: "Please select employees to download payslips.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Downloading Payslips",
      description: `Preparing ZIP file with ${selectedEmployees.length} payslip(s).`,
    });
  };

  const readyEmployees = employeesForPayslip.filter(emp => emp.status === "ready");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generate Payslips</h2>
          <p className="text-muted-foreground">Generate and distribute employee payslips</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesForPayslip.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Generation</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{selectedEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {employeesForPayslip.reduce((sum, emp) => sum + emp.grossSalary, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Controls</CardTitle>
          <CardDescription>
            Select employees and generate payslips for {selectedPeriod}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button 
              onClick={handleGeneratePayslips}
              disabled={isGenerating || selectedEmployees.length === 0}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Payslips"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleBulkEmail}
              disabled={selectedEmployees.length === 0}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Selected
            </Button>
            <Button 
              variant="outline"
              onClick={handleBulkDownload}
              disabled={selectedEmployees.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Selection Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Selection</CardTitle>
          <CardDescription>
            Select employees to generate payslips for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedEmployees.length === readyEmployees.length && readyEmployees.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesForPayslip.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => handleEmployeeSelect(employee.id, checked as boolean)}
                      disabled={employee.status !== "ready"}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>KSh {employee.grossSalary.toLocaleString()}</TableCell>
                  <TableCell>KSh {employee.netSalary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "ready" ? "default" : "secondary"}>
                      {employee.status}
                    </Badge>
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
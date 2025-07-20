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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, Download, Search, Calculator } from "lucide-react";

// Kenyan NHIF rates based on gross salary
const getNhifRate = (grossSalary: number): number => {
  if (grossSalary <= 5999) return 150;
  if (grossSalary <= 7999) return 300;
  if (grossSalary <= 11999) return 400;
  if (grossSalary <= 14999) return 500;
  if (grossSalary <= 19999) return 600;
  if (grossSalary <= 24999) return 750;
  if (grossSalary <= 29999) return 850;
  if (grossSalary <= 34999) return 900;
  if (grossSalary <= 39999) return 950;
  if (grossSalary <= 44999) return 1000;
  if (grossSalary <= 49999) return 1100;
  if (grossSalary <= 59999) return 1200;
  if (grossSalary <= 69999) return 1300;
  if (grossSalary <= 79999) return 1400;
  if (grossSalary <= 89999) return 1500;
  if (grossSalary <= 99999) return 1600;
  return 1700;
};

// Kenyan PAYE calculation
const calculatePaye = (grossSalary: number): number => {
  const personalRelief = 2400;
  let taxableIncome = grossSalary - personalRelief;
  let tax = 0;

  if (taxableIncome <= 24000) {
    tax = taxableIncome * 0.1;
  } else if (taxableIncome <= 32333) {
    tax = 24000 * 0.1 + (taxableIncome - 24000) * 0.25;
  } else if (taxableIncome <= 500000) {
    tax = 24000 * 0.1 + 8333 * 0.25 + (taxableIncome - 32333) * 0.3;
  } else if (taxableIncome <= 800000) {
    tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + (taxableIncome - 500000) * 0.325;
  } else {
    tax = 24000 * 0.1 + 8333 * 0.25 + 467667 * 0.3 + 300000 * 0.325 + (taxableIncome - 800000) * 0.35;
  }

  return Math.max(0, tax);
};

const mockEmployees = [
  {
    id: "EMP-001",
    name: "John Kamau",
    department: "Engineering",
    position: "Senior Developer",
    basicSalary: 120000,
    allowances: 30000,
    overtime: 15000
  },
  {
    id: "EMP-002", 
    name: "Mary Wanjiku",
    department: "Marketing",
    position: "Marketing Manager",
    basicSalary: 95000,
    allowances: 20000,
    overtime: 0
  },
  {
    id: "EMP-003",
    name: "Peter Otieno",
    department: "Sales",
    position: "Sales Executive",
    basicSalary: 65000,
    allowances: 15000,
    overtime: 8000
  },
  {
    id: "EMP-004",
    name: "Grace Muthoni",
    department: "HR",
    position: "HR Officer",
    basicSalary: 75000,
    allowances: 18000,
    overtime: 0
  },
  {
    id: "EMP-005",
    name: "David Kipkoech",
    department: "Finance",
    position: "Accountant",
    basicSalary: 85000,
    allowances: 22000,
    overtime: 5000
  }
];

export function PayrollTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const calculatePayroll = (employee: any) => {
    const grossSalary = employee.basicSalary + employee.allowances + employee.overtime;
    const nssf = Math.min(grossSalary * 0.06, 2160); // 6% or max 2160
    const nhif = getNhifRate(grossSalary);
    const housingLevy = grossSalary * 0.015; // 1.5%
    const paye = calculatePaye(grossSalary - nssf);
    const totalDeductions = nssf + nhif + housingLevy + paye;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      nssf,
      nhif,
      housingLevy,
      paye,
      totalDeductions,
      netSalary
    };
  };

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Payroll</CardTitle>
        <CardDescription>
          Manage individual employee payroll with Kenyan statutory deductions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-right">PAYE</TableHead>
                <TableHead className="text-right">NSSF</TableHead>
                <TableHead className="text-right">NHIF</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const payroll = calculatePayroll(employee);
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      KSh {employee.basicSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {payroll.grossSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      KSh {Math.round(payroll.paye).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      KSh {Math.round(payroll.nssf).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      KSh {payroll.nhif.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      KSh {Math.round(payroll.netSalary).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payroll Details - {employee?.name}</DialogTitle>
                              <DialogDescription>
                                Complete payroll breakdown with Kenyan statutory deductions
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEmployee && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Earnings</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Basic Salary:</span>
                                        <span>KSh {selectedEmployee.basicSalary.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Allowances:</span>
                                        <span>KSh {selectedEmployee.allowances.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Overtime:</span>
                                        <span>KSh {selectedEmployee.overtime.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-medium border-t pt-2">
                                        <span>Gross Salary:</span>
                                        <span>KSh {calculatePayroll(selectedEmployee).grossSalary.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Deductions</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>PAYE Tax:</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee).paye).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>NSSF (6%):</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee).nssf).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>NHIF:</span>
                                        <span className="text-red-600">KSh {calculatePayroll(selectedEmployee).nhif.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Housing Levy (1.5%):</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee).housingLevy).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-medium border-t pt-2">
                                        <span>Total Deductions:</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee).totalDeductions).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-4">
                                  <div className="flex justify-between text-lg font-bold">
                                    <span>Net Salary:</span>
                                    <span className="text-green-600">KSh {Math.round(calculatePayroll(selectedEmployee).netSalary).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download Payslip
                              </Button>
                            </DialogFooter>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
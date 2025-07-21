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
import { Eye, Download, Search, Calculator, Loader2 } from "lucide-react";
import { usePayrollEmployees, calculatePayroll, PayrollEmployee } from "@/hooks/usePayrollData";

export function PayrollTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { employees, loading, error } = usePayrollEmployees();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading employees...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-600">Error loading employees: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
      employee.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  // Default allowances and overtime (can be made dynamic later)
  const getEmployeeAllowances = (employee: PayrollEmployee) => {
    const basicSalary = employee.basic_salary || employee.salary || 0;
    return Math.round(basicSalary * 0.2); // 20% of basic salary as allowances
  };

  const getEmployeeOvertime = () => 0; // Default to 0 for now

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
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept.toLowerCase()}>
                  {dept}
                </SelectItem>
              ))}
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
                <TableHead className="text-right">SHIF</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const allowances = getEmployeeAllowances(employee);
                const overtime = getEmployeeOvertime();
                const payroll = calculatePayroll(employee, allowances, overtime);
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      KSh {(employee.basic_salary || employee.salary || 0).toLocaleString()}
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
                      KSh {payroll.shif.toLocaleString()}
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
                              <DialogTitle>Payroll Details - {selectedEmployee?.first_name} {selectedEmployee?.last_name}</DialogTitle>
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
                                        <span>KSh {(selectedEmployee.basic_salary || selectedEmployee.salary || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Allowances:</span>
                                        <span>KSh {getEmployeeAllowances(selectedEmployee).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Overtime:</span>
                                        <span>KSh {getEmployeeOvertime().toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-medium border-t pt-2">
                                        <span>Gross Salary:</span>
                                        <span>KSh {calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).grossSalary.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Deductions</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>PAYE Tax:</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).paye).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>NSSF (6%):</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).nssf).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>SHIF:</span>
                                        <span className="text-red-600">KSh {calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).shif.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Housing Levy (1.5%):</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).housingLevy).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-medium border-t pt-2">
                                        <span>Total Deductions:</span>
                                        <span className="text-red-600">KSh {Math.round(calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).totalDeductions).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-4">
                                  <div className="flex justify-between text-lg font-bold">
                                    <span>Net Salary:</span>
                                    <span className="text-green-600">KSh {Math.round(calculatePayroll(selectedEmployee, getEmployeeAllowances(selectedEmployee), getEmployeeOvertime()).netSalary).toLocaleString()}</span>
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
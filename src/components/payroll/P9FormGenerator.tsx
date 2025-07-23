import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface P9Data {
  employeeId: string;
  employeeName: string;
  pinNumber: string;
  department: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  payeTax: number;
  nssfDeduction: number;
  shifDeduction: number;
  housingLevy: number;
  totalDeductions: number;
  netSalary: number;
  cumulativePayeTax: number;
  cumulativeGrossSalary: number;
}

interface P9FormData {
  year: string;
  employerName: string;
  employerPin: string;
  employees: P9Data[];
}

export function P9FormGenerator() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [p9Data, setP9Data] = useState<P9FormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, department, kra_pin')
        .eq('status', 'active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees data.",
        variant: "destructive"
      });
    }
  };

  const generateP9Forms = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one employee to generate P9 forms.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch payroll records for selected employees for the year
      const { data: payrollData, error } = await supabase
        .from('payroll_records')
        .select(`
          employee_id,
          basic_salary,
          allowances,
          gross_salary,
          paye_tax,
          nssf_deduction,
          shif_deduction,
          housing_levy,
          total_deductions,
          net_salary,
          pay_period
        `)
        .in('employee_id', selectedEmployees)
        .like('pay_period', `%${selectedYear}%`)
        .order('pay_period');

      if (error) throw error;

      // Calculate cumulative values for each employee
      const employeeP9Data: P9Data[] = [];
      
      for (const empId of selectedEmployees) {
        const employee = employees.find(emp => emp.id === empId);
        const empPayrollRecords = payrollData?.filter(record => record.employee_id === empId) || [];
        
        // Calculate totals for the year
        const totalGrossSalary = empPayrollRecords.reduce((sum, record) => sum + (record.gross_salary || 0), 0);
        const totalPayeTax = empPayrollRecords.reduce((sum, record) => sum + (record.paye_tax || 0), 0);
        const totalNssfDeduction = empPayrollRecords.reduce((sum, record) => sum + (record.nssf_deduction || 0), 0);
        const totalShifDeduction = empPayrollRecords.reduce((sum, record) => sum + (record.shif_deduction || 0), 0);
        const totalHousingLevy = empPayrollRecords.reduce((sum, record) => sum + (record.housing_levy || 0), 0);
        const totalDeductions = empPayrollRecords.reduce((sum, record) => sum + (record.total_deductions || 0), 0);
        const totalNetSalary = empPayrollRecords.reduce((sum, record) => sum + (record.net_salary || 0), 0);
        const totalBasicSalary = empPayrollRecords.reduce((sum, record) => sum + (record.basic_salary || 0), 0);
        const totalAllowances = empPayrollRecords.reduce((sum, record) => sum + (record.allowances || 0), 0);

        if (employee) {
          employeeP9Data.push({
            employeeId: employee.employee_id || employee.id,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            pinNumber: employee.kra_pin || 'N/A',
            department: employee.department,
            basicSalary: totalBasicSalary,
            allowances: totalAllowances,
            grossSalary: totalGrossSalary,
            payeTax: totalPayeTax,
            nssfDeduction: totalNssfDeduction,
            shifDeduction: totalShifDeduction,
            housingLevy: totalHousingLevy,
            totalDeductions: totalDeductions,
            netSalary: totalNetSalary,
            cumulativePayeTax: totalPayeTax,
            cumulativeGrossSalary: totalGrossSalary
          });
        }
      }

      setP9Data({
        year: selectedYear,
        employerName: "Your Company Name", // This should come from company settings
        employerPin: "P051234567X", // This should come from company settings
        employees: employeeP9Data
      });

      setShowPreview(true);
      
      toast({
        title: "P9 Forms Generated",
        description: `Generated P9 forms for ${employeeP9Data.length} employees for ${selectedYear}.`,
      });

    } catch (error) {
      console.error('Error generating P9 forms:', error);
      toast({
        title: "Error",
        description: "Failed to generate P9 forms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadP9Form = (employee: P9Data) => {
    // Create a simple HTML template for P9 form
    const p9Html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>P9 Form - ${employee.employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .form-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; }
          .field { margin-bottom: 8px; }
          .field label { display: inline-block; width: 200px; font-weight: bold; }
          .field value { display: inline-block; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .amount { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="form-title">INCOME TAX CERTIFICATE (P9 FORM)</div>
          <div>Year: ${p9Data?.year}</div>
        </div>
        
        <div class="section">
          <div class="section-title">EMPLOYER DETAILS</div>
          <div class="field">
            <label>Employer Name:</label>
            <span>${p9Data?.employerName}</span>
          </div>
          <div class="field">
            <label>Employer PIN:</label>
            <span>${p9Data?.employerPin}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">EMPLOYEE DETAILS</div>
          <div class="field">
            <label>Employee Name:</label>
            <span>${employee.employeeName}</span>
          </div>
          <div class="field">
            <label>Employee ID:</label>
            <span>${employee.employeeId}</span>
          </div>
          <div class="field">
            <label>PIN Number:</label>
            <span>${employee.pinNumber}</span>
          </div>
          <div class="field">
            <label>Department:</label>
            <span>${employee.department}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">INCOME AND DEDUCTIONS SUMMARY</div>
          <table>
            <tr>
              <th>Description</th>
              <th class="amount">Amount (KSh)</th>
            </tr>
            <tr>
              <td>Basic Salary</td>
              <td class="amount">${employee.basicSalary.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td class="amount">${employee.allowances.toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Gross Salary</strong></td>
              <td class="amount"><strong>${employee.grossSalary.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td>PAYE Tax</td>
              <td class="amount">${employee.payeTax.toLocaleString()}</td>
            </tr>
            <tr>
              <td>NSSF Deduction</td>
              <td class="amount">${employee.nssfDeduction.toLocaleString()}</td>
            </tr>
            <tr>
              <td>SHIF Deduction</td>
              <td class="amount">${employee.shifDeduction.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Housing Levy</td>
              <td class="amount">${employee.housingLevy.toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Total Deductions</strong></td>
              <td class="amount"><strong>${employee.totalDeductions.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td><strong>Net Salary</strong></td>
              <td class="amount"><strong>${employee.netSalary.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">CERTIFICATE</div>
          <p>This is to certify that the above particulars are correct and that tax has been deducted in accordance with the Income Tax Act.</p>
          <br><br>
          <div style="margin-top: 40px;">
            <div style="float: left;">
              <div>Employee Signature: ________________</div>
              <div style="margin-top: 20px;">Date: ________________</div>
            </div>
            <div style="float: right;">
              <div>Employer Signature: ________________</div>
              <div style="margin-top: 20px;">Date: ________________</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and download the file
    const blob = new Blob([p9Html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `P9_Form_${employee.employeeName.replace(' ', '_')}_${selectedYear}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllP9Forms = () => {
    if (!p9Data) return;
    
    p9Data.employees.forEach(employee => {
      setTimeout(() => downloadP9Form(employee), 100); // Small delay between downloads
    });
    
    toast({
      title: "Download Started",
      description: `Downloading P9 forms for ${p9Data.employees.length} employees.`,
    });
  };

  const handleEmployeeSelection = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp.id));
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            P9 Form Generator (Income Tax Certificate)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tax Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={selectAllEmployees} variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Select All
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                Clear Selection
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateP9Forms} 
                disabled={loading || selectedEmployees.length === 0}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate P9 Forms"}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              Select Employees ({selectedEmployees.length} selected)
            </h3>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                        onChange={(e) => e.target.checked ? selectAllEmployees() : clearSelection()}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>KRA PIN</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                          <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.kra_pin || 'N/A'}</TableCell>
                      <TableCell>
                        {selectedEmployees.includes(employee.id) ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P9 Forms Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              P9 Forms Preview - {selectedYear}
            </DialogTitle>
          </DialogHeader>
          
          {p9Data && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Generated {p9Data.employees.length} P9 Forms</h3>
                  <p className="text-sm text-muted-foreground">Tax Year: {p9Data.year}</p>
                </div>
                <Button onClick={downloadAllP9Forms}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All P9 Forms
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>KRA PIN</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>PAYE Tax</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {p9Data.employees.map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.pinNumber}</TableCell>
                        <TableCell>KSh {employee.grossSalary.toLocaleString()}</TableCell>
                        <TableCell>KSh {employee.payeTax.toLocaleString()}</TableCell>
                        <TableCell>KSh {employee.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadP9Form(employee)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
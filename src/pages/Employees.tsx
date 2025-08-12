import { useState, useRef } from "react";
import { Plus, Search, Filter, Download, Upload, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeStats } from "@/components/employees/EmployeeStats";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
import { ImportEmployeesDialog } from "@/components/employees/ImportEmployeesDialog";
import { EmployeeFormData } from "@/components/employees/EmployeeFormTabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// Removed systemLogger - logging disabled for performance
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  const handleAddEmployee = async (employeeData: EmployeeFormData) => {
    console.log('Starting employee creation with data:', employeeData);
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication required');
      }
      console.log('User authenticated:', user?.id);

      const { data, error } = await supabase
        .from('employees')
        .insert({
          // Personal Information
          employee_id: employeeData.employeeId,
          first_name: employeeData.firstName,
          last_name: employeeData.secondName || employeeData.otherName || employeeData.firstName, // Use second name as last name, fallback to other name or first name
          second_name: employeeData.secondName,
          other_name: employeeData.otherName,
          office_email: employeeData.officeEmail,
          personal_email: employeeData.personalEmail,
          email: employeeData.officeEmail, // Keep for backward compatibility
          date_of_birth: employeeData.dateOfBirth,
          gender: employeeData.gender,
          marital_status: employeeData.maritalStatus,
          phone: employeeData.phone,
          local_address: employeeData.localAddress,
          permanent_address: employeeData.permanentAddress,
          login_password: employeeData.loginPassword,

          // Company Information
          department: employeeData.department,
          position: employeeData.designation,
          reporting_to: employeeData.reportingTo,
          role: employeeData.role,
          office_branch: employeeData.officeBranch,
          site_project: employeeData.siteProject,
          join_date: employeeData.dateOfJoining,
          contract_start_date: employeeData.contractStartDate,
          contract_end_date: employeeData.contractEndDate,
          exit_date: employeeData.exitDate,

          // Payment Information
          basic_salary: employeeData.basicSalary ? parseFloat(employeeData.basicSalary) : null,
          hourly_rate: employeeData.hourlyRate ? parseFloat(employeeData.hourlyRate) : null,
          salary: employeeData.basicSalary ? parseFloat(employeeData.basicSalary) : null, // Keep for backward compatibility

          // Bank Details
          bank_name: employeeData.bankName,
          bank_branch_location: employeeData.bankBranchLocation,
          bank_account_holder_name: employeeData.bankAccountHolderName,
          bank_account_number: employeeData.bankAccountNumber,
          bank_code: employeeData.bankCode,
          branch_code: employeeData.branchCode,
          bank_identifier_code: employeeData.bankIdentifierCode,
          kra_pin: employeeData.kraPin,

          // Mpesa Details
          mpesa_name: employeeData.mpesaName,
          mpesa_number: employeeData.mpesaNumber,
          mpesa_payment_status: employeeData.mpesaPaymentStatus,

          // Statutory Information
          shif_number: employeeData.shifNumber,
          nssf_number: employeeData.nssfNumber,
          id_number: employeeData.idNumber,

          // Academic Information
          achievements: JSON.stringify(employeeData.achievements),
          courses_taken: JSON.stringify(employeeData.coursesTaken),
          other_academics: employeeData.otherAcademics,

          // Next of Kin Information
          next_of_kin_name: employeeData.nextOfKinName,
          next_of_kin_relationship: employeeData.nextOfKinRelationship,
          next_of_kin_mobile: employeeData.nextOfKinMobile,
          next_of_kin_email: employeeData.nextOfKinEmail,
          emergency_contact_person: employeeData.emergencyContactPerson,
          emergency_contact_number: employeeData.emergencyContactNumber,

          // Default values
          status: 'active',
        })
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Employee created successfully:', data);

      // Employee created successfully

      toast({
        title: "Employee Added",
        description: `${employeeData.firstName} has been added successfully.`,
      });
      
      setIsAddDialogOpen(false);
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportEmployees = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const generateCSV = (employees: any[]) => {
    const headers = [
      'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 
      'Position', 'Join Date', 'Status', 'Salary', 'Address'
    ];
    
    const csvContent = [
      headers.join(','),
      ...employees.map(emp => [
        emp.employee_id || '',
        emp.first_name || '',
        emp.last_name || '',
        emp.email || '',
        emp.phone || '',
        emp.department || '',
        emp.position || '',
        emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '',
        emp.status || '',
        emp.basic_salary || emp.salary || '',
        emp.local_address || emp.address || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `active_employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateExcel = (employees: any[]) => {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = employees.map(emp => ({
      'Employee ID': emp.employee_id || '',
      'First Name': emp.first_name || '',
      'Last Name': emp.last_name || '',
      'Second Name': emp.second_name || '',
      'Other Name': emp.other_name || '',
      'Office Email': emp.office_email || emp.email || '',
      'Personal Email': emp.personal_email || '',
      'Phone': emp.phone || '',
      'Date of Birth': emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : '',
      'Gender': emp.gender || '',
      'Marital Status': emp.marital_status || '',
      'Department': emp.department || '',
      'Position': emp.position || '',
      'Join Date': emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '',
      'Status': emp.status || '',
      'Basic Salary': emp.basic_salary || emp.salary || '',
      'Hourly Rate': emp.hourly_rate || '',
      'Local Address': emp.local_address || emp.address || '',
      'Permanent Address': emp.permanent_address || '',
      'Reporting To': emp.reporting_to || '',
      'Office Branch': emp.office_branch || '',
      'Site Project': emp.site_project || '',
      'Bank Name': emp.bank_name || '',
      'Bank Account Number': emp.bank_account_number || '',
      'KRA PIN': emp.kra_pin || '',
      'NSSF Number': emp.nssf_number || '',
      'ID Number': emp.id_number || '',
      'Next of Kin Name': emp.next_of_kin_name || '',
      'Next of Kin Relationship': emp.next_of_kin_relationship || '',
      'Next of Kin Mobile': emp.next_of_kin_mobile || '',
      'Emergency Contact': emp.emergency_contact_person || emp.emergency_contact || '',
      'Emergency Phone': emp.emergency_contact_number || emp.emergency_phone || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = [
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, 
      {wch: 25}, {wch: 25}, {wch: 15}, {wch: 12}, {wch: 10}, 
      {wch: 15}, {wch: 20}, {wch: 20}, {wch: 12}, {wch: 10}, 
      {wch: 15}, {wch: 12}, {wch: 30}, {wch: 30}, {wch: 20}, 
      {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 15}, 
      {wch: 15}, {wch: 15}, {wch: 20}, {wch: 20}, {wch: 15}, 
      {wch: 20}, {wch: 15}
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Active Employees');
    XLSX.writeFile(workbook, `active_employees_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generatePDF = (employees: any[]) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Add title
    doc.setFontSize(16);
    doc.text('Active Employees Report', 14, 15);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(`Total Active Employees: ${employees.length}`, 14, 30);

    // Prepare table data
    const tableData = employees.map(emp => [
      emp.employee_id || '',
      `${emp.first_name || ''} ${emp.last_name || ''}`,
      emp.email || '',
      emp.phone || '',
      emp.department || '',
      emp.position || '',
      emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '',
      emp.status || ''
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['ID', 'Name', 'Email', 'Phone', 'Department', 'Position', 'Join Date', 'Status']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 35, right: 14, bottom: 20, left: 14 },
    });

    doc.save(`active_employees_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateTemplate = () => {
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Second Name',
      'Other Name',
      'Office Email',
      'Personal Email',
      'Phone',
      'Date of Birth',
      'Gender',
      'Marital Status',
      'Department',
      'Position',
      'Join Date',
      'Basic Salary',
      'Hourly Rate',
      'Local Address',
      'Permanent Address',
      'Reporting To',
      'Office Branch',
      'Site Project',
      'Bank Name',
      'Bank Account Number',
      'KRA PIN',
      'NSSF Number',
      'ID Number',
      'Next of Kin Name',
      'Next of Kin Relationship',
      'Next of Kin Mobile',
      'Emergency Contact',
      'Emergency Phone'
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    // Set column widths
    const columnWidths = [
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, 
      {wch: 25}, {wch: 25}, {wch: 15}, {wch: 12}, {wch: 10}, 
      {wch: 15}, {wch: 20}, {wch: 20}, {wch: 12}, {wch: 15}, 
      {wch: 12}, {wch: 30}, {wch: 30}, {wch: 20}, {wch: 20}, 
      {wch: 20}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 15}, 
      {wch: 15}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 20}, 
      {wch: 15}
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Template');
    XLSX.writeFile(workbook, 'employee_import_template.xlsx');
  };

  const handleExportEmployees = async (format: string) => {
    try {
      // Show loading state
      toast({
        title: "Preparing Export",
        description: "Fetching employee data...",
      });

      // Fetch only active employees for export
      const { data: activeEmployees, error } = await supabase
        .from('employees')
        .select('*')
        .is('exit_date', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Apply current filters to export data
      const filteredForExport = activeEmployees?.filter(employee => {
        const matchesSearch = searchTerm === "" || (
          employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const matchesDepartment = 
          selectedDepartment === "all" || 
          employee.department?.toLowerCase() === selectedDepartment.toLowerCase();

        return matchesSearch && matchesDepartment;
      }) || [];

      const departmentText = selectedDepartment === "all" ? "All Departments" : 
        selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1);

      if (format === 'template') {
        generateTemplate();
        toast({
          title: "Template Downloaded",
          description: "Employee import template has been downloaded",
        });
        return;
      }

      if (filteredForExport.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No active employees found matching the current filters",
          variant: "destructive",
        });
        return;
      }

      // Generate the appropriate file format
      switch (format) {
        case 'excel':
          generateExcel(filteredForExport);
          break;
        case 'csv':
          generateCSV(filteredForExport);
          break;
        case 'pdf':
          generatePDF(filteredForExport);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      toast({
        title: `${format.toUpperCase()} Export Complete`,
        description: `Successfully exported ${filteredForExport.length} active employees from ${departmentText}`,
      });
      
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export employee data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's workforce</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportEmployees}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportEmployees("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Active Employees to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEmployees("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Export Active Employees to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEmployees("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Export Active Employees to PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportEmployees("template")}>
                <Download className="w-4 h-4 mr-2" />
                Download Import Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Employee Statistics */}
      <EmployeeStats />

      {/* Employee Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center">
            <TabsTrigger value="active">Active Employees</TabsTrigger>
            <TabsTrigger value="exited">Exited Employees</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search employees by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="it">IT Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>

              {/* Filter Summary */}
              {(selectedDepartment !== "all" || searchTerm) && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedDepartment !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Department: {selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1)}
                      <button 
                        onClick={() => setSelectedDepartment("all")}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedDepartment("all");
                      setSearchTerm("");
                    }}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              <EmployeeTable 
                searchTerm={searchTerm}
                selectedDepartment={selectedDepartment}
                refreshTrigger={refreshTrigger}
                showExited={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exited" className="space-y-4">
          {/* Search and Filters for Exited Employees */}
          <Card>
            <CardHeader>
              <CardTitle>Exited Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search exited employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="it">IT Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <EmployeeTable 
                searchTerm={searchTerm}
                selectedDepartment={selectedDepartment}
                refreshTrigger={refreshTrigger}
                showExited={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddEmployee}
        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
      />

      <ImportEmployeesDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
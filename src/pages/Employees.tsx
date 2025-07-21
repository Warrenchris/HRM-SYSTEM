import { useState, useRef } from "react";
import { Plus, Search, Filter, Download, Upload, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeStats } from "@/components/employees/EmployeeStats";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
import { EmployeeFormData } from "@/components/employees/EmployeeFormTabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleAddEmployee = async (employeeData: EmployeeFormData) => {
    try {
      const { error } = await supabase
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
        });

      if (error) throw error;

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
    toast({
      title: "Import Feature",
      description: "CSV import functionality will be implemented with backend integration.",
    });
  };

  const handleExportEmployees = (format: string) => {
    const departmentText = selectedDepartment === "all" ? "All Departments" : 
      selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1);
    
    toast({
      title: `${format.toUpperCase()} Export Started`,
      description: `Exporting employees from ${departmentText}`,
    });
    
    // In a real implementation, this would call an API to generate the export
    console.log(`Exporting ${format} for department: ${selectedDepartment}`);
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
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEmployees("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEmployees("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportEmployees("template")}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
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
          />
        </CardContent>
      </Card>

      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}
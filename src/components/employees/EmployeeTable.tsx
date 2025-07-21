import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { EditEmployeeDialog } from "./EditEmployeeDialog";
import { ViewEmployeeDialog } from "./ViewEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeTableProps {
  searchTerm: string;
  selectedDepartment: string;
  refreshTrigger?: number;
}

export function EmployeeTable({ searchTerm, selectedDepartment, refreshTrigger }: EmployeeTableProps) {
  const { toast } = useToast();
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [viewEmployee, setViewEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees from Supabase
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchEmployees();
    }
  }, [refreshTrigger]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === "all" || 
      employee.department.toLowerCase() === selectedDepartment.toLowerCase();

    return matchesSearch && matchesDepartment;
  });

  // Calculate department statistics for filtered employees
  const departmentStats = filteredEmployees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAction = (action: string, employee: any) => {
    if (action === "View") {
      setViewEmployee(employee);
      setIsViewDialogOpen(true);
    } else if (action === "Edit") {
      setEditEmployee(employee);
      setIsEditDialogOpen(true);
    } else if (action === "Delete") {
      handleDeleteEmployee(employee);
    } else {
      toast({
        title: `${action} Employee`,
        description: `${action} action for ${employee.first_name} ${employee.last_name}`,
      });
    }
  };

  const handleEditEmployee = async (employeeData: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          // Personal Information
          first_name: employeeData.firstName,
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
          address: employeeData.localAddress, // Keep for backward compatibility
          login_password: employeeData.loginPassword,

          // Company Information
          employee_id: employeeData.employeeId,
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
          emergency_contact: employeeData.emergencyContactPerson, // Keep for backward compatibility
          emergency_phone: employeeData.emergencyContactNumber, // Keep for backward compatibility

          // Status (ensure lowercase)
          status: 'active', // Default to active for updates

          // Update timestamp
          updated_at: new Date().toISOString(),
        })
        .eq('id', editEmployee.id);

      if (error) throw error;

      toast({
        title: "Employee Updated",
        description: `Successfully updated ${employeeData.firstName} ${employeeData.secondName || employeeData.otherName || employeeData.firstName}`,
      });
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    } finally {
      setIsEditDialogOpen(false);
      setEditEmployee(null);
    }
  };

  const handleDeleteEmployee = async (employee: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Employee Deleted",
        description: `Successfully deleted ${employee.first_name} ${employee.last_name}`,
      });
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
      case "on leave":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">On Leave</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </span>
          {selectedDepartment !== "all" && (
            <Badge variant="outline" className="text-xs">
              {selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1)} Department
            </Badge>
          )}
        </div>
        {Object.keys(departmentStats).length > 1 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
             {Object.entries(departmentStats).map(([dept, count]) => (
               <span key={dept}>
                 {dept}: {String(count)}
               </span>
             ))}
          </div>
        )}
      </div>

      <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                   <Avatar className="w-10 h-10">
                     <AvatarImage src="" />
                     <AvatarFallback className="bg-primary/10 text-primary">
                       {employee.first_name[0]}{employee.last_name[0]}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <div className="font-medium text-foreground">
                       {employee.first_name} {employee.last_name}
                     </div>
                     <div className="text-sm text-muted-foreground">
                       ID: {employee.employee_id}
                     </div>
                   </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{employee.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-foreground">{employee.department}</span>
              </TableCell>
              <TableCell>
                <span className="text-foreground">{employee.position}</span>
              </TableCell>
              <TableCell>
                {getStatusBadge(employee.status)}
              </TableCell>
               <TableCell>
                 <span className="text-muted-foreground">
                   {new Date(employee.join_date).toLocaleDateString()}
                 </span>
               </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-md">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleAction("View", employee)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("Edit", employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Employee
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleAction("Delete", employee)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Employee
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No employees found matching your criteria.
        </div>
      )}
    </div>
    
    {/* View Employee Dialog */}
    <ViewEmployeeDialog
      isOpen={isViewDialogOpen}
      onClose={() => {
        setIsViewDialogOpen(false);
        setViewEmployee(null);
      }}
      employee={viewEmployee}
    />
    
    {/* Edit Employee Dialog */}
    <EditEmployeeDialog
      isOpen={isEditDialogOpen}
      onClose={() => {
        setIsEditDialogOpen(false);
        setEditEmployee(null);
      }}
      onSubmit={handleEditEmployee}
      employee={editEmployee}
    />
    </div>
  );
}
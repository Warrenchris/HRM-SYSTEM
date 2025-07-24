import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeFormTabs, EmployeeFormData } from "./EmployeeFormTabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  onRefresh?: () => void;
  employee: any;
}

export function EditEmployeeDialog({ isOpen, onClose, onSubmit, onRefresh, employee }: EditEmployeeDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (values: EmployeeFormData) => {
    onSubmit(values);
  };

  // Handle individual tab saves
  const handleTabSave = async (tabData: Partial<EmployeeFormData>, tabName: string) => {
    try {
      if (!employee?.id) {
        toast({
          title: "Error",
          description: "Employee ID not found. Cannot save individual section.",
          variant: "destructive",
        });
        return;
      }

      // Convert form data to database format
      const updateData: any = {};

      // Personal Information mapping
      if (tabData.firstName !== undefined) updateData.first_name = tabData.firstName;
      if (tabData.secondName !== undefined) updateData.second_name = tabData.secondName;
      if (tabData.otherName !== undefined) updateData.other_name = tabData.otherName;
      if (tabData.officeEmail !== undefined) {
        updateData.office_email = tabData.officeEmail;
        updateData.email = tabData.officeEmail; // Keep for backward compatibility
      }
      if (tabData.personalEmail !== undefined) updateData.personal_email = tabData.personalEmail;
      if (tabData.dateOfBirth !== undefined) updateData.date_of_birth = tabData.dateOfBirth || null;
      if (tabData.gender !== undefined) updateData.gender = tabData.gender;
      if (tabData.maritalStatus !== undefined) updateData.marital_status = tabData.maritalStatus;
      if (tabData.phone !== undefined) updateData.phone = tabData.phone;
      if (tabData.localAddress !== undefined) {
        updateData.local_address = tabData.localAddress;
        updateData.address = tabData.localAddress; // Keep for backward compatibility
      }
      if (tabData.permanentAddress !== undefined) updateData.permanent_address = tabData.permanentAddress;
      if (tabData.loginPassword !== undefined) updateData.login_password = tabData.loginPassword;
      if ((tabData as any).passportPhotoUrl !== undefined) updateData.passport_photo_url = (tabData as any).passportPhotoUrl;

      // Company/Payment/Statutory mapping
      if (tabData.employeeId !== undefined) updateData.employee_id = tabData.employeeId;
      if (tabData.department !== undefined) updateData.department = tabData.department;
      if (tabData.designation !== undefined) updateData.position = tabData.designation;
      if (tabData.reportingTo !== undefined) updateData.reporting_to = tabData.reportingTo;
      if (tabData.role !== undefined) updateData.role = tabData.role;
      if (tabData.officeBranch !== undefined) updateData.office_branch = tabData.officeBranch;
      if (tabData.siteProject !== undefined) updateData.site_project = tabData.siteProject;
      if (tabData.dateOfJoining !== undefined) updateData.join_date = tabData.dateOfJoining || null;
      if (tabData.contractStartDate !== undefined) updateData.contract_start_date = tabData.contractStartDate || null;
      if (tabData.contractEndDate !== undefined) updateData.contract_end_date = tabData.contractEndDate || null;
      if (tabData.exitDate !== undefined) updateData.exit_date = tabData.exitDate || null;
      if (tabData.basicSalary !== undefined) {
        const salary = tabData.basicSalary ? parseFloat(tabData.basicSalary) : null;
        updateData.basic_salary = salary;
        updateData.salary = salary; // Keep for backward compatibility
      }
      if (tabData.hourlyRate !== undefined) updateData.hourly_rate = tabData.hourlyRate ? parseFloat(tabData.hourlyRate) : null;

      // Bank Details mapping
      if (tabData.bankName !== undefined) updateData.bank_name = tabData.bankName;
      if (tabData.bankBranchLocation !== undefined) updateData.bank_branch_location = tabData.bankBranchLocation;
      if (tabData.bankAccountHolderName !== undefined) updateData.bank_account_holder_name = tabData.bankAccountHolderName;
      if (tabData.bankAccountNumber !== undefined) updateData.bank_account_number = tabData.bankAccountNumber;
      if (tabData.bankCode !== undefined) updateData.bank_code = tabData.bankCode;
      if (tabData.branchCode !== undefined) updateData.branch_code = tabData.branchCode;
      if (tabData.bankIdentifierCode !== undefined) updateData.bank_identifier_code = tabData.bankIdentifierCode;
      if (tabData.kraPin !== undefined) updateData.kra_pin = tabData.kraPin;

      // Mpesa Details mapping
      if (tabData.mpesaName !== undefined) updateData.mpesa_name = tabData.mpesaName;
      if (tabData.mpesaNumber !== undefined) updateData.mpesa_number = tabData.mpesaNumber;
      if (tabData.mpesaPaymentStatus !== undefined) updateData.mpesa_payment_status = tabData.mpesaPaymentStatus;

      // Statutory mapping
      if (tabData.shifNumber !== undefined) updateData.shif_number = tabData.shifNumber;
      if (tabData.nssfNumber !== undefined) updateData.nssf_number = tabData.nssfNumber;
      if (tabData.idNumber !== undefined) updateData.id_number = tabData.idNumber;

      // Academics mapping
      if (tabData.achievements !== undefined) updateData.achievements = JSON.stringify(tabData.achievements);
      if (tabData.coursesTaken !== undefined) updateData.courses_taken = JSON.stringify(tabData.coursesTaken);
      if (tabData.otherAcademics !== undefined) updateData.other_academics = tabData.otherAcademics;

      // Next of Kin mapping
      if (tabData.nextOfKinName !== undefined) updateData.next_of_kin_name = tabData.nextOfKinName;
      if (tabData.nextOfKinRelationship !== undefined) updateData.next_of_kin_relationship = tabData.nextOfKinRelationship;
      if (tabData.nextOfKinMobile !== undefined) updateData.next_of_kin_mobile = tabData.nextOfKinMobile;
      if (tabData.nextOfKinEmail !== undefined) updateData.next_of_kin_email = tabData.nextOfKinEmail;
      if (tabData.emergencyContactPerson !== undefined) {
        updateData.emergency_contact_person = tabData.emergencyContactPerson;
        updateData.emergency_contact = tabData.emergencyContactPerson; // Keep for backward compatibility
      }
      if (tabData.emergencyContactNumber !== undefined) {
        updateData.emergency_contact_number = tabData.emergencyContactNumber;
        updateData.emergency_phone = tabData.emergencyContactNumber; // Keep for backward compatibility
      }

      // Always update the timestamp
      updateData.updated_at = new Date().toISOString();

      // Update the database
      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Section Saved",
        description: `${tabName} information has been saved successfully.`,
      });

      // Refresh the employee data if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('Error saving tab data:', error);
      toast({
        title: "Error",
        description: `Failed to save ${tabName} information.`,
        variant: "destructive",
      });
    }
  };

  // Convert database format to form format
  const convertEmployeeToFormData = (emp: any) => {
    if (!emp) return {};
    
    return {
      // Personal Information
      firstName: emp.first_name || "",
      secondName: emp.second_name || "",
      otherName: emp.other_name || "",
      officeEmail: emp.office_email || emp.email || "",
      personalEmail: emp.personal_email || "",
      dateOfBirth: emp.date_of_birth || "",
      gender: emp.gender || "",
      maritalStatus: emp.marital_status || "",
      phone: emp.phone || "",
      localAddress: emp.local_address || emp.address || "",
      permanentAddress: emp.permanent_address || "",
      loginPassword: emp.login_password || "",

      // Company/Payment/Statutory
      employeeId: emp.employee_id || "",
      department: emp.department || "",
      designation: emp.position || "",
      reportingTo: emp.reporting_to || "",
      role: emp.role || "employee",
      officeBranch: emp.office_branch || "",
      siteProject: emp.site_project || "",
      dateOfJoining: emp.join_date || "",
      contractStartDate: emp.contract_start_date || "",
      contractEndDate: emp.contract_end_date || "",
      exitDate: emp.exit_date || "",
      
      // Payment
      basicSalary: emp.basic_salary ? emp.basic_salary.toString() : emp.salary ? emp.salary.toString() : "",
      hourlyRate: emp.hourly_rate ? emp.hourly_rate.toString() : "",
      
      // Bank Details
      bankName: emp.bank_name || "",
      bankBranchLocation: emp.bank_branch_location || "",
      bankAccountHolderName: emp.bank_account_holder_name || "",
      bankAccountNumber: emp.bank_account_number || "",
      bankCode: emp.bank_code || "",
      branchCode: emp.branch_code || "",
      bankIdentifierCode: emp.bank_identifier_code || "",
      kraPin: emp.kra_pin || "",
      
      // Mpesa Details
      mpesaName: emp.mpesa_name || "",
      mpesaNumber: emp.mpesa_number || "",
      mpesaPaymentStatus: emp.mpesa_payment_status || "inactive",
      
      // Statutory
      shifNumber: emp.shif_number || "",
      nssfNumber: emp.nssf_number || "",
      idNumber: emp.id_number || "",

      // Academics
      achievements: Array.isArray(emp.achievements) ? emp.achievements : [],
      coursesTaken: Array.isArray(emp.courses_taken) ? emp.courses_taken : [],
      otherAcademics: emp.other_academics || "",

      // Next of Kin
      nextOfKinName: emp.next_of_kin_name || "",
      nextOfKinRelationship: emp.next_of_kin_relationship || "",
      nextOfKinMobile: emp.next_of_kin_mobile || "",
      nextOfKinEmail: emp.next_of_kin_email || "",
      emergencyContactPerson: emp.emergency_contact_person || emp.emergency_contact || "",
      emergencyContactNumber: emp.emergency_contact_number || emp.emergency_phone || "",
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update comprehensive employee details across multiple sections.
          </DialogDescription>
        </DialogHeader>

        <EmployeeFormTabs 
          onSubmit={handleSubmit} 
          onTabSave={handleTabSave}
          initialData={convertEmployeeToFormData(employee)} 
          isEdit={true}
          existingPhotoUrl={employee?.passport_photo_url}
        />
      </DialogContent>
    </Dialog>
  );
}
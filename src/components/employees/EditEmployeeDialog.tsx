import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeFormTabs, EmployeeFormData } from "./EmployeeFormTabs";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  employee: any;
}

export function EditEmployeeDialog({ isOpen, onClose, onSubmit, employee }: EditEmployeeDialogProps) {
  const handleSubmit = (values: EmployeeFormData) => {
    onSubmit(values);
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
          initialData={convertEmployeeToFormData(employee)} 
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  );
}
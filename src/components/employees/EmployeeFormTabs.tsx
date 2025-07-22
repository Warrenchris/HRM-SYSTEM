import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PersonalInfoTab } from "./tabs/PersonalInfoTab";
import { CompanyPaymentTab } from "./tabs/CompanyPaymentTab";
import { AcademicsTab } from "./tabs/AcademicsTab";
import { NextOfKinTab } from "./tabs/NextOfKinTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const employeeFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  secondName: z.string().optional(),
  otherName: z.string().optional(),
  officeEmail: z.string().email("Valid office email is required"),
  personalEmail: z.string().email("Valid personal email is required").optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  phone: z.string().min(10, "Phone number is required"),
  localAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  loginPassword: z.string().min(6, "Password must be at least 6 characters"),

  // Company/Payment/Statutory
  employeeId: z.string().min(3, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  reportingTo: z.string().optional(),
  role: z.string().default("employee"),
  officeBranch: z.string().optional(),
  siteProject: z.string().optional(),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  exitDate: z.string().optional(),
  
  // Payment
  basicSalary: z.string().optional(),
  hourlyRate: z.string().optional(),
  
  // Bank Details
  bankName: z.string().optional(),
  bankBranchLocation: z.string().optional(),
  bankAccountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankCode: z.string().optional(),
  branchCode: z.string().optional(),
  bankIdentifierCode: z.string().optional(),
  kraPin: z.string().optional(),
  
  // Mpesa Details
  mpesaName: z.string().optional(),
  mpesaNumber: z.string().optional(),
  mpesaPaymentStatus: z.string().default("inactive"),
  
  // Statutory
  shifNumber: z.string().optional(),
  nssfNumber: z.string().optional(),
  idNumber: z.string().optional(),

  // Academics
  achievements: z.array(z.string()).default([]),
  coursesTaken: z.array(z.string()).default([]),
  otherAcademics: z.string().optional(),

  // Next of Kin
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinMobile: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
  emergencyContactPerson: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
});

// Individual tab schemas for validation
const personalInfoSchema = employeeFormSchema.pick({
  firstName: true,
  secondName: true,
  otherName: true,
  officeEmail: true,
  personalEmail: true,
  dateOfBirth: true,
  gender: true,
  maritalStatus: true,
  phone: true,
  localAddress: true,
  permanentAddress: true,
  loginPassword: true,
});

const companyPaymentSchema = employeeFormSchema.pick({
  employeeId: true,
  department: true,
  designation: true,
  reportingTo: true,
  role: true,
  officeBranch: true,
  siteProject: true,
  dateOfJoining: true,
  contractStartDate: true,
  contractEndDate: true,
  exitDate: true,
  basicSalary: true,
  hourlyRate: true,
  bankName: true,
  bankBranchLocation: true,
  bankAccountHolderName: true,
  bankAccountNumber: true,
  bankCode: true,
  branchCode: true,
  bankIdentifierCode: true,
  kraPin: true,
  mpesaName: true,
  mpesaNumber: true,
  mpesaPaymentStatus: true,
  shifNumber: true,
  nssfNumber: true,
  idNumber: true,
});

const academicsSchema = employeeFormSchema.pick({
  achievements: true,
  coursesTaken: true,
  otherAcademics: true,
});

const nextOfKinSchema = employeeFormSchema.pick({
  nextOfKinName: true,
  nextOfKinRelationship: true,
  nextOfKinMobile: true,
  nextOfKinEmail: true,
  emergencyContactPerson: true,
  emergencyContactNumber: true,
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormTabsProps {
  onSubmit: (data: EmployeeFormData) => void;
  onTabSave?: (tabData: Partial<EmployeeFormData>, tabName: string) => void;
  initialData?: Partial<EmployeeFormData>;
  isEdit?: boolean;
  existingPhotoUrl?: string;
}

export function EmployeeFormTabs({ onSubmit, onTabSave, initialData, isEdit = false, existingPhotoUrl }: EmployeeFormTabsProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      secondName: "",
      otherName: "",
      officeEmail: "",
      personalEmail: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      phone: "",
      localAddress: "",
      permanentAddress: "",
      loginPassword: "",
      employeeId: "",
      department: "",
      designation: "",
      reportingTo: "",
      role: "employee",
      officeBranch: "",
      siteProject: "",
      dateOfJoining: "",
      contractStartDate: "",
      contractEndDate: "",
      exitDate: "",
      basicSalary: "",
      hourlyRate: "",
      bankName: "",
      bankBranchLocation: "",
      bankAccountHolderName: "",
      bankAccountNumber: "",
      bankCode: "",
      branchCode: "",
      bankIdentifierCode: "",
      kraPin: "",
      mpesaName: "",
      mpesaNumber: "",
      mpesaPaymentStatus: "inactive",
      shifNumber: "",
      nssfNumber: "",
      idNumber: "",
      achievements: [],
      coursesTaken: [],
      otherAcademics: "",
      nextOfKinName: "",
      nextOfKinRelationship: "",
      nextOfKinMobile: "",
      nextOfKinEmail: "",
      emergencyContactPerson: "",
      emergencyContactNumber: "",
      ...initialData,
    },
  });

  const handleSubmit = async (values: EmployeeFormData) => {
    // Handle passport photo upload for new employees
    if (passportPhoto && !isEdit) {
      try {
        const photoUrl = await uploadPassportPhoto(values.employeeId);
        (values as any).passportPhotoUrl = photoUrl;
        
        toast({
          title: "Photo Uploaded",
          description: "Passport photo uploaded successfully.",
        });
      } catch (photoError) {
        console.error('Error uploading passport photo:', photoError);
        toast({
          title: "Photo Upload Failed",
          description: "Failed to upload passport photo, but employee data will be saved.",
          variant: "destructive",
        });
      }
    }
    
    onSubmit(values);
    if (!isEdit) {
      form.reset();
      setPassportPhoto(null);
    }
  };

  const uploadPassportPhoto = async (employeeId: string): Promise<string | null> => {
    if (!passportPhoto) return null;
    
    try {
      const fileExt = passportPhoto.name.split('.').pop();
      const fileName = `${employeeId}_passport_${Date.now()}.${fileExt}`;
      const filePath = `${employeeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, passportPhoto);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading passport photo:', error);
      throw error;
    }
  };

  const handleTabSave = async (tabName: string, schema: z.ZodSchema) => {
    try {
      const currentValues = form.getValues();
      const validatedData = schema.parse(currentValues);
      
      // Handle passport photo upload for Personal Info tab
      if (tabName === "Personal Info" && passportPhoto && onTabSave) {
        let photoUrl = null;
        try {
          // Generate a temporary employee ID if not available
          const employeeId = currentValues.employeeId || `temp_${Date.now()}`;
          photoUrl = await uploadPassportPhoto(employeeId);
          
          // Add photo URL to validated data
          (validatedData as any).passportPhotoUrl = photoUrl;
          
          toast({
            title: "Photo Uploaded",
            description: "Passport photo uploaded successfully.",
          });
        } catch (photoError) {
          toast({
            title: "Photo Upload Failed",
            description: "Failed to upload passport photo, but other data will be saved.",
            variant: "destructive",
          });
        }
      }
      
      if (onTabSave) {
        onTabSave(validatedData, tabName);
      } else {
        toast({
          title: "Section Saved",
          description: `${tabName} information has been saved successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save section data.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="company">Company/Payment</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="nextofkin">Next of Kin</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <PersonalInfoTab 
              form={form} 
              passportPhoto={passportPhoto}
              setPassportPhoto={setPassportPhoto}
              existingPhotoUrl={existingPhotoUrl}
            />
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={() => handleTabSave("Personal Info", personalInfoSchema)}
                variant="outline"
              >
                Save Personal Info
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <CompanyPaymentTab form={form} />
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={() => handleTabSave("Company/Payment", companyPaymentSchema)}
                variant="outline"
              >
                Save Company/Payment Info
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="academics" className="space-y-4">
            <AcademicsTab form={form} />
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={() => handleTabSave("Academics", academicsSchema)}
                variant="outline"
              >
                Save Academic Info
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="nextofkin" className="space-y-4">
            <NextOfKinTab form={form} />
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={() => handleTabSave("Next of Kin", nextOfKinSchema)}
                variant="outline"
              >
                Save Next of Kin Info
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t-2">
          <div className="flex space-x-2">
            {activeTab !== "personal" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["personal", "company", "academics", "nextofkin"];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {activeTab !== "nextofkin" ? (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ["personal", "company", "academics", "nextofkin"];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit">
                {isEdit ? "Update Employee" : "Add Employee"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
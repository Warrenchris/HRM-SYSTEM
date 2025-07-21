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

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormTabsProps {
  onSubmit: (data: EmployeeFormData) => void;
  initialData?: Partial<EmployeeFormData>;
  isEdit?: boolean;
}

export function EmployeeFormTabs({ onSubmit, initialData, isEdit = false }: EmployeeFormTabsProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);

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

  const handleSubmit = (values: EmployeeFormData) => {
    onSubmit(values);
    if (!isEdit) {
      form.reset();
      setPassportPhoto(null);
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
            />
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <CompanyPaymentTab form={form} />
          </TabsContent>

          <TabsContent value="academics" className="space-y-4">
            <AcademicsTab form={form} />
          </TabsContent>

          <TabsContent value="nextofkin" className="space-y-4">
            <NextOfKinTab form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
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
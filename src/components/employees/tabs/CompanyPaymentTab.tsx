import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EmployeeFormData } from "../EmployeeFormTabs";
import { useDepartments, usePositions } from "@/hooks/usePositions";

interface CompanyPaymentTabProps {
  form: UseFormReturn<EmployeeFormData>;
}

export function CompanyPaymentTab({ form }: CompanyPaymentTabProps) {
  const { departments } = useDepartments();
  const selectedDepartment = form.watch("department");
  const { positions } = usePositions(selectedDepartment);

  // Reset designation when department changes
  const handleDepartmentChange = (value: string) => {
    form.setValue("department", value);
    form.setValue("designation", ""); // Reset designation when department changes
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Company/Payment/Statutory Details</h3>
      
      {/* Company Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Company Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID *</FormLabel>
                <FormControl>
                  <Input placeholder="EMP001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department *</FormLabel>
                <Select onValueChange={handleDepartmentChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedDepartment}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedDepartment 
                          ? "Select position" 
                          : "First select a department"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.title}>
                        {position.title}
                        {position.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {position.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reportingTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting To (Designation)</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Engineer Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="officeBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Branch/Location</FormLabel>
                <FormControl>
                  <Input placeholder="Nairobi HQ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="siteProject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site/Project</FormLabel>
                <FormControl>
                  <Input placeholder="Project Alpha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="dateOfJoining"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Joining *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Payment Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Payment Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basicSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Basic Salary (KSH)</FormLabel>
                <FormControl>
                  <Input placeholder="50000" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (KSH)</FormLabel>
                <FormControl>
                  <Input placeholder="500" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Bank Details */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Bank Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Equity Bank" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankBranchLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Location</FormLabel>
                <FormControl>
                  <Input placeholder="Nairobi Branch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bankAccountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Michael Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="bankCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Code</FormLabel>
                <FormControl>
                  <Input placeholder="68" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branchCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Code</FormLabel>
                <FormControl>
                  <Input placeholder="68001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankIdentifierCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Identifier Code</FormLabel>
                <FormControl>
                  <Input placeholder="EQBLKENA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="kraPin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KRA PIN</FormLabel>
              <FormControl>
                <Input placeholder="A001234567B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Mpesa Details */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Mpesa Details</h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="mpesaName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mpesa Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mpesaNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mpesa Number</FormLabel>
                <FormControl>
                  <Input placeholder="254700000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mpesaPaymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mpesa Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Statutory Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Statutory Information</h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="shifNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SHIF Number</FormLabel>
                <FormControl>
                  <Input placeholder="SH001234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nssfNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NSSF Number</FormLabel>
                <FormControl>
                  <Input placeholder="NS001234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
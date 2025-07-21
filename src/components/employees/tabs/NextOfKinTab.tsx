import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EmployeeFormData } from "../EmployeeFormTabs";

interface NextOfKinTabProps {
  form: UseFormReturn<EmployeeFormData>;
}

export function NextOfKinTab({ form }: NextOfKinTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Next of Kin Information</h3>
      
      {/* Next of Kin Details */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Next of Kin</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nextOfKinName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextOfKinRelationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
            name="nextOfKinMobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="+254 700 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextOfKinEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="jane.smith@email.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Emergency Contact</h4>
        <p className="text-sm text-muted-foreground">
          This contact will be reached in case of emergencies at work
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergencyContactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. James Wilson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+254 722 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h5 className="font-medium text-foreground mb-2">Important Notes:</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Please ensure all contact information is current and accurate</li>
          <li>• Emergency contacts will only be contacted in case of workplace emergencies</li>
          <li>• You can update this information at any time through HR</li>
          <li>• All information provided will be kept confidential</li>
        </ul>
      </div>
    </div>
  );
}
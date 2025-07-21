import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Upload, User } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeFormData } from "../EmployeeFormTabs";

interface PersonalInfoTabProps {
  form: UseFormReturn<EmployeeFormData>;
  passportPhoto: File | null;
  setPassportPhoto: (file: File | null) => void;
}

export function PersonalInfoTab({ form, passportPhoto, setPassportPhoto }: PersonalInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPassportPhoto(file);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
      
      {/* Passport Photo Upload */}
      <div className="flex items-center space-x-4">
        <Avatar className="w-24 h-24">
          {passportPhoto ? (
            <AvatarImage src={URL.createObjectURL(passportPhoto)} />
          ) : (
            <AvatarFallback className="bg-muted">
              <User className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Passport Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            Upload a clear passport-style photo (JPG, PNG)
          </p>
        </div>
      </div>

      {/* Names */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secondName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Second Name</FormLabel>
              <FormControl>
                <Input placeholder="Michael" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Name</FormLabel>
              <FormControl>
                <Input placeholder="Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Email Addresses */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="officeEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Email *</FormLabel>
              <FormControl>
                <Input placeholder="john.smith@company.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Email</FormLabel>
              <FormControl>
                <Input placeholder="john.smith@gmail.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Personal Details */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="separated">Separated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Information */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number *</FormLabel>
            <FormControl>
              <Input placeholder="+254 700 000 000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="localAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Current residential address..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permanentAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permanent Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Permanent home address..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Login Details */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Employee Account Login Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>Login Email</FormLabel>
            <Input 
              value={form.watch("officeEmail")} 
              disabled 
              className="bg-muted"
              placeholder="Will use office email address"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Office email will be used as login username
            </p>
          </div>
          <FormField
            control={form.control}
            name="loginPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter secure password" {...field} />
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
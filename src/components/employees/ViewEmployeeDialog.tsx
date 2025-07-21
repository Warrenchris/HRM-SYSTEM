import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Calendar, Building, User, CreditCard, GraduationCap, Users } from "lucide-react";

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export function ViewEmployeeDialog({ isOpen, onClose, employee }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800">Active</Badge>;
      case "on leave":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">On Leave</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Complete employee information and records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Header */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-20 h-20">
              <AvatarImage src={employee.passport_photo_url} />
              <AvatarFallback className="text-lg">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-semibold">
                  {employee.first_name} {employee.second_name} {employee.last_name} {employee.other_name}
                </h3>
                {getStatusBadge(employee.status)}
              </div>
              <p className="text-muted-foreground mb-1">ID: {employee.employee_id}</p>
              <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Office Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.office_email || employee.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Personal Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.personal_email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="mt-1">{employee.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                    <p className="mt-1">{employee.marital_status || 'Not specified'}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Local Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{employee.local_address || employee.address || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{employee.permanent_address || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="mt-1">{employee.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="mt-1">{employee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reporting To</label>
                    <p className="mt-1">{employee.reporting_to || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="mt-1">{employee.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Office Branch</label>
                    <p className="mt-1">{employee.office_branch || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Site/Project</label>
                    <p className="mt-1">{employee.site_project || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(employee.join_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contract Period</label>
                    <p className="mt-1">
                      {employee.contract_start_date && employee.contract_end_date 
                        ? `${new Date(employee.contract_start_date).toLocaleDateString()} - ${new Date(employee.contract_end_date).toLocaleDateString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Basic Salary</label>
                    <p className="mt-1">{employee.basic_salary ? `KES ${employee.basic_salary.toLocaleString()}` : 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                    <p className="mt-1">{employee.hourly_rate ? `KES ${employee.hourly_rate}` : 'Not set'}</p>
                  </div>
                </div>
                {employee.bank_name && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Bank Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Bank:</span> {employee.bank_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch:</span> {employee.bank_branch_location}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Account Holder:</span> {employee.bank_account_holder_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Account Number:</span> {employee.bank_account_number}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {employee.mpesa_name && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">M-Pesa Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span> {employee.mpesa_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Number:</span> {employee.mpesa_number}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span> {employee.mpesa_payment_status}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.achievements && employee.achievements.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Achievements</label>
                    <ul className="mt-1 list-disc list-inside text-sm space-y-1">
                      {employee.achievements.map((achievement: string, index: number) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {employee.courses_taken && employee.courses_taken.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Courses Taken</label>
                    <ul className="mt-1 list-disc list-inside text-sm space-y-1">
                      {employee.courses_taken.map((course: string, index: number) => (
                        <li key={index}>{course}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {employee.other_academics && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Other Academic Information</label>
                    <p className="mt-1 text-sm">{employee.other_academics}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next of Kin */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Next of Kin & Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Next of Kin</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span> {employee.next_of_kin_name || 'Not provided'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relationship:</span> {employee.next_of_kin_relationship || 'Not provided'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile:</span> {employee.next_of_kin_mobile || 'Not provided'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {employee.next_of_kin_email || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Emergency Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Person:</span> {employee.emergency_contact_person || employee.emergency_contact || 'Not provided'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Number:</span> {employee.emergency_contact_number || employee.emergency_phone || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
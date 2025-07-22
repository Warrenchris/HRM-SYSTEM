import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRightLeft, User, Package, MapPin } from "lucide-react";

const transferSchema = z.object({
  newEmployeeId: z.string().optional(),
  newStatus: z.string().min(1, "Status is required"),
  transferReason: z.string().min(1, "Transfer reason is required"),
  transferNotes: z.string().optional(),
  keepPreviousStatus: z.boolean().default(false),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
}

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  status: string;
  location: string;
  current_employee_id?: string;
  employee?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TransferAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onTransferComplete: () => void;
}

export function TransferAssetDialog({ 
  open, 
  onOpenChange, 
  asset, 
  onTransferComplete 
}: TransferAssetDialogProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      newEmployeeId: "",
      newStatus: "assigned",
      transferReason: "",
      transferNotes: "",
      keepPreviousStatus: false,
    },
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (asset?.current_employee_id) {
        fetchCurrentEmployee();
      }
    }
  }, [open, asset]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, department, position')
        .eq('status', 'active')
        .order('first_name');

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCurrentEmployee = async () => {
    if (!asset?.current_employee_id) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, department, position')
        .eq('id', asset.current_employee_id)
        .single();

      if (error) {
        console.error('Error fetching current employee:', error);
        return;
      }

      setCurrentEmployee(data);
    } catch (error) {
      console.error('Error fetching current employee:', error);
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    if (!asset) return;

    setIsSubmitting(true);

    try {
      // Get current user's employee ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "Unable to get current user information",
          variant: "destructive",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.employee_id) {
        toast({
          title: "Error",
          description: "Unable to get employee information",
          variant: "destructive",
        });
        return;
      }

      // Determine final status
      const finalStatus = data.keepPreviousStatus ? asset.status : data.newStatus;

      // Update the asset
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          current_employee_id: data.newEmployeeId || null,
          status: finalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', asset.id);

      if (updateError) {
        console.error('Error updating asset:', updateError);
        toast({
          title: "Error",
          description: "Failed to transfer asset",
          variant: "destructive",
        });
        return;
      }

      // Create transfer record
      const { error: transferError } = await supabase
        .from('asset_transfers')
        .insert({
          asset_id: asset.id,
          from_employee_id: asset.current_employee_id,
          to_employee_id: data.newEmployeeId || null,
          transfer_status: 'completed',
          previous_status: asset.status,
          transfer_reason: data.transferReason,
          transfer_notes: data.transferNotes,
          transferred_by: profile.employee_id,
        });

      if (transferError) {
        console.error('Error creating transfer record:', transferError);
        // Don't fail the whole operation for this
      }

      toast({
        title: "Asset Transferred Successfully",
        description: `${asset.name} has been transferred successfully.`,
      });

      form.reset();
      onTransferComplete();
    } catch (error) {
      console.error('Error transferring asset:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Asset
          </DialogTitle>
          <DialogDescription>
            Transfer {asset.name} ({asset.asset_tag}) to a new employee or change its status
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Summary */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium mb-3">Asset Information</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-muted-foreground">({asset.asset_tag})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{asset.location}</span>
                </div>
                {currentEmployee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Currently assigned to: {currentEmployee.first_name} {currentEmployee.last_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Transfer Details</h3>
              
              <FormField
                control={form.control}
                name="newEmployeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Assignee (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee or leave unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex flex-col items-start">
                              <span>{employee.first_name} {employee.last_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {employee.department} • {employee.position}
                              </span>
                            </div>
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
                name="newStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="under_repair">Under Repair</SelectItem>
                        <SelectItem value="disposed">Disposed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keepPreviousStatus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Keep previous status ({asset.status})
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Check this if you only want to change the assignee without changing the asset status
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transferReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Reason</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transfer reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee_request">Employee Request</SelectItem>
                        <SelectItem value="department_change">Department Change</SelectItem>
                        <SelectItem value="equipment_upgrade">Equipment Upgrade</SelectItem>
                        <SelectItem value="maintenance_required">Maintenance Required</SelectItem>
                        <SelectItem value="damage_repair">Damage/Repair</SelectItem>
                        <SelectItem value="end_of_lease">End of Lease</SelectItem>
                        <SelectItem value="employee_leaving">Employee Leaving</SelectItem>
                        <SelectItem value="reallocation">Reallocation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transferNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about this transfer..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transfer Summary */}
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30">
              <h4 className="font-medium text-sm mb-2">Transfer Summary</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">From: </span>
                  <span className="font-medium">
                    {currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name}` : "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span className="font-medium">
                    {form.watch("newEmployeeId") 
                      ? employees.find(e => e.id === form.watch("newEmployeeId"))?.first_name + " " + 
                        employees.find(e => e.id === form.watch("newEmployeeId"))?.last_name
                      : "Unassigned"
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className="font-medium">
                    {form.watch("keepPreviousStatus") ? asset.status : form.watch("newStatus")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1"
              >
                {isSubmitting ? "Completing Transfer..." : "Complete Transfer"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
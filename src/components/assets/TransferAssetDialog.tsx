import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightLeft, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const transferSchema = z.object({
  toEmployeeId: z.string().optional(),
  transferStatus: z.string().min(1, "Transfer status is required"),
  transferReason: z.string().optional(),
  transferNotes: z.string().optional(),
  keepPreviousStatus: z.boolean().default(false),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
}

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  status: string;
  current_employee_id?: string;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

interface TransferAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onTransferComplete: () => void;
}

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "return_to_store", label: "Return to Store" },
  { value: "write_off", label: "Write Off" },
];

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
      toEmployeeId: "",
      transferStatus: asset.status,
      transferReason: "",
      transferNotes: "",
      keepPreviousStatus: false,
    },
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchCurrentEmployee();
    }
  }, [open, asset.current_employee_id]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      toast({
        title: "Error fetching employees",
        description: "Could not load employees. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchCurrentEmployee = async () => {
    if (!asset.current_employee_id) {
      setCurrentEmployee(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position')
        .eq('id', asset.current_employee_id)
        .single();

      if (error) throw error;
      setCurrentEmployee(data);
    } catch (error) {
      console.error('Error fetching current employee:', error);
      setCurrentEmployee(null);
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get current user's employee record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      // Determine the final status
      const finalStatus = data.keepPreviousStatus ? asset.status : data.transferStatus;

      // Update asset
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          current_employee_id: data.toEmployeeId || null,
          status: finalStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);

      if (assetError) throw assetError;

      // Create transfer record
      const { error: transferError } = await supabase
        .from('asset_transfers')
        .insert({
          asset_id: asset.id,
          from_employee_id: asset.current_employee_id || null,
          to_employee_id: data.toEmployeeId || null,
          transfer_status: finalStatus,
          previous_status: data.keepPreviousStatus ? null : asset.status,
          transfer_reason: data.transferReason,
          transfer_notes: data.transferNotes,
          transferred_by: profile.employee_id,
        });

      if (transferError) throw transferError;

      toast({
        title: "Asset Transfer Successful",
        description: `${asset.name} has been transferred successfully.`,
      });

      form.reset();
      onTransferComplete();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "Could not complete the asset transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStatus = form.watch('transferStatus');
  const keepPreviousStatus = form.watch('keepPreviousStatus');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Asset
          </DialogTitle>
          <DialogDescription>
            Transfer {asset.name} ({asset.asset_tag}) to another employee or change its status.
          </DialogDescription>
        </DialogHeader>

        {/* Asset Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{asset.name}</h4>
              <p className="text-sm text-muted-foreground">{asset.asset_tag}</p>
            </div>
            <Badge variant="outline">{asset.status}</Badge>
          </div>
          {currentEmployee && (
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Currently assigned to: </span>
              <span className="font-medium">
                {currentEmployee.first_name} {currentEmployee.last_name}
              </span>
              <span className="text-muted-foreground">
                {" "}({currentEmployee.position}, {currentEmployee.department})
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="toEmployeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer To (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee or leave empty to unassign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassign (Return to inventory)</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>
                              {employee.first_name} {employee.last_name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              ({employee.position}, {employee.department})
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

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="transferStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keep Previous Status Option */}
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
                      Transfer previous status to next employee
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      If checked, the asset will keep its current status ({asset.status}) 
                      instead of changing to "{statusOptions.find(s => s.value === selectedStatus)?.label}"
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Transfer Reason */}
            <FormField
              control={form.control}
              name="transferReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Reason (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Other/Not specified</SelectItem>
                      <SelectItem value="employee_departure">Employee Departure</SelectItem>
                      <SelectItem value="role_change">Role Change</SelectItem>
                      <SelectItem value="equipment_upgrade">Equipment Upgrade</SelectItem>
                      <SelectItem value="maintenance_required">Maintenance Required</SelectItem>
                      <SelectItem value="repair_needed">Repair Needed</SelectItem>
                      <SelectItem value="department_transfer">Department Transfer</SelectItem>
                      <SelectItem value="project_completion">Project Completion</SelectItem>
                      <SelectItem value="asset_retirement">Asset Retirement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Notes */}
            <FormField
              control={form.control}
              name="transferNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes about this transfer..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Preview */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transfer Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Final Status: </span>
                  <Badge variant="outline">
                    {keepPreviousStatus 
                      ? asset.status 
                      : statusOptions.find(s => s.value === selectedStatus)?.label
                    }
                  </Badge>
                </p>
                {keepPreviousStatus && (
                  <p className="text-amber-600 text-xs">
                    Note: Previous status will be maintained instead of changing to "{statusOptions.find(s => s.value === selectedStatus)?.label}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1"
              >
                {isSubmitting ? "Processing Transfer..." : "Complete Transfer"}
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

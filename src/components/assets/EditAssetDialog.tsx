import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Package, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const assetSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters"),
  assetTag: z.string().min(3, "Asset tag is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  assignedTo: z.string().optional(),
  purchaseDate: z.date({ required_error: "Purchase date is required" }),
  purchaseValue: z.number().min(0, "Purchase value must be positive"),
  vendor: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyDate: z.date().optional(),
  condition: z.string().min(1, "Condition is required"),
  description: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  location: string;
  status: string;
  condition: string;
  current_employee_id?: string;
  purchase_date: string;
  purchase_value: number;
  vendor?: string;
  serial_number?: string;
  warranty_date?: string;
  description?: string;
}

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onEditComplete: () => void;
}

export function EditAssetDialog({ open, onOpenChange, asset, onEditComplete }: EditAssetDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const { user } = useAuth();
  const [canManageAssets, setCanManageAssets] = useState<boolean>(false);
  const [checkingPermissions, setCheckingPermissions] = useState<boolean>(true);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      assetTag: "",
      category: "",
      location: "",
      assignedTo: "unassigned",
      vendor: "",
      serialNumber: "",
      condition: "",
      description: "",
      purchaseValue: 0,
    },
  });

  // Check if current user has permissions per RLS (admin or hr)
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        setCheckingPermissions(true);
        if (!user) {
          if (isMounted) setCanManageAssets(false);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (isMounted) setCanManageAssets(profile?.role === 'admin' || profile?.role === 'hr');
      } finally {
        if (isMounted) setCheckingPermissions(false);
      }
    };
    check();
    return () => { isMounted = false; };
  }, [user]);

  // Fetch employees for assignment dropdown
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Populate form when asset changes
  useEffect(() => {
    if (asset && open) {
      form.reset({
        name: asset.name,
        assetTag: asset.asset_tag,
        category: asset.category,
        location: asset.location,
        assignedTo: asset.current_employee_id || "unassigned",
        purchaseDate: new Date(asset.purchase_date),
        purchaseValue: asset.purchase_value,
        vendor: asset.vendor || "",
        serialNumber: asset.serial_number || "",
        warrantyDate: asset.warranty_date ? new Date(asset.warranty_date) : undefined,
        condition: asset.condition,
        description: asset.description || "",
      });
    }
  }, [asset, open, form]);

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

  const onSubmit = async (data: AssetFormData) => {
    if (!asset) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        name: data.name,
        asset_tag: data.assetTag,
        category: data.category,
        location: data.location,
        current_employee_id: data.assignedTo === "unassigned" ? null : data.assignedTo || null,
        purchase_date: data.purchaseDate.toISOString(),
        purchase_value: data.purchaseValue,
        vendor: data.vendor || null,
        serial_number: data.serialNumber || null,
        warranty_date: data.warrantyDate ? data.warrantyDate.toISOString() : null,
        condition: data.condition,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset.id);

      if (error) {
        console.error('Error updating asset:', error);
        toast({
          title: "Error",
          description: "Failed to update asset",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Asset updated successfully",
      });

      onEditComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageAssets && !checkingPermissions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to edit assets. Please contact your administrator.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Asset
          </DialogTitle>
          <DialogDescription>
            Update the details for {asset.name} ({asset.asset_tag})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto">
          <Form {...form}>
            <form id="edit-asset-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter asset name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assetTag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Tag</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. IT-2025-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                            <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                            <SelectItem value="Vehicles">Vehicles</SelectItem>
                            <SelectItem value="Machinery">Machinery</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Head Office">Head Office</SelectItem>
                            <SelectItem value="IT Storage">IT Storage</SelectItem>
                            <SelectItem value="HR Department">HR Department</SelectItem>
                            <SelectItem value="Finance Department">Finance Department</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                            <SelectItem value="Branch Office">Branch Office</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee or leave unassigned" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
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
              </div>

              {/* Purchase Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Purchase Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purchaseValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Value (KSh)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vendor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Warranty Expiry (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Condition and Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Condition and Details</h3>
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number if available" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about the asset, specifications, etc."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <div className="flex gap-3 pt-4 flex-shrink-0 border-t bg-background">
          <Button 
            type="submit" 
            disabled={isSubmitting || checkingPermissions || !canManageAssets} 
            className="flex-1"
            form="edit-asset-form"
          >
            {isSubmitting ? "Updating Asset..." : "Update Asset"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
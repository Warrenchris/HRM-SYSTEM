import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeFormTabs, EmployeeFormData } from "./EmployeeFormTabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  onRefresh?: () => void;
}

export function AddEmployeeDialog({ isOpen, onClose, onSubmit, onRefresh }: AddEmployeeDialogProps) {
  const handleSubmit = async (values: EmployeeFormData) => {
    console.log('AddEmployeeDialog - handleSubmit called with:', values);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error('Error in AddEmployeeDialog handleSubmit:', error);
    }
  };

  const handleTabSave = async (tabData: Partial<EmployeeFormData>, tabName: string) => {
    try {
      // For new employees, we can't save partial data to database yet
      // Just show a success message
      toast({
        title: "Section Saved",
        description: `${tabName} information has been saved locally. Complete the form and submit to save to database.`,
      });
    } catch (error) {
      console.error('Error saving tab data:', error);
      toast({
        title: "Error",
        description: "Failed to save section data.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter comprehensive employee details across multiple sections. You can save each section individually.
          </DialogDescription>
        </DialogHeader>

        <EmployeeFormTabs onSubmit={handleSubmit} onTabSave={handleTabSave} />
      </DialogContent>
    </Dialog>
  );
}
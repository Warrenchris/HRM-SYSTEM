import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeFormTabs, EmployeeFormData } from "./EmployeeFormTabs";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
}

export function AddEmployeeDialog({ isOpen, onClose, onSubmit }: AddEmployeeDialogProps) {
  const handleSubmit = (values: EmployeeFormData) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter comprehensive employee details across multiple sections.
          </DialogDescription>
        </DialogHeader>

        <EmployeeFormTabs onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
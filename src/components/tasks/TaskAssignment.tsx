import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusIcon, XIcon, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmployeesList } from "@/hooks/queries/useEmployeesQuery";
import { useCreateTaskMutation } from "@/hooks/queries/useTasksQuery";

export function TaskAssignment() {
  const [dueDate, setDueDate] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [employeeComboOpen, setEmployeeComboOpen] = useState(false);
  const { toast } = useToast();
  
  // Use optimized employee query
  const { data: employees = [], isLoading: employeesLoading } = useEmployeesList({ status: 'active' });
  const createTaskMutation = useCreateTaskMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    complexity_level: "medium",
    estimated_hours: "",
    department: "",
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get current user's employee ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const taskData = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        assigned_by: profile.employee_id,
        priority: formData.priority,
        complexity_level: formData.complexity_level,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
        department: formData.department,
        due_date: dueDate?.toISOString() || '',
        tags: tags,
        status: 'pending',
        progress_percentage: 0,
        attachments: [],
      };

      await createTaskMutation.mutateAsync(taskData);

      toast({
        title: "Success",
        description: "Task assigned successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        complexity_level: "medium",
        estimated_hours: "",
        department: "",
      });
      setDueDate(undefined);
      setTags([]);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Assign New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <Popover open={employeeComboOpen} onOpenChange={setEmployeeComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeComboOpen}
                    className="w-full justify-between"
                  >
                    {formData.assigned_to
                      ? employees.find((employee) => employee.id === formData.assigned_to)
                          ? `${employees.find((employee) => employee.id === formData.assigned_to)?.first_name} ${employees.find((employee) => employee.id === formData.assigned_to)?.last_name} - ${employees.find((employee) => employee.id === formData.assigned_to)?.position}`
                          : "Select employee..."
                      : "Select employee..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search employees..." />
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {employees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.first_name} ${employee.last_name} ${employee.position}`}
                          onSelect={() => {
                            setFormData({ ...formData, assigned_to: employee.id });
                            setEmployeeComboOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.assigned_to === employee.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {employee.first_name} {employee.last_name} - {employee.position}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task requirements and expectations"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity Level</label>
              <Select 
                value={formData.complexity_level} 
                onValueChange={(value) => setFormData({ ...formData, complexity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="e.g., 8"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={createTaskMutation.isPending || employeesLoading} className="w-full">
            {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
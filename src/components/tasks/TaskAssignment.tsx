import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusIcon, XIcon, ChevronsUpDown } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmployeesList } from "@/hooks/queries/useEmployeesQuery";
import { useCreateTaskMutation } from "@/hooks/queries/useTasksQuery";
import { useAuth } from "@/contexts/AuthContext";

// Simple employee selector that doesn't use cmdk to avoid the error
const SimpleEmployeeSelector = React.memo(({ 
  employees, 
  selectedEmployeeId, 
  onSelect, 
  onClose 
}: {
  employees: any[];
  selectedEmployeeId: string;
  onSelect: (employeeId: string) => void;
  onClose: () => void;
}) => {
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const [searchTerm, setSearchTerm] = useState('');
  
  if (safeEmployees.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No employees available
      </div>
    );
  }

  const filteredEmployees = safeEmployees.filter(employee => 
    employee && 
    typeof employee === 'object' &&
    employee.id && // Ensure employee has an ID
    `${employee.first_name || ''} ${employee.last_name || ''} ${employee.position || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="max-h-60 overflow-y-auto space-y-1">
        {filteredEmployees.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No employees found matching "{searchTerm}"
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                selectedEmployeeId === employee.id ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                onSelect(employee.id);
                onClose();
              }}
            >
              <div className="flex items-center justify-between">
                <span>{employee.first_name || ''} {employee.last_name || ''}</span>
                <span className="text-xs text-muted-foreground">{employee.position || ''}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
});

SimpleEmployeeSelector.displayName = 'SimpleEmployeeSelector';

export function TaskAssignment() {
  const [dueDate, setDueDate] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [employeeComboOpen, setEmployeeComboOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [role, setRole] = useState<"employee" | "manager" | "hr" | "admin" | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [allowedEmployeeIds, setAllowedEmployeeIds] = useState<Set<string>>(new Set());
  
  // Use optimized employee query
  const { data: employees, isLoading: employeesLoading, isError: employeesError } = useEmployeesList({ status: 'active' });
  
  // Ensure employees is always an array to prevent errors
  const safeEmployees = React.useMemo(() => {
    if (!Array.isArray(employees)) return [];
    
    // Filter out any invalid employee objects
    return employees.filter(emp => 
      emp && 
      typeof emp === 'object' && 
      emp.id && 
      typeof emp.id === 'string' &&
      (emp.first_name || emp.last_name || emp.position)
    );
  }, [employees]);
  
  // Simple check for when we can render the employee selector
  const canRenderSelector = !employeesLoading && !employeesError && safeEmployees.length > 0 && Array.isArray(employees);
  
  // Debug logging to help identify the issue (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('TaskAssignment render:', {
      employees,
      safeEmployees,
      employeesLoading,
      employeesError,
      canRenderSelector,
      employeeComboOpen
    });
  }
  
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

  // Load current user's role and allowed subordinates via organization_positions
  useEffect(() => {
    const loadRoleAndHierarchy = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setRole(null);
          setCurrentEmployeeId(null);
          setAllowedEmployeeIds(new Set());
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, employee_id')
          .eq('user_id', authUser.id)
          .single();
        const userRole = (profile?.role as any) || 'employee';
        setRole(userRole);
        const empId = profile?.employee_id || null;
        setCurrentEmployeeId(empId);

        // Admin can assign to anyone
        if (userRole === 'admin') {
          setAllowedEmployeeIds(new Set(safeEmployees.map(e => e.id)));
          return;
        }

        // Fetch org positions to compute descendants of the current user's position
        const { data: positions } = await supabase
          .from('organization_positions')
          .select('id, parent_position_id, employee_id, is_active')
          .eq('is_active', true);

        if (!positions || !empId) {
          setAllowedEmployeeIds(new Set());
          return;
        }

        const byEmployee: Record<string, any | undefined> = {};
        for (const p of positions) byEmployee[p.employee_id || ''] = p;
        const myPos = byEmployee[empId];
        if (!myPos) {
          setAllowedEmployeeIds(new Set());
          return;
        }

        const childrenMap = new Map<string, any[]>();
        for (const p of positions) {
          const parentId = p.parent_position_id || '';
          const arr = childrenMap.get(parentId) || [];
          arr.push(p);
          childrenMap.set(parentId, arr);
        }

        const stack = [myPos.id as string];
        const descendantEmployeeIds: string[] = [];
        while (stack.length) {
          const current = stack.pop() as string;
          const kids = childrenMap.get(current) || [];
          for (const kid of kids) {
            if (kid.employee_id) descendantEmployeeIds.push(kid.employee_id);
            if (kid.id) stack.push(kid.id);
          }
        }

        setAllowedEmployeeIds(new Set(descendantEmployeeIds));
      } catch {
        setAllowedEmployeeIds(new Set());
      }
    };
    loadRoleAndHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, safeEmployees.length]);

  const canAssign = useMemo(() => role === 'admin' || role === 'manager' || role === 'hr', [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!canAssign) {
        toast({ title: "Not allowed", description: "You don't have permission to assign tasks.", variant: "destructive" });
        return;
      }
      if (role !== 'admin' && formData.assigned_to && !allowedEmployeeIds.has(formData.assigned_to)) {
        toast({ title: "Invalid assignment", description: "You can only assign tasks to your subordinates.", variant: "destructive" });
        return;
      }

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

  if (!canAssign) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Assign New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Only managers, HR, and admins can assign tasks. Managers and HR may only assign to their subordinates.
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <Popover 
                open={employeeComboOpen && canRenderSelector} 
                onOpenChange={(open) => {
                  if (open && !canRenderSelector) {
                    // Don't open if we don't have valid data
                    return;
                  }
                  setEmployeeComboOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeComboOpen}
                    className="w-full justify-between"
                    disabled={employeesLoading || !canRenderSelector}
                  >
                    {formData.assigned_to
                      ? safeEmployees.find((employee) => employee.id === formData.assigned_to)
                          ? `${safeEmployees.find((employee) => employee.id === formData.assigned_to)?.first_name} ${safeEmployees.find((employee) => employee.id === formData.assigned_to)?.last_name} - ${safeEmployees.find((employee) => employee.id === formData.assigned_to)?.position}`
                          : "Select employee..."
                      : "Select employee..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  {employeesLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading employees...
                    </div>
                  ) : safeEmployees.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {employeesError ? 'Error loading employees' : 'No employees found'}
                    </div>
                  ) : canRenderSelector && employeeComboOpen ? (
                    <div className="w-full">
                      <SimpleEmployeeSelector
                        employees={safeEmployees.filter(e => role === 'admin' ? true : allowedEmployeeIds.has(e.id))}
                        selectedEmployeeId={formData.assigned_to}
                        onSelect={(employeeId) => setFormData({ ...formData, assigned_to: employeeId })}
                        onClose={() => setEmployeeComboOpen(false)}
                      />
                    </div>
                  ) : null}
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
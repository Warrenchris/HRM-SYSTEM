import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EscalatedTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  complexity_level: string;
  escalation_reason: string;
  escalated_at: string;
  due_date: string;
  assigned_to: string;
  employee_assigned?: {
    first_name: string;
    last_name: string;
  };
  employee_escalated_to?: {
    first_name: string;
    last_name: string;
  };
  employee_assigner?: {
    first_name: string;
    last_name: string;
  };
}

export function TaskEscalation() {
  const [escalatedTasks, setEscalatedTasks] = useState<EscalatedTask[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<EscalatedTask | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEscalatedTasks();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .eq('status', 'active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEscalatedTasks = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id, role')
        .eq('user_id', user.user.id)
        .single();

      if (!profile) return;

      let query = supabase
        .from('tasks')
        .select(`
          *,
          employee_assigned:employees!tasks_assigned_to_fkey(first_name, last_name),
          employee_escalated_to:employees!tasks_escalated_to_fkey(first_name, last_name),
          employee_assigner:employees!tasks_assigned_by_fkey(first_name, last_name)
        `)
        .eq('status', 'escalated');

      // If not admin/manager, only show escalations relevant to the user
      if (!['admin', 'hr', 'manager'].includes(profile.role)) {
        query = query.or(`assigned_to.eq.${profile.employee_id},assigned_by.eq.${profile.employee_id},escalated_to.eq.${profile.employee_id}`);
      }

      const { data, error } = await query.order('escalated_at', { ascending: false });

      if (error) throw error;
      setEscalatedTasks(data || []);
    } catch (error) {
      console.error('Error fetching escalated tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load escalated tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reassignTask = async (taskId: string, newAssigneeId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          assigned_to: newAssigneeId,
          status: 'pending',
          escalated_to: null,
          escalation_reason: null,
          escalated_at: null,
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task reassigned successfully",
      });

      fetchEscalatedTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error reassigning task:', error);
      toast({
        title: "Error",
        description: "Failed to reassign task",
        variant: "destructive",
      });
    }
  };

  const resolveEscalation = async (taskId: string, resolution: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'in-progress',
          escalated_to: null,
          escalation_reason: null,
          escalated_at: null,
        })
        .eq('id', taskId);

      if (error) throw error;

      // Note: Task comments functionality removed
      console.log(`Escalation resolved for task ${taskId}: ${resolution}`);

      toast({
        title: "Success",
        description: "Escalation resolved successfully",
      });

      fetchEscalatedTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error resolving escalation:', error);
      toast({
        title: "Error",
        description: "Failed to resolve escalation",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading escalated tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Escalated Tasks ({escalatedTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {escalatedTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No escalated tasks found.
            </p>
          ) : (
            <div className="space-y-4">
              {escalatedTasks.map((task) => (
                <div key={task.id} className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {task.title}
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Originally assigned: {task.employee_assigned?.first_name} {task.employee_assigned?.last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Escalated: {format(new Date(task.escalated_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {task.due_date && (
                          <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                        >
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Manage Escalated Task
                          </DialogTitle>
                        </DialogHeader>
                        <EscalationManagement 
                          task={task}
                          employees={employees}
                          onReassign={reassignTask}
                          onResolve={resolveEscalation}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="bg-orange-100 border border-orange-300 rounded p-3">
                    <h4 className="font-medium text-orange-800 mb-1">Escalation Reason</h4>
                    <p className="text-sm text-orange-700">{task.escalation_reason}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span>Complexity: <span className="font-medium">{task.complexity_level}</span></span>
                      {task.employee_escalated_to && (
                        <span>
                          Escalated to: <span className="font-medium">
                            {task.employee_escalated_to.first_name} {task.employee_escalated_to.last_name}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      By: {task.employee_assigner?.first_name} {task.employee_assigner?.last_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EscalationManagement({ 
  task, 
  employees, 
  onReassign, 
  onResolve 
}: { 
  task: EscalatedTask;
  employees: any[];
  onReassign: (taskId: string, newAssigneeId: string) => void;
  onResolve: (taskId: string, resolution: string) => void;
}) {
  const [newAssignee, setNewAssignee] = useState("");
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState<'reassign' | 'resolve' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'reassign' && newAssignee) {
      onReassign(task.id, newAssignee);
    } else if (action === 'resolve' && resolution.trim()) {
      onResolve(task.id, resolution.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Task Details</h4>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="bg-orange-50 border border-orange-200 rounded p-3">
          <h5 className="font-medium text-orange-800">Escalation Reason</h5>
          <p className="text-sm text-orange-700">{task.escalation_reason}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant={action === 'reassign' ? 'default' : 'outline'}
          onClick={() => setAction('reassign')}
          className="w-full"
        >
          Reassign Task
        </Button>
        <Button 
          variant={action === 'resolve' ? 'default' : 'outline'}
          onClick={() => setAction('resolve')}
          className="w-full"
        >
          Resolve & Continue
        </Button>
      </div>

      {action && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'reassign' && (
            <div>
              <label className="text-sm font-medium">Reassign to</label>
              <Select value={newAssignee} onValueChange={setNewAssignee} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(emp => emp.id !== task.assigned_to)
                    .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'resolve' && (
            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the escalation was resolved..."
                required
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={
              (action === 'reassign' && !newAssignee) || 
              (action === 'resolve' && !resolution.trim())
            }>
              {action === 'reassign' ? 'Reassign Task' : 'Resolve Escalation'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
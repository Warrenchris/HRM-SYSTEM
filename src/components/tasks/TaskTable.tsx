import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Edit, AlertTriangle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress_percentage: number;
  complexity_level: string;
  due_date: string;
  assigned_to: string;
  assigned_by: string;
  employee_assigned?: {
    first_name: string;
    last_name: string;
  };
  employee_assigner?: {
    first_name: string;
    last_name: string;
  };
  escalated_to?: string;
  escalation_reason?: string;
}

interface TaskTableProps {
  viewType: 'my-tasks' | 'assigned';
}

export function TaskTable({ viewType }: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [viewType]);

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

  const fetchTasks = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('employee_id, role')
        .eq('user_id', user.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      if (!profile?.employee_id) {
        console.log('User profile has no employee_id assigned');
        toast({
          title: "Setup Required",
          description: "Your account is not linked to an employee record. Please contact your administrator.",
          variant: "destructive",
        });
        setTasks([]);
        return;
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          employee_assigned:employees!tasks_assigned_to_fkey(first_name, last_name),
          employee_assigner:employees!tasks_assigned_by_fkey(first_name, last_name)
        `);

      if (viewType === 'my-tasks') {
        query = query.eq('assigned_to', profile.employee_id);
      } else {
        query = query.eq('assigned_by', profile.employee_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Tasks query error:', error);
        throw error;
      }
      
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    if (!selectedTask) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile?.employee_id) {
        toast({
          title: "Error",
          description: "Your account is not linked to an employee record",
          variant: "destructive",
        });
        return;
      }

      const updates: any = {
        progress_percentage: progress,
        status,
      };

      if (status === 'in-progress' && selectedTask.status === 'pending') {
        updates.started_at = new Date().toISOString();
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Note: Task comments functionality removed
      if (comment.trim()) {
        console.log(`Comment for task ${selectedTask.id}: ${comment.trim()}`);
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      fetchTasks();
      setSelectedTask(null);
      setComment("");
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const escalateTask = async (escalatedTo: string, reason: string) => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'escalated',
          escalated_to: escalatedTo,
          escalation_reason: reason,
          escalated_at: new Date().toISOString(),
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task escalated successfully",
      });

      fetchTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error escalating task:', error);
      toast({
        title: "Error",
        description: "Failed to escalate task",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'escalated': return 'bg-orange-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-amber-500';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {viewType === 'my-tasks' ? 'My Tasks' : 'Tasks I Assigned'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tasks found.
            </p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {viewType === 'my-tasks' ? (
                          <span>Assigned by: {task.employee_assigner?.first_name} {task.employee_assigner?.last_name}</span>
                        ) : (
                          <span>Assigned to: {task.employee_assigned?.first_name} {task.employee_assigned?.last_name}</span>
                        )}
                        {task.due_date && (
                          <span>• Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress_percentage}%</span>
                    </div>
                    <Progress value={task.progress_percentage} />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Complexity: {task.complexity_level}</span>
                      {task.escalated_to && (
                        <span className="text-orange-600">• Escalated</span>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setProgress(task.progress_percentage);
                            setStatus(task.status);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{task.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>

                          {viewType === 'my-tasks' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Progress %</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Add Comment</label>
                                <Textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Add a progress update or comment..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={updateTask}>Update Task</Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Escalate
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Escalate Task</DialogTitle>
                                    </DialogHeader>
                                    <EscalationForm 
                                      employees={employees}
                                      onEscalate={escalateTask}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </>
                          )}

                          {task.escalation_reason && (
                            <div className="bg-orange-50 border border-orange-200 rounded p-3">
                              <h4 className="font-medium text-orange-800">Escalation Reason</h4>
                              <p className="text-sm text-orange-700">{task.escalation_reason}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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

function EscalationForm({ employees, onEscalate }: { employees: any[], onEscalate: (to: string, reason: string) => void }) {
  const [escalatedTo, setEscalatedTo] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escalatedTo && reason.trim()) {
      onEscalate(escalatedTo, reason.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Escalate To</label>
        <Select value={escalatedTo} onValueChange={setEscalatedTo} required>
          <SelectTrigger>
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name} - {employee.position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Escalation Reason</label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this task needs escalation..."
          required
        />
      </div>
      <Button type="submit" disabled={!escalatedTo || !reason.trim()}>
        Escalate Task
      </Button>
    </form>
  );
}
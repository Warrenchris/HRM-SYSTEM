import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Plus, CalendarIcon, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useObjectivesQuery } from "@/hooks/queries/usePerformanceQueries";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: "performance" | "development" | "behavioral" | "financial";
  priority: "high" | "medium" | "low";
  status: "not-started" | "in-progress" | "completed" | "overdue";
  progress: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  dueDate: string;
  assignedBy: string;
  employee: string;
}

export function GoalTracking() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalPriority, setGoalPriority] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const { toast } = useToast();

  const { data: objectives = [] } = useObjectivesQuery();
  const goals: Goal[] = (objectives || []).map((o) => ({
    id: o.id,
    title: o.objective_title,
    description: o.objective_description || "",
    category: "performance",
    priority: "medium",
    status: (o.manager_rating ?? 0) >= 4 ? "completed" : (o.employee_rating ?? 0) >= 2 ? "in-progress" : "not-started",
    progress: Math.min(100, Math.max(o.manager_rating ?? 0, o.employee_rating ?? 0) * 20),
    startDate: new Date(o.updated_at).toISOString().slice(0, 10),
    dueDate: new Date(o.updated_at).toISOString().slice(0, 10),
    assignedBy: "",
    employee: "",
  }));

  const employees = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Brown"];

  const getCategoryColor = (category: Goal["category"]) => {
    switch (category) {
      case "performance":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "development":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "behavioral":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "financial":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    }
  };

  const getStatusBadge = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case "not-started":
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityIcon = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <AlertCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const handleCreateGoal = () => {
    if (!goalTitle || !goalCategory || !goalPriority || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal Created",
      description: `Goal "${goalTitle}" has been created successfully`,
    });

    // Reset form
    setGoalTitle("");
    setGoalDescription("");
    setGoalCategory("");
    setGoalPriority("");
    setDueDate(undefined);
    setIsDialogOpen(false);
  };

  const filteredGoals = goals.filter(goal => {
    const statusMatch = selectedFilter === "all" || goal.status === selectedFilter;
    const employeeMatch = selectedEmployee === "all" || goal.employee === selectedEmployee;
    return statusMatch && employeeMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Tracking
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goal-title">Goal Title *</Label>
                      <Input
                        id="goal-title"
                        placeholder="Enter goal title"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        placeholder="Describe the goal in detail"
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category *</Label>
                        <Select value={goalCategory} onValueChange={setGoalCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Priority *</Label>
                        <Select value={goalPriority} onValueChange={setGoalPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Due Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Select due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateGoal}>
                        Create Goal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        {getPriorityIcon(goal.priority)}
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {goal.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Assigned to: {goal.employee}</span>
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                        <span>By: {goal.assignedBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(goal.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    
                    {goal.targetValue && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Target: {goal.targetValue} {goal.unit}</span>
                        <span>Current: {goal.currentValue} {goal.unit}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Update Progress
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGoals.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No goals found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
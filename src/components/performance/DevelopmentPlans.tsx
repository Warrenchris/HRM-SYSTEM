import { useState, useEffect } from "react";
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
import { GraduationCap, Plus, CalendarIcon, BookOpen, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDevelopmentPlanMilestonesQuery, useDevelopmentPlansQuery } from "@/hooks/queries/usePerformanceQueries";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { supabase } from "@/integrations/supabase/client";

interface DevelopmentPlan {
  id: string;
  employeeName: string;
  employeeId: string;
  title: string;
  description: string;
  category: "technical" | "leadership" | "soft-skills" | "certification";
  priority: "high" | "medium" | "low";
  status: "not-started" | "in-progress" | "completed" | "on-hold";
  progress: number;
  startDate: string;
  targetDate: string;
  mentor?: string;
  budget?: number;
  resources: string[];
  milestones: { title: string; completed: boolean; dueDate: string }[];
}

export function DevelopmentPlans() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planCategory, setPlanCategory] = useState("");
  const [planPriority, setPlanPriority] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [planBudget, setPlanBudget] = useState("");
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { employee } = useCurrentEmployee();
  const [role, setRole] = useState<"employee" | "manager" | "hr" | "admin" | "ceo" | "owner" | null>(null);
  const { data: planRows = [] } = useDevelopmentPlansQuery();
  const planIds = useMemo(() => planRows.map(p => p.id), [planRows]);
  const { data: milestoneRows = [] } = useDevelopmentPlanMilestonesQuery(planIds);

  const milestonesByPlan = useMemo(() => {
    const map: Record<string, { title: string; completed: boolean; dueDate: string }[]> = {};
    (milestoneRows || []).forEach(m => {
      (map[m.plan_id] ||= []).push({ title: m.title, completed: m.completed, dueDate: m.due_date });
    });
    return map;
  }, [milestoneRows]);

  const developmentPlans: DevelopmentPlan[] = (planRows || []).map(p => ({
    id: p.id,
    employeeName: '',
    employeeId: p.employee_id,
    title: p.title,
    description: p.description,
    category: p.category,
    priority: p.priority,
    status: p.status,
    progress: p.progress,
    startDate: p.start_date,
    targetDate: p.target_date,
    mentor: p.mentor || undefined,
    budget: p.budget || undefined,
    resources: [],
    milestones: milestonesByPlan[p.id] || [],
  }));

  const employees: string[] = [];

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .single();
        setRole((profile?.role as any) || 'employee');
      } catch (e) {
        setRole('employee');
      }
    };
    fetchRole();
  }, []);

  const canManagePerformance = role === 'manager' || role === 'hr' || role === 'admin' || role === 'ceo' || role === 'owner';

  const getCategoryColor = (category: DevelopmentPlan["category"]) => {
    switch (category) {
      case "technical":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "leadership":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "soft-skills":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "certification":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    }
  };

  const getStatusBadge = (status: DevelopmentPlan["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">On Hold</Badge>;
      case "not-started":
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const handleCreatePlan = async () => {
    if (!canManagePerformance) return;
    if (!planTitle || !planCategory || !planPriority || !targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!employee?.id) {
      toast({
        title: "No employee context",
        description: "Could not resolve the current employee. Please ensure your profile is linked to an employee record.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('development_plans').insert({
        employee_id: employee.id,
        title: planTitle,
        description: planDescription,
        category: planCategory,
        priority: planPriority,
        status: 'not-started',
        progress: 0,
        target_date: targetDate.toISOString().slice(0, 10),
        mentor: null,
        budget: planBudget ? Number(planBudget) : null,
      });
      if (error) throw error;

      toast({
        title: "Development Plan Created",
        description: `Development plan "${planTitle}" has been created successfully`,
      });

      setPlanTitle("");
      setPlanDescription("");
      setPlanCategory("");
      setPlanPriority("");
      setTargetDate(undefined);
      setPlanBudget("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['performance', 'devplans'] });
    } catch (e: any) {
      console.error('Failed to create plan:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to create plan', variant: 'destructive' });
    }
  };

  const filteredPlans = developmentPlans.filter(plan => {
    const statusMatch = selectedFilter === "all" || plan.status === selectedFilter;
    const employeeMatch = selectedEmployee === "all" || plan.employeeName === selectedEmployee;
    return statusMatch && employeeMatch;
  });

  const getCompletedMilestones = (milestones: DevelopmentPlan["milestones"]) => {
    return milestones.filter(m => m.completed).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Development Plans
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
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
              {canManagePerformance && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Development Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plan-title">Plan Title *</Label>
                      <Input
                        id="plan-title"
                        placeholder="Enter development plan title"
                        value={planTitle}
                        onChange={(e) => setPlanTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="plan-description">Description</Label>
                      <Textarea
                        id="plan-description"
                        placeholder="Describe the development plan objectives"
                        value={planDescription}
                        onChange={(e) => setPlanDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category *</Label>
                        <Select value={planCategory} onValueChange={setPlanCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="leadership">Leadership</SelectItem>
                            <SelectItem value="soft-skills">Soft Skills</SelectItem>
                            <SelectItem value="certification">Certification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Priority *</Label>
                        <Select value={planPriority} onValueChange={setPlanPriority}>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Target Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !targetDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {targetDate ? format(targetDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={targetDate}
                              onSelect={setTargetDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="plan-budget">Budget (KES)</Label>
                        <Input
                          id="plan-budget"
                          type="number"
                          placeholder="Enter budget amount"
                          value={planBudget}
                          onChange={(e) => setPlanBudget(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePlan}>
                        Create Plan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{plan.title}</h3>
                        <Badge className={getCategoryColor(plan.category)}>
                          {plan.category}
                        </Badge>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-muted-foreground mb-3">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Employee: {plan.employeeName}</span>
                        <span>Target: {new Date(plan.targetDate).toLocaleDateString()}</span>
                        {plan.mentor && <span>Mentor: {plan.mentor}</span>}
                        {plan.budget && <span>Budget: KES {plan.budget.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-medium">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Milestones</h4>
                        <span className="text-xs text-muted-foreground">
                          {getCompletedMilestones(plan.milestones)}/{plan.milestones.length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {plan.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${
                                milestone.completed ? "bg-green-500" : "bg-gray-300"
                              }`} />
                              <span className={`text-sm ${
                                milestone.completed ? "line-through text-muted-foreground" : ""
                              }`}>
                                {milestone.title}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Resources</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                      {plan.category === "certification" && (
                        <Button size="sm" variant="outline">
                          <Award className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No development plans found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star, Plus, Eye, Edit, Target, Award, TrendingUp, Users, MessageCircle, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppraisalsQuery } from "@/hooks/queries/usePerformanceQueries";
import { useQueryClient } from "@tanstack/react-query";

interface Appraisal {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  appraisalPeriod: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  overallRating?: number;
  appraiser: string;
  selfAppraisalCompleted: boolean;
  managerAppraisalCompleted: boolean;
  lastUpdated: string;
}

export function PerformanceAppraisals() {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [appraisalComment, setAppraisalComment] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { data: fetchedAppraisals = [], isLoading: loading } = useAppraisalsQuery();
  
  // Schedule appraisal form state
  const [scheduleForm, setScheduleForm] = useState({
    employeeId: "",
    appraiserId: "",
    appraisalPeriod: "",
    dueDate: "",
    appraisalType: "annual"
  });

  // Fetch employees from database (used for scheduling selectors)
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position')
        .eq('status', 'active');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Build UI-friendly appraisals from fetched data
  const appraisals: Appraisal[] = (fetchedAppraisals || []).map((a) => {
    const employeeName = [a.employee?.first_name, a.employee?.last_name].filter(Boolean).join(' ') || 'Unknown';
    const position = a.employee?.position || '';
    const department = a.employee?.department || '';
    const appraiserName = [a.appraiser?.first_name, a.appraiser?.last_name].filter(Boolean).join(' ') || '';
    return {
      id: a.id,
      employeeName,
      employeeId: a.employee_id,
      department,
      position,
      appraisalPeriod: a.appraisal_period,
      status: a.status as Appraisal["status"],
      dueDate: a.due_date,
      overallRating: a.overall_rating ?? undefined,
      appraiser: appraiserName,
      selfAppraisalCompleted: false,
      managerAppraisalCompleted: a.status === 'completed',
      lastUpdated: a.updated_at,
    };
  });

  const handleStartAppraisal = async (appraisalId: string, employeeName: string) => {
    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', appraisalId);

      if (error) throw error;

      toast({
        title: "Appraisal Started",
        description: `Performance appraisal for ${employeeName} has been initiated.`,
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['performance', 'appraisals'] });
    } catch (error) {
      console.error('Error starting appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to start appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteAppraisal = async () => {
    if (!selectedAppraisal) return;
    
    if (selectedRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating before completing the appraisal.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          status: 'completed',
          overall_rating: selectedRating,
          manager_appraisal_comments: appraisalComment,
          manager_appraisal_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppraisal.id);

      if (error) throw error;

      toast({
        title: "Appraisal Completed",
        description: `Performance appraisal has been completed with a rating of ${selectedRating} stars.`,
      });
      
      setSelectedRating(0);
      setAppraisalComment("");
      setSelectedAppraisal(null);
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['performance', 'appraisals'] });
    } catch (error) {
      console.error('Error completing appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to complete appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedAppraisal) return;

    try {
      const { error } = await supabase
        .from('appraisals')
        .update({ 
          manager_appraisal_comments: appraisalComment,
          overall_rating: selectedRating > 0 ? selectedRating : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppraisal.id);

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your progress has been saved as draft.",
      });
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['performance', 'appraisals'] });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleAppraisal = async () => {
    if (!scheduleForm.employeeId || !scheduleForm.appraiserId || !scheduleForm.dueDate || !scheduleForm.appraisalPeriod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedEmployee = employees.find(emp => emp.id === scheduleForm.employeeId);
      const selectedAppraiser = employees.find(emp => emp.id === scheduleForm.appraiserId);
      
      const { error } = await supabase
        .from('appraisals')
        .insert({
          employee_id: scheduleForm.employeeId,
          appraiser_id: scheduleForm.appraiserId,
          appraisal_period: scheduleForm.appraisalPeriod,
          due_date: scheduleForm.dueDate,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Appraisal Scheduled",
        description: `Performance appraisal scheduled for ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}.`,
      });

      // Reset form and close dialog
      setScheduleForm({
        employeeId: "",
        appraiserId: "",
        appraisalPeriod: "",
        dueDate: "",
        appraisalType: "annual"
      });
      setShowScheduleDialog(false);
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['performance', 'appraisals'] });
    } catch (error) {
      console.error('Error scheduling appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: Appraisal["status"]) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      overdue: { variant: "destructive" as const, label: "Overdue" }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredAppraisals = selectedFilter === "all" 
    ? appraisals 
    : appraisals.filter(appraisal => appraisal.status === selectedFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Performance Appraisals</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appraisals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appraisal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Appraisal</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Select Employee *</Label>
                      <Select 
                        value={scheduleForm.employeeId} 
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, employeeId: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name} - {employee.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Select Appraiser *</Label>
                      <Select 
                        value={scheduleForm.appraiserId} 
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, appraiserId: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose appraiser" />
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Appraisal Period *</Label>
                      <Select 
                        value={scheduleForm.appraisalPeriod} 
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, appraisalPeriod: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                          <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                          <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                          <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                          <SelectItem value="Annual 2025">Annual 2025</SelectItem>
                          <SelectItem value="Mid-Year 2025">Mid-Year 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Due Date *</Label>
                      <Input 
                        type="date" 
                        className="mt-2"
                        value={scheduleForm.dueDate}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Appraisal Type</Label>
                    <Select 
                      value={scheduleForm.appraisalType} 
                      onValueChange={(value) => setScheduleForm(prev => ({ ...prev, appraisalType: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Review</SelectItem>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="probationary">Probationary Review</SelectItem>
                        <SelectItem value="project-based">Project-Based Review</SelectItem>
                        <SelectItem value="360-feedback">360° Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleAppraisal}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appraisal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppraisals.map((appraisal) => (
              <TableRow key={appraisal.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{appraisal.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{appraisal.position}</div>
                  </div>
                </TableCell>
                <TableCell>{appraisal.department}</TableCell>
                <TableCell>{appraisal.appraisalPeriod}</TableCell>
                <TableCell>{getStatusBadge(appraisal.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${appraisal.selfAppraisalCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Self Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${appraisal.managerAppraisalCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Manager Review</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{appraisal.dueDate}</TableCell>
                <TableCell>
                  {appraisal.overallRating ? (
                    <div className="flex">{renderStars(appraisal.overallRating)}</div>
                  ) : (
                    <span className="text-muted-foreground">Not rated</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAppraisal(appraisal)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                           <DialogTitle>Comprehensive Performance Appraisal</DialogTitle>
                         </DialogHeader>
                         {selectedAppraisal && (
                           <Tabs defaultValue="performance" className="w-full">
                             <TabsList className="grid w-full grid-cols-8 mb-6">
                               <TabsTrigger value="performance">Performance</TabsTrigger>
                               <TabsTrigger value="training">Training</TabsTrigger>
                               <TabsTrigger value="recognition">Recognition</TabsTrigger>
                               <TabsTrigger value="issues">Issues</TabsTrigger>
                               <TabsTrigger value="decisions">Decisions</TabsTrigger>
                               <TabsTrigger value="communication">Communication</TabsTrigger>
                               <TabsTrigger value="motivation">Motivation</TabsTrigger>
                               <TabsTrigger value="goals">Goal Alignment</TabsTrigger>
                             </TabsList>

                             {/* 1. Assess Employee Performance */}
                             <TabsContent value="performance" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <TrendingUp className="h-5 w-5" />
                                     Performance Assessment
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="grid grid-cols-2 gap-4">
                                     <div>
                                       <Label>Overall Performance Rating</Label>
                                       <div className="flex gap-2 mt-2">
                                         {Array.from({ length: 5 }, (_, i) => (
                                           <Star
                                             key={i}
                                             className={`h-6 w-6 cursor-pointer transition-colors ${
                                               i < selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                                             }`}
                                             onClick={() => setSelectedRating(i + 1)}
                                           />
                                         ))}
                                       </div>
                                     </div>
                                     <div>
                                       <Label>Goal Achievement Rate</Label>
                                       <Progress value={85} className="mt-2" />
                                       <span className="text-sm text-muted-foreground">85% of goals met</span>
                                     </div>
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Key Performance Areas</Label>
                                     {["Quality of Work", "Productivity", "Innovation", "Team Collaboration", "Problem Solving"].map((area, index) => (
                                       <div key={area} className="flex items-center justify-between p-3 border rounded-lg">
                                         <span>{area}</span>
                                         <div className="flex gap-1">
                                           {Array.from({ length: 5 }, (_, i) => (
                                             <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                           ))}
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                   
                                   <div>
                                     <Label>Performance Comments</Label>
                                     <Textarea 
                                       placeholder="Detailed performance assessment..." 
                                       className="mt-2" 
                                       rows={4}
                                       value={appraisalComment}
                                       onChange={(e) => setAppraisalComment(e.target.value)}
                                     />
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 2. Identify Training Needs */}
                             <TabsContent value="training" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <Target className="h-5 w-5" />
                                     Training & Development Needs
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="space-y-3">
                                     <Label>Identified Training Areas</Label>
                                     {["Technical Skills", "Leadership Development", "Communication", "Project Management", "Industry Knowledge"].map((skill) => (
                                       <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                                         <div className="flex items-center gap-2">
                                           <Checkbox />
                                           <span>{skill}</span>
                                         </div>
                                         <Select>
                                           <SelectTrigger className="w-32">
                                             <SelectValue placeholder="Priority" />
                                           </SelectTrigger>
                                           <SelectContent>
                                             <SelectItem value="high">High</SelectItem>
                                             <SelectItem value="medium">Medium</SelectItem>
                                             <SelectItem value="low">Low</SelectItem>
                                           </SelectContent>
                                         </Select>
                                       </div>
                                     ))}
                                   </div>
                                   
                                   <div>
                                     <Label>Recommended Training Programs</Label>
                                     <Textarea placeholder="Specific training recommendations..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Training Timeline</Label>
                                     <Input type="date" className="mt-2" />
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 3. Recognition for High Performers */}
                             <TabsContent value="recognition" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <Award className="h-5 w-5" />
                                     Recognition & Achievements
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                     <CheckCircle className="h-5 w-5 text-green-600" />
                                     <span className="font-medium">High Performer Identified</span>
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Outstanding Achievements</Label>
                                     <Textarea placeholder="Describe specific achievements and contributions..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Recognition Type</Label>
                                     <div className="grid grid-cols-2 gap-3">
                                       {["Employee of the Month", "Outstanding Performance Award", "Innovation Award", "Team Player Award", "Leadership Excellence"].map((award) => (
                                         <div key={award} className="flex items-center gap-2">
                                           <Checkbox />
                                           <span className="text-sm">{award}</span>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Recommended Actions</Label>
                                     <div className="space-y-2 mt-2">
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Consider for promotion</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Salary increase recommendation</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Additional responsibilities</span>
                                       </div>
                                     </div>
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 4. Address Performance Issues */}
                             <TabsContent value="issues" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <AlertTriangle className="h-5 w-5" />
                                     Performance Issues & Improvement
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="space-y-3">
                                     <Label>Identified Issues</Label>
                                     <Textarea placeholder="Describe specific performance issues..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Root Cause Analysis</Label>
                                     <div className="grid grid-cols-2 gap-3">
                                       {["Lack of Skills", "Resource Constraints", "Unclear Expectations", "Personal Issues", "Workload Management"].map((cause) => (
                                         <div key={cause} className="flex items-center gap-2">
                                           <Checkbox />
                                           <span className="text-sm">{cause}</span>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Improvement Plan</Label>
                                     <Textarea placeholder="Specific actions to address issues..." className="mt-2" rows={4} />
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-4">
                                     <div>
                                       <Label>Review Date</Label>
                                       <Input type="date" className="mt-2" />
                                     </div>
                                     <div>
                                       <Label>Support Required</Label>
                                       <Select>
                                         <SelectTrigger>
                                           <SelectValue placeholder="Select support" />
                                         </SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="training">Additional Training</SelectItem>
                                           <SelectItem value="mentoring">Mentoring</SelectItem>
                                           <SelectItem value="resources">Additional Resources</SelectItem>
                                           <SelectItem value="coaching">Performance Coaching</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 5. Inform Decision-Making */}
                             <TabsContent value="decisions" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <Users className="h-5 w-5" />
                                     HR Decision Support
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="space-y-3">
                                     <Label>Promotion Readiness</Label>
                                     <Select>
                                       <SelectTrigger>
                                         <SelectValue placeholder="Assessment" />
                                       </SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="ready">Ready for Promotion</SelectItem>
                                         <SelectItem value="needs-development">Needs Development</SelectItem>
                                         <SelectItem value="not-ready">Not Ready</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Compensation Review</Label>
                                     <div className="grid grid-cols-2 gap-3">
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Salary increase recommended</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Bonus eligible</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Benefits review</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <Checkbox />
                                         <span className="text-sm">Stock options consideration</span>
                                       </div>
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Transfer/Reassignment Suitability</Label>
                                     <Textarea placeholder="Assessment for different roles or departments..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Succession Planning</Label>
                                     <Select>
                                       <SelectTrigger>
                                         <SelectValue placeholder="Succession potential" />
                                       </SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="high">High Potential</SelectItem>
                                         <SelectItem value="medium">Medium Potential</SelectItem>
                                         <SelectItem value="low">Low Potential</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 6. Improve Communication */}
                             <TabsContent value="communication" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <MessageCircle className="h-5 w-5" />
                                     Communication & Expectations
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div>
                                     <Label>Current Expectations Clarity</Label>
                                     <div className="flex gap-4 mt-2">
                                       {["Very Clear", "Clear", "Somewhat Clear", "Unclear"].map((level) => (
                                         <div key={level} className="flex items-center gap-2">
                                           <input type="radio" name="clarity" />
                                           <span className="text-sm">{level}</span>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Clarified Expectations</Label>
                                     <Textarea placeholder="Clearly define role expectations and responsibilities..." className="mt-2" rows={4} />
                                   </div>
                                   
                                   <div>
                                     <Label>Communication Feedback</Label>
                                     <Textarea placeholder="Employee's communication strengths and areas for improvement..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Guidance Provided</Label>
                                     <Textarea placeholder="Specific guidance and direction given..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Follow-up Schedule</Label>
                                     <div className="grid grid-cols-2 gap-4">
                                       <Input type="date" placeholder="Next review date" />
                                       <Select>
                                         <SelectTrigger>
                                           <SelectValue placeholder="Frequency" />
                                         </SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="weekly">Weekly</SelectItem>
                                           <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                           <SelectItem value="monthly">Monthly</SelectItem>
                                           <SelectItem value="quarterly">Quarterly</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 7. Boost Employee Motivation */}
                             <TabsContent value="motivation" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <TrendingUp className="h-5 w-5" />
                                     Motivation & Morale Enhancement
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div>
                                     <Label>Achievement Recognition</Label>
                                     <Textarea placeholder="Specific achievements to be recognized..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Constructive Feedback</Label>
                                     <Textarea placeholder="Balanced feedback highlighting strengths and improvement areas..." className="mt-2" rows={4} />
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <Label>Motivation Strategies</Label>
                                     <div className="grid grid-cols-2 gap-3">
                                       {["Public Recognition", "Challenging Projects", "Professional Development", "Flexible Work Options", "Career Advancement Path", "Team Leadership Opportunities"].map((strategy) => (
                                         <div key={strategy} className="flex items-center gap-2">
                                           <Checkbox />
                                           <span className="text-sm">{strategy}</span>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Employee Interests & Aspirations</Label>
                                     <Textarea placeholder="Employee's career interests and aspirations..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Morale Improvement Actions</Label>
                                     <Textarea placeholder="Specific actions to enhance employee morale..." className="mt-2" rows={3} />
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>

                             {/* 8. Align Goals */}
                             <TabsContent value="goals" className="space-y-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <Target className="h-5 w-5" />
                                     Goal Alignment & Planning
                                   </CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div>
                                     <Label>Organizational Goals Alignment</Label>
                                     <Progress value={78} className="mt-2" />
                                     <span className="text-sm text-muted-foreground">78% alignment with organizational objectives</span>
                                   </div>
                                   
                                   <div>
                                     <Label>Individual Goals for Next Period</Label>
                                     <div className="space-y-3 mt-2">
                                       {[1, 2, 3].map((i) => (
                                         <div key={i} className="p-3 border rounded-lg">
                                           <Input placeholder={`Goal ${i}`} className="mb-2" />
                                           <div className="grid grid-cols-2 gap-2">
                                             <Input type="date" placeholder="Target date" />
                                             <Select>
                                               <SelectTrigger>
                                                 <SelectValue placeholder="Priority" />
                                               </SelectTrigger>
                                               <SelectContent>
                                                 <SelectItem value="high">High</SelectItem>
                                                 <SelectItem value="medium">Medium</SelectItem>
                                                 <SelectItem value="low">Low</SelectItem>
                                               </SelectContent>
                                             </Select>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <Label>Strategic Initiative Involvement</Label>
                                     <Textarea placeholder="How employee will contribute to strategic initiatives..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div>
                                     <Label>Cross-functional Collaboration Goals</Label>
                                     <Textarea placeholder="Planned collaboration with other departments..." className="mt-2" rows={3} />
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-4">
                                     <div>
                                       <Label>Quarterly Review Date</Label>
                                       <Input type="date" className="mt-2" />
                                     </div>
                                     <div>
                                       <Label>Goal Achievement Target</Label>
                                       <Select>
                                         <SelectTrigger>
                                           <SelectValue placeholder="Target %" />
                                         </SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="100">100%</SelectItem>
                                           <SelectItem value="90">90%</SelectItem>
                                           <SelectItem value="80">80%</SelectItem>
                                           <SelectItem value="70">70%</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>
                             
                             <Separator className="my-6" />
                             
                             <div className="flex justify-between">
                               {selectedAppraisal.status === "pending" && (
                                 <Button 
                                   onClick={() => handleStartAppraisal(selectedAppraisal.id, selectedAppraisal.employeeName)}
                                 >
                                   Start Appraisal
                                 </Button>
                               )}
                               {selectedAppraisal.status === "in-progress" && (
                                 <Button onClick={handleCompleteAppraisal}>
                                   Complete Appraisal
                                 </Button>
                               )}
                               <Button variant="outline" onClick={handleSaveDraft}>
                                 Save Draft
                               </Button>
                             </div>
                           </Tabs>
                         )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartAppraisal(appraisal.id, appraisal.employeeName)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAppraisals.length} of {appraisals.length} appraisals
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, Clock, User, AlertTriangle, Search, Filter } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PendingTimesheet {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  week: string;
  period: string;
  totalHours: number;
  billableHours: number;
  submittedDate: Date;
  projects: { name: string; hours: number }[];
  overtime: number;
  comments?: string;
  lineManager: string;
  isManager: boolean;
  approvalStatus: "pending_manager" | "pending_hr" | "pending_ceo" | "approved" | "rejected";
  managerApproval?: {
    approvedBy: string;
    approvedDate: Date;
    comments?: string;
  };
  hrApproval?: {
    approvedBy: string;
    approvedDate: Date;
    comments?: string;
  };
  ceoApproval?: {
    approvedBy: string;
    approvedDate: Date;
    comments?: string;
  };
}

export function TimesheetApprovals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTimesheet, setSelectedTimesheet] = useState<PendingTimesheet | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [userRole] = useState<"manager" | "hr" | "ceo">("hr"); // In real app, get from auth context

  const pendingTimesheets: PendingTimesheet[] = [
    {
      id: "TS-001",
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "Development",
      position: "Software Engineer",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 45.0,
      billableHours: 40.0,
      submittedDate: new Date("2024-07-22"),
      overtime: 5.0,
      projects: [
        { name: "HR Management System", hours: 25.0 },
        { name: "E-commerce Platform", hours: 15.0 },
        { name: "Documentation", hours: 5.0 },
      ],
      comments: "Extra hours for deadline completion",
      lineManager: "Alice Johnson",
      isManager: false,
      approvalStatus: "pending_manager"
    },
    {
      id: "TS-002",
      employeeName: "Jane Smith",
      employeeId: "EMP002",
      department: "Design",
      position: "UI/UX Designer",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 40.0,
      billableHours: 36.0,
      submittedDate: new Date("2024-07-22"),
      overtime: 0,
      projects: [
        { name: "Mobile App Development", hours: 30.0 },
        { name: "Client Website", hours: 6.0 },
        { name: "Team Meeting", hours: 4.0 },
      ],
      lineManager: "Mike Johnson",
      isManager: false,
      approvalStatus: "pending_hr",
      managerApproval: {
        approvedBy: "Mike Johnson",
        approvedDate: new Date("2024-07-23"),
        comments: "Good work this week."
      }
    },
    {
      id: "TS-003",
      employeeName: "Mike Johnson",
      employeeId: "EMP003",
      department: "Design",
      position: "Design Manager",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 42.0,
      billableHours: 38.0,
      submittedDate: new Date("2024-07-21"),
      overtime: 2.0,
      projects: [
        { name: "Team Management", hours: 20.0 },
        { name: "Client Presentations", hours: 15.0 },
        { name: "Strategic Planning", hours: 7.0 },
      ],
      comments: "Additional hours for client presentations and team coordination.",
      lineManager: "N/A",
      isManager: true,
      approvalStatus: "pending_hr"
    },
    {
      id: "TS-004",
      employeeName: "Alice Johnson",
      employeeId: "EMP004",
      department: "Development",
      position: "Development Manager",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 44.0,
      billableHours: 40.0,
      submittedDate: new Date("2024-07-20"),
      overtime: 4.0,
      projects: [
        { name: "Project Management", hours: 25.0 },
        { name: "Code Review", hours: 15.0 },
        { name: "Client Meetings", hours: 4.0 },
      ],
      comments: "Overtime for critical project delivery.",
      lineManager: "N/A",
      isManager: true,
      approvalStatus: "pending_ceo",
      hrApproval: {
        approvedBy: "Sarah Wilson",
        approvedDate: new Date("2024-07-22"),
        comments: "HR approved. Forwarding to CEO for final approval."
      }
    }
  ];

  const filteredTimesheets = pendingTimesheets.filter((timesheet) => {
    const matchesSearch = timesheet.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || timesheet.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || timesheet.approvalStatus === statusFilter;
    
    // Filter based on user role
    let matchesRole = true;
    if (userRole === "manager") {
      matchesRole = timesheet.approvalStatus === "pending_manager";
    } else if (userRole === "hr") {
      matchesRole = timesheet.approvalStatus === "pending_hr";
    } else if (userRole === "ceo") {
      matchesRole = timesheet.approvalStatus === "pending_ceo";
    }
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
  });

  const handleApproval = async (timesheetId: string, action: "approve" | "reject", comments?: string) => {
    setIsProcessing(timesheetId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timesheet = pendingTimesheets.find(t => t.id === timesheetId);
    if (!timesheet) return;
    
    if (userRole === "manager") {
      if (action === "approve") {
        toast({
          title: "Timesheet Approved by Manager",
          description: `Timesheet ${timesheetId} has been forwarded to HR for final approval.`,
        });
      } else {
        toast({
          title: "Timesheet Rejected",
          description: `Timesheet ${timesheetId} has been rejected by line manager.`,
        });
      }
    } else if (userRole === "hr") {
      if (action === "approve") {
        if (timesheet.isManager) {
          toast({
            title: "Manager Timesheet Approved by HR",
            description: `Timesheet ${timesheetId} has been forwarded to CEO for final approval.`,
          });
        } else {
          toast({
            title: "Timesheet Approved by HR",
            description: `Timesheet ${timesheetId} has been approved successfully. Employee will be notified.`,
          });
        }
      } else {
        toast({
          title: "Timesheet Rejected by HR",
          description: `Timesheet ${timesheetId} has been rejected. Employee will be notified.`,
        });
      }
    } else if (userRole === "ceo") {
      toast({
        title: action === "approve" ? "Manager Timesheet Approved by CEO" : "Manager Timesheet Rejected by CEO",
        description: `Timesheet ${timesheetId} has been ${action}d successfully. Manager will be notified.`,
      });
    }
    
    setIsProcessing(null);
    setSelectedTimesheet(null);
    setApprovalComments("");
  };

  const getUrgencyBadge = (submittedDate: Date) => {
    const daysProcessing = differenceInDays(new Date(), submittedDate);
    
    if (daysProcessing > 7) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    } else if (daysProcessing > 3) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Delayed</Badge>;
    }
    return null;
  };

  const getBillableRate = (billable: number, total: number) => {
    return total > 0 ? Math.round((billable / total) * 100) : 0;
  };

  const hasOvertime = (hours: number) => hours > 40;
  const hasLowBillable = (billable: number, total: number) => getBillableRate(billable, total) < 75;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_manager":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending Manager</Badge>;
      case "pending_hr":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Pending HR</Badge>;
      case "pending_ceo":
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Pending CEO</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">
              Viewing as: {userRole === "manager" ? "Line Manager" : userRole === "hr" ? "HR Personnel" : "CEO"}
            </span>
            <Badge variant="outline">
              {userRole === "manager" ? "Manager Approvals" : userRole === "hr" ? "HR Approvals" : "CEO Approvals"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "manager" ? "Pending Manager Review" : userRole === "hr" ? "Pending HR Review" : "Pending CEO Review"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTimesheets.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredTimesheets.filter(t => differenceInDays(new Date(), t.submittedDate) > 7).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted &gt;7 days ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">
              Timesheets processed
            </p>
          </CardContent>
        </Card>
      </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {userRole === "manager" ? "Manager Timesheet Approvals" : userRole === "hr" ? "HR Timesheet Approvals" : "CEO Timesheet Approvals"}
        </CardTitle>
        <CardDescription>
          {userRole === "manager" 
            ? "Review and approve timesheets from your team members. Approved timesheets will be forwarded to HR."
            : userRole === "hr"
            ? "Review timesheets from employees and managers. Manager timesheets approved here are forwarded to CEO for final approval."
            : "Review timesheets from managers that have been approved by HR for final CEO approval."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_manager">Pending Manager</SelectItem>
              <SelectItem value="pending_hr">Pending HR</SelectItem>
              <SelectItem value="pending_ceo">Pending CEO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredTimesheets.length} pending timesheet{filteredTimesheets.length !== 1 ? 's' : ''} found
        </div>
        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Line Manager</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{timesheet.employeeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {timesheet.employeeId} • {timesheet.department}
                        {timesheet.isManager && <Badge variant="outline" className="ml-2 text-xs">Manager</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{timesheet.week}</div>
                      <div className="text-sm text-muted-foreground">{timesheet.period}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{timesheet.totalHours}h</span>
                        {timesheet.overtime > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                            +{timesheet.overtime}h OT
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {timesheet.billableHours}h billable ({getBillableRate(timesheet.billableHours, timesheet.totalHours)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {timesheet.projects.slice(0, 2).map((project) => (
                        <div key={project.name} className="text-sm">
                          <span className="font-medium">{project.hours}h</span> - {project.name}
                        </div>
                      ))}
                      {timesheet.projects.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{timesheet.projects.length - 2} more projects
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(timesheet.approvalStatus)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{timesheet.lineManager}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {hasOvertime(timesheet.totalHours) && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          Overtime
                        </Badge>
                      )}
                      {hasLowBillable(timesheet.billableHours, timesheet.totalHours) && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          Low Billable
                        </Badge>
                      )}
                      {getUrgencyBadge(timesheet.submittedDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {format(timesheet.submittedDate, "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedTimesheet(timesheet)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Timesheet Review - {timesheet.employeeName}</DialogTitle>
                            <DialogDescription>
                              Review and process {timesheet.employeeName}'s timesheet for {timesheet.period}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedTimesheet && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Employee Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="text-muted-foreground">Name:</span> {selectedTimesheet.employeeName}</div>
                                    <div><span className="text-muted-foreground">ID:</span> {selectedTimesheet.employeeId}</div>
                                    <div><span className="text-muted-foreground">Department:</span> {selectedTimesheet.department}</div>
                                    <div><span className="text-muted-foreground">Position:</span> {selectedTimesheet.position}</div>
                                    <div><span className="text-muted-foreground">Line Manager:</span> {selectedTimesheet.lineManager}</div>
                                    <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedTimesheet.approvalStatus)}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Period Summary</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="text-muted-foreground">Period:</span> {selectedTimesheet.period}</div>
                                    <div><span className="text-muted-foreground">Total Hours:</span> {selectedTimesheet.totalHours}h</div>
                                    <div><span className="text-muted-foreground">Billable Hours:</span> {selectedTimesheet.billableHours}h</div>
                                    <div><span className="text-muted-foreground">Overtime:</span> {selectedTimesheet.overtime}h</div>
                                    <div><span className="text-muted-foreground">Billable Rate:</span> {getBillableRate(selectedTimesheet.billableHours, selectedTimesheet.totalHours)}%</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Project Breakdown</h4>
                                <div className="border rounded-lg p-3">
                                  {selectedTimesheet.projects.map((project) => (
                                    <div key={project.name} className="flex justify-between py-1">
                                      <span>{project.name}</span>
                                      <span className="font-medium">{project.hours}h</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {selectedTimesheet.comments && (
                                <div>
                                  <h4 className="font-medium mb-2">Employee Comments</h4>
                                  <div className="border rounded-lg p-3 bg-muted/50">
                                    {selectedTimesheet.comments}
                                  </div>
                                </div>
                              )}

                              {/* Approval History */}
                              {(selectedTimesheet.managerApproval || selectedTimesheet.hrApproval) && (
                                <div>
                                  <h4 className="font-medium mb-2">Approval History</h4>
                                  <div className="space-y-3">
                                    {selectedTimesheet.managerApproval && (
                                      <div className="border rounded-lg p-3 bg-green-50">
                                        <div className="flex items-center gap-2 mb-1">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <span className="font-medium text-sm">Manager Approval</span>
                                          <Badge variant="outline" className="text-xs">Approved</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Approved by {selectedTimesheet.managerApproval.approvedBy} on {format(selectedTimesheet.managerApproval.approvedDate, "MMM dd, yyyy")}
                                        </div>
                                        {selectedTimesheet.managerApproval.comments && (
                                          <div className="text-sm mt-2">{selectedTimesheet.managerApproval.comments}</div>
                                        )}
                                      </div>
                                    )}

                                    {selectedTimesheet.hrApproval && (
                                      <div className="border rounded-lg p-3 bg-blue-50">
                                        <div className="flex items-center gap-2 mb-1">
                                          <CheckCircle className="h-4 w-4 text-blue-600" />
                                          <span className="font-medium text-sm">HR Approval</span>
                                          <Badge variant="outline" className="text-xs">Approved</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Approved by {selectedTimesheet.hrApproval.approvedBy} on {format(selectedTimesheet.hrApproval.approvedDate, "MMM dd, yyyy")}
                                        </div>
                                        {selectedTimesheet.hrApproval.comments && (
                                          <div className="text-sm mt-2">{selectedTimesheet.hrApproval.comments}</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium mb-2">Review Comments</h4>
                                <Textarea
                                  placeholder="Add comments for approval/rejection..."
                                  value={approvalComments}
                                  onChange={(e) => setApprovalComments(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleApproval(selectedTimesheet.id, "reject", approvalComments)}
                                  disabled={isProcessing === selectedTimesheet.id}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {isProcessing === selectedTimesheet.id ? "Processing..." : "Reject"}
                                </Button>
                                <Button
                                  onClick={() => handleApproval(selectedTimesheet.id, "approve", approvalComments)}
                                  disabled={isProcessing === selectedTimesheet.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isProcessing === selectedTimesheet.id ? "Processing..." : "Approve"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        onClick={() => handleApproval(timesheet.id, "approve")}
                        disabled={isProcessing === timesheet.id}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(timesheet.id, "reject")}
                        disabled={isProcessing === timesheet.id}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTimesheets.length} timesheet{filteredTimesheets.length !== 1 ? 's' : ''} pending approval
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Bulk Approve Selected
            </Button>
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
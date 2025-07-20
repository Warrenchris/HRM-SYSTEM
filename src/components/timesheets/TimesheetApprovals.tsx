import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, Clock, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingTimesheet {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  week: string;
  period: string;
  totalHours: number;
  billableHours: number;
  submittedDate: string;
  projects: { name: string; hours: number }[];
  overtime: number;
  comments?: string;
}

export function TimesheetApprovals() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [reviewComments, setReviewComments] = useState("");
  const { toast } = useToast();

  const pendingTimesheets: PendingTimesheet[] = [
    {
      id: "TS-001",
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "Development",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 45.0,
      billableHours: 40.0,
      submittedDate: "2024-07-22",
      overtime: 5.0,
      projects: [
        { name: "HR Management System", hours: 25.0 },
        { name: "E-commerce Platform", hours: 15.0 },
        { name: "Documentation", hours: 5.0 },
      ],
      comments: "Extra hours for deadline completion",
    },
    {
      id: "TS-002",
      employeeName: "Jane Smith",
      employeeId: "EMP002", 
      department: "Design",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 40.0,
      billableHours: 36.0,
      submittedDate: "2024-07-22",
      overtime: 0,
      projects: [
        { name: "Mobile App Development", hours: 30.0 },
        { name: "Client Website", hours: 6.0 },
        { name: "Team Meeting", hours: 4.0 },
      ],
    },
    {
      id: "TS-003",
      employeeName: "Mike Johnson",
      employeeId: "EMP003",
      department: "Development",
      week: "Week 29", 
      period: "July 15-21, 2024",
      totalHours: 42.0,
      billableHours: 38.0,
      submittedDate: "2024-07-21",
      overtime: 2.0,
      projects: [
        { name: "Data Analytics Dashboard", hours: 35.0 },
        { name: "Internal Training", hours: 7.0 },
      ],
    },
  ];

  const handleApprove = (timesheetId: string, employeeName: string) => {
    toast({
      title: "Timesheet Approved",
      description: `${employeeName}'s timesheet has been approved`,
    });
  };

  const handleReject = (timesheetId: string, employeeName: string) => {
    if (!reviewComments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide comments when rejecting a timesheet",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Timesheet Rejected",
      description: `${employeeName}'s timesheet has been rejected`,
      variant: "destructive",
    });
    setReviewComments("");
  };

  const getBillableRate = (billable: number, total: number) => {
    return total > 0 ? Math.round((billable / total) * 100) : 0;
  };

  const hasOvertime = (hours: number) => hours > 40;
  const hasLowBillable = (billable: number, total: number) => getBillableRate(billable, total) < 75;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Timesheet Approvals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pending</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="overtime">With Overtime</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {pendingTimesheets.length} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{timesheet.employeeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {timesheet.employeeId} • {timesheet.department}
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(timesheet.submittedDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Timesheet Review - {timesheet.employeeName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Employee Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Name:</strong> {timesheet.employeeName}</p>
                                  <p><strong>ID:</strong> {timesheet.employeeId}</p>
                                  <p><strong>Department:</strong> {timesheet.department}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Period Summary</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Period:</strong> {timesheet.period}</p>
                                  <p><strong>Total Hours:</strong> {timesheet.totalHours}h</p>
                                  <p><strong>Billable Hours:</strong> {timesheet.billableHours}h</p>
                                  <p><strong>Overtime:</strong> {timesheet.overtime}h</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Project Breakdown</h4>
                              <div className="border rounded-lg p-3">
                                {timesheet.projects.map((project) => (
                                  <div key={project.name} className="flex justify-between py-1">
                                    <span>{project.name}</span>
                                    <span className="font-medium">{project.hours}h</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {timesheet.comments && (
                              <div>
                                <h4 className="font-medium mb-2">Employee Comments</h4>
                                <div className="border rounded-lg p-3 bg-muted/50">
                                  {timesheet.comments}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Review Comments</h4>
                              <Textarea
                                placeholder="Add comments for approval/rejection..."
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(timesheet.id, timesheet.employeeName)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleApprove(timesheet.id, timesheet.employeeName)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        onClick={() => handleApprove(timesheet.id, timesheet.employeeName)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(timesheet.id, timesheet.employeeName)}
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
            {pendingTimesheets.length} timesheets pending approval
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
  );
}
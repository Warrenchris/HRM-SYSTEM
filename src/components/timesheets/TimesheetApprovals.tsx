import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTimesheetApprovalsQuery } from "@/hooks/queries/useTimesheetQuery";

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
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("employee");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTimesheet, setSelectedTimesheet] = useState<PendingTimesheet | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const { data: pendingTimesheets = [], isLoading } = useTimesheetApprovalsQuery();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setUserRole(profile?.role || "employee");
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, [user]);

  const canApprove = useMemo(() => userRole === "manager" || userRole === "hr" || userRole === "admin" || userRole === "ceo", [userRole]);

  const filteredTimesheets = useMemo(() => {
    let filtered = pendingTimesheets;

    if (searchTerm) {
      filtered = filtered.filter(timesheet =>
        timesheet.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(timesheet => timesheet.approvalStatus === statusFilter);
    }

    return filtered;
  }, [pendingTimesheets, searchTerm, statusFilter]);

  const handleApproval = async (timesheetId: string, action: "approve" | "reject") => {
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', timesheetId);

      if (error) throw error;

      toast({
        title: `Timesheet ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Timesheet has been ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setSelectedTimesheet(null);
      setApprovalComments("");
    } catch (error) {
      console.error('Error updating timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to update timesheet status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: PendingTimesheet["approvalStatus"]) => {
    switch (status) {
      case "pending_manager":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending Manager</Badge>;
      case "pending_hr":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><User className="h-3 w-3 mr-1" />Pending HR</Badge>;
      case "pending_ceo":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><AlertTriangle className="h-3 w-3 mr-1" />Pending CEO</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Approvals</CardTitle>
          <CardDescription>Review and approve employee timesheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingTimesheets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Approvals</CardTitle>
          <CardDescription>Review and approve employee timesheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No pending approvals</h3>
            <p className="text-sm text-muted-foreground">All timesheets have been processed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Approvals</CardTitle>
        <CardDescription>Review and approve employee timesheets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by employee, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_manager">Pending Manager</SelectItem>
              <SelectItem value="pending_hr">Pending HR</SelectItem>
              <SelectItem value="pending_ceo">Pending CEO</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimesheets.map((timesheet) => (
              <TableRow key={timesheet.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{timesheet.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{timesheet.position}</div>
                  </div>
                </TableCell>
                <TableCell>{timesheet.department}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{timesheet.week}</div>
                    <div className="text-sm text-muted-foreground">{timesheet.period}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{timesheet.totalHours.toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">{timesheet.billableHours.toFixed(1)}h billable</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {timesheet.projects.slice(0, 2).map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {project.name} ({project.hours}h)
                      </Badge>
                    ))}
                    {timesheet.projects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{timesheet.projects.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(timesheet.approvalStatus)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTimesheet(timesheet)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Timesheet Details</DialogTitle>
                          <DialogDescription>
                            Review timesheet details and take action
                          </DialogDescription>
                        </DialogHeader>
                        {selectedTimesheet && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Employee</label>
                                <p className="text-sm text-muted-foreground">{selectedTimesheet.employeeName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Department</label>
                                <p className="text-sm text-muted-foreground">{selectedTimesheet.department}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Week</label>
                                <p className="text-sm text-muted-foreground">{selectedTimesheet.week}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Total Hours</label>
                                <p className="text-sm text-muted-foreground">{selectedTimesheet.totalHours.toFixed(1)}h</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Projects</label>
                              <div className="mt-2 space-y-2">
                                {selectedTimesheet.projects.map((project, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                    <span className="text-sm">{project.name}</span>
                                    <span className="text-sm font-medium">{project.hours}h</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {selectedTimesheet.comments && (
                              <div>
                                <label className="text-sm font-medium">Comments</label>
                                <p className="text-sm text-muted-foreground mt-1">{selectedTimesheet.comments}</p>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">Approval Comments</label>
                              <Textarea
                                placeholder="Add your approval comments..."
                                value={approvalComments}
                                onChange={(e) => setApprovalComments(e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedTimesheet(null);
                                  setApprovalComments("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleApproval(selectedTimesheet.id, "reject")}
                              >
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleApproval(selectedTimesheet.id, "approve")}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
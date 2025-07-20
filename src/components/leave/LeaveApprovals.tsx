import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PendingLeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  appliedDate: Date;
  emergencyContact?: string;
  handoverNotes?: string;
  remainingBalance: number;
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

const mockPendingRequests: PendingLeaveRequest[] = [
  {
    id: "LR005",
    employeeName: "Alice Johnson",
    employeeId: "EMP005",
    department: "Engineering",
    position: "Software Engineer",
    leaveType: "Annual Leave",
    startDate: new Date("2025-02-15"),
    endDate: new Date("2025-02-20"),
    days: 6,
    reason: "Family vacation to Hawaii. Planning this trip for months and already booked flights and accommodation.",
    appliedDate: new Date("2025-01-10"),
    emergencyContact: "+1 234-567-8900",
    handoverNotes: "All current projects are on track. Jane will cover my meetings and urgent issues.",
    remainingBalance: 18,
    lineManager: "John Smith",
    isManager: false,
    approvalStatus: "pending_manager"
  },
  {
    id: "LR006",
    employeeName: "Bob Wilson",
    employeeId: "EMP006",
    department: "Marketing",
    position: "Marketing Specialist",
    leaveType: "Sick Leave",
    startDate: new Date("2025-01-25"),
    endDate: new Date("2025-01-26"),
    days: 2,
    reason: "Medical procedure scheduled. Doctor recommended 2 days rest.",
    appliedDate: new Date("2025-01-20"),
    emergencyContact: "+1 234-567-8901",
    remainingBalance: 8,
    lineManager: "Sarah Johnson",
    isManager: false,
    approvalStatus: "pending_hr",
    managerApproval: {
      approvedBy: "Sarah Johnson",
      approvedDate: new Date("2025-01-22"),
      comments: "Approved. Hope you recover quickly."
    }
  },
  {
    id: "LR007",
    employeeName: "Sarah Johnson",
    employeeId: "EMP007",
    department: "Marketing",
    position: "Marketing Manager",
    leaveType: "Annual Leave",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-05"),
    days: 5,
    reason: "Family wedding abroad. Important family event that requires travel.",
    appliedDate: new Date("2025-01-15"),
    handoverNotes: "Bob and team will handle ongoing campaigns. All meetings rescheduled.",
    remainingBalance: 12,
    lineManager: "N/A",
    isManager: true,
    approvalStatus: "pending_hr"
  },
  {
    id: "LR008",
    employeeName: "David Lee",
    employeeId: "EMP008",
    department: "Sales",
    position: "Sales Representative",
    leaveType: "Annual Leave",
    startDate: new Date("2025-02-10"),
    endDate: new Date("2025-02-14"),
    days: 5,
    reason: "Wedding anniversary celebration with spouse.",
    appliedDate: new Date("2025-01-12"),
    emergencyContact: "+1 234-567-8902",
    remainingBalance: 15,
    lineManager: "Lisa Wang",
    isManager: false,
    approvalStatus: "pending_hr",
    managerApproval: {
      approvedBy: "Lisa Wang",
      approvedDate: new Date("2025-01-18"),
      comments: "Approved. Congratulations on your anniversary!"
    }
  },
  {
    id: "LR009",
    employeeName: "John Smith",
    employeeId: "EMP009",
    department: "Engineering",
    position: "Engineering Manager",
    leaveType: "Personal Leave",
    startDate: new Date("2025-02-20"),
    endDate: new Date("2025-02-22"),
    days: 3,
    reason: "Family emergency - need to travel to support elderly parent.",
    appliedDate: new Date("2025-01-18"),
    emergencyContact: "+1 234-567-8903",
    handoverNotes: "Alice will lead team meetings. All critical decisions can wait until return.",
    remainingBalance: 8,
    lineManager: "N/A",
    isManager: true,
    approvalStatus: "pending_ceo",
    hrApproval: {
      approvedBy: "Carol Davis",
      approvedDate: new Date("2025-01-20"),
      comments: "HR approved. Forwarding to CEO for final approval."
    }
  }
];

export function LeaveApprovals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<PendingLeaveRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [userRole] = useState<"manager" | "hr" | "ceo">("hr"); // In real app, get from auth context

  const filteredRequests = mockPendingRequests.filter((request) => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || request.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || request.approvalStatus === statusFilter;
    
    // Filter based on user role
    let matchesRole = true;
    if (userRole === "manager") {
      matchesRole = request.approvalStatus === "pending_manager";
    } else if (userRole === "hr") {
      matchesRole = request.approvalStatus === "pending_hr";
    } else if (userRole === "ceo") {
      matchesRole = request.approvalStatus === "pending_ceo";
    }
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
  });

  const handleApproval = async (requestId: string, action: "approve" | "reject", comments?: string) => {
    setIsProcessing(requestId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const request = mockPendingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (userRole === "manager") {
      if (action === "approve") {
        toast({
          title: "Leave Request Approved by Manager",
          description: `Request ${requestId} has been forwarded to HR for final approval.`,
        });
      } else {
        toast({
          title: "Leave Request Rejected",
          description: `Request ${requestId} has been rejected by line manager.`,
        });
      }
    } else if (userRole === "hr") {
      if (action === "approve") {
        if (request.isManager) {
          toast({
            title: "Manager Leave Request Approved by HR",
            description: `Request ${requestId} has been forwarded to CEO for final approval.`,
          });
        } else {
          toast({
            title: "Leave Request Approved by HR",
            description: `Request ${requestId} has been approved successfully. Employee will be notified.`,
          });
        }
      } else {
        toast({
          title: "Leave Request Rejected by HR",
          description: `Request ${requestId} has been rejected. Employee will be notified.`,
        });
      }
    } else if (userRole === "ceo") {
      toast({
        title: action === "approve" ? "Manager Leave Request Approved by CEO" : "Manager Leave Request Rejected by CEO",
        description: `Request ${requestId} has been ${action}d successfully. Manager will be notified.`,
      });
    }
    
    setIsProcessing(null);
    setSelectedRequest(null);
    setApprovalComments("");
  };

  const getUrgencyBadge = (appliedDate: Date, startDate: Date) => {
    const daysUntilLeave = differenceInDays(startDate, new Date());
    const daysProcessing = differenceInDays(new Date(), appliedDate);
    
    if (daysUntilLeave <= 3) {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    } else if (daysProcessing > 7) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Overdue</Badge>;
    }
    return null;
  };

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
            <div className="text-2xl font-bold">{filteredRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Reviews</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredRequests.filter(r => differenceInDays(r.startDate, new Date()) <= 3).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Starting in ≤3 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Requests processed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {userRole === "manager" ? "Manager Leave Approvals" : userRole === "hr" ? "HR Leave Approvals" : "CEO Leave Approvals"}
          </CardTitle>
          <CardDescription>
            {userRole === "manager" 
              ? "Review and approve leave requests from your team members. Approved requests will be forwarded to HR."
              : userRole === "hr"
              ? "Review leave requests from employees and managers. Manager requests approved here are forwarded to CEO for final approval."
              : "Review leave requests from managers that have been approved by HR for final CEO approval."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, ID, or leave type..."
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
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="HR">Human Resources</SelectItem>
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
            {filteredRequests.length} pending request{filteredRequests.length !== 1 ? 's' : ''} found
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Line Manager</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.employeeId} • {request.department}
                          {request.isManager && <Badge variant="outline" className="ml-2 text-xs">Manager</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.days} day{request.days > 1 ? 's' : ''}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(request.startDate, "MMM dd, yyyy")}</div>
                        {request.days > 1 && (
                          <div className="text-muted-foreground">
                            to {format(request.endDate, "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(request.appliedDate, "MMM dd")}</TableCell>
                    <TableCell>
                      {getStatusBadge(request.approvalStatus)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{request.lineManager}</span>
                    </TableCell>
                    <TableCell>
                      {getUrgencyBadge(request.appliedDate, request.startDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Leave Request Details</DialogTitle>
                              <DialogDescription>
                                Review and process {request.employeeName}'s leave request
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRequest && (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Employee Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><span className="text-muted-foreground">Name:</span> {selectedRequest.employeeName}</div>
                                      <div><span className="text-muted-foreground">ID:</span> {selectedRequest.employeeId}</div>
                                      <div><span className="text-muted-foreground">Department:</span> {selectedRequest.department}</div>
                                    </div>
                                  </div>
                                  
                                   <div>
                                     <h4 className="text-sm font-medium mb-2">Leave Details</h4>
                                     <div className="space-y-1 text-sm">
                                       <div><span className="text-muted-foreground">Type:</span> {selectedRequest.leaveType}</div>
                                       <div><span className="text-muted-foreground">Duration:</span> {selectedRequest.days} days</div>
                                       <div><span className="text-muted-foreground">Remaining Balance:</span> {selectedRequest.remainingBalance} days</div>
                                       <div><span className="text-muted-foreground">Line Manager:</span> {selectedRequest.lineManager}</div>
                                       <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedRequest.approvalStatus)}</div>
                                     </div>
                                   </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">Reason</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    {selectedRequest.reason}
                                  </p>
                                </div>

                                {selectedRequest.handoverNotes && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Handover Notes</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                      {selectedRequest.handoverNotes}
                                    </p>
                                  </div>
                                )}

                                 {selectedRequest.emergencyContact && (
                                   <div>
                                     <h4 className="text-sm font-medium mb-2">Emergency Contact</h4>
                                     <p className="text-sm">{selectedRequest.emergencyContact}</p>
                                   </div>
                                 )}

                                 {selectedRequest.managerApproval && (
                                   <div>
                                     <h4 className="text-sm font-medium mb-2">Manager Approval</h4>
                                     <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                                       <div><span className="font-medium">Approved by:</span> {selectedRequest.managerApproval.approvedBy}</div>
                                       <div><span className="font-medium">Date:</span> {format(selectedRequest.managerApproval.approvedDate, "MMM dd, yyyy")}</div>
                                       {selectedRequest.managerApproval.comments && (
                                         <div><span className="font-medium">Comments:</span> {selectedRequest.managerApproval.comments}</div>
                                       )}
                                     </div>
                                   </div>
                                 )}

                                 <div>
                                   <h4 className="text-sm font-medium mb-2">
                                     {userRole === "manager" ? "Manager" : "HR"} Comments (Optional)
                                   </h4>
                                   <Textarea
                                     placeholder={`Add comments for your ${userRole === "manager" ? "approval" : "decision"}...`}
                                     value={approvalComments}
                                     onChange={(e) => setApprovalComments(e.target.value)}
                                     className="min-h-[80px]"
                                   />
                                 </div>

                                 <div className="flex gap-3 pt-4">
                                   <Button
                                     onClick={() => handleApproval(selectedRequest.id, "approve", approvalComments)}
                                     disabled={isProcessing === selectedRequest.id}
                                     className="flex-1"
                                   >
                                     <CheckCircle className="h-4 w-4 mr-2" />
                                     {isProcessing === selectedRequest.id ? "Processing..." : 
                                      userRole === "manager" ? "Approve & Forward to HR" : "Final Approval"}
                                   </Button>
                                   <Button
                                     variant="destructive"
                                     onClick={() => handleApproval(selectedRequest.id, "reject", approvalComments)}
                                     disabled={isProcessing === selectedRequest.id}
                                     className="flex-1"
                                   >
                                     <XCircle className="h-4 w-4 mr-2" />
                                     Reject
                                   </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          onClick={() => handleApproval(request.id, "approve")}
                          disabled={isProcessing === request.id}
                          className="h-8"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {userRole === "manager" ? "Approve" : "Final Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(request.id, "reject")}
                          disabled={isProcessing === request.id}
                          className="h-8"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending leave requests found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
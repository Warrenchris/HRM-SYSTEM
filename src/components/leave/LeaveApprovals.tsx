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
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  appliedDate: Date;
  emergencyContact?: string;
  handoverNotes?: string;
  remainingBalance: number;
}

const mockPendingRequests: PendingLeaveRequest[] = [
  {
    id: "LR005",
    employeeName: "Alice Johnson",
    employeeId: "EMP005",
    department: "Engineering",
    leaveType: "Annual Leave",
    startDate: new Date("2025-02-15"),
    endDate: new Date("2025-02-20"),
    days: 6,
    reason: "Family vacation to Hawaii. Planning this trip for months and already booked flights and accommodation.",
    appliedDate: new Date("2025-01-10"),
    emergencyContact: "+1 234-567-8900",
    handoverNotes: "All current projects are on track. Jane will cover my meetings and urgent issues.",
    remainingBalance: 18
  },
  {
    id: "LR006",
    employeeName: "Bob Wilson",
    employeeId: "EMP006",
    department: "Marketing",
    leaveType: "Sick Leave",
    startDate: new Date("2025-01-25"),
    endDate: new Date("2025-01-26"),
    days: 2,
    reason: "Medical procedure scheduled. Doctor recommended 2 days rest.",
    appliedDate: new Date("2025-01-20"),
    emergencyContact: "+1 234-567-8901",
    remainingBalance: 8
  },
  {
    id: "LR007",
    employeeName: "Carol Davis",
    employeeId: "EMP007",
    department: "HR",
    leaveType: "Personal Leave",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-01"),
    days: 1,
    reason: "Moving to new apartment. Need to coordinate with movers and utilities.",
    appliedDate: new Date("2025-01-15"),
    handoverNotes: "Sarah will handle any urgent HR matters. All interviews are rescheduled.",
    remainingBalance: 4
  }
];

export function LeaveApprovals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<PendingLeaveRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredRequests = mockPendingRequests.filter((request) => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || request.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleApproval = async (requestId: string, action: "approve" | "reject", comments?: string) => {
    setIsProcessing(requestId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: action === "approve" ? "Leave Request Approved" : "Leave Request Rejected",
      description: `Request ${requestId} has been ${action}d successfully.`,
    });
    
    setIsProcessing(null);
    setSelectedRequest(null);
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPendingRequests.length}</div>
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
              {mockPendingRequests.filter(r => differenceInDays(r.startDate, new Date()) <= 3).length}
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
            Pending Leave Approvals
          </CardTitle>
          <CardDescription>
            Review and approve leave requests from your team members
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
                  <TableHead>Balance</TableHead>
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
                      <Badge variant="outline" className="text-xs">
                        {request.remainingBalance} days
                      </Badge>
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

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    onClick={() => handleApproval(selectedRequest.id, "approve")}
                                    disabled={isProcessing === selectedRequest.id}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isProcessing === selectedRequest.id ? "Processing..." : "Approve"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleApproval(selectedRequest.id, "reject")}
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
                          Approve
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
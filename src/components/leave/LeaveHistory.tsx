import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string;
  appliedDate: Date;
  approvedBy?: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "LR001",
    type: "Annual Leave",
    startDate: new Date("2024-12-25"),
    endDate: new Date("2024-12-31"),
    days: 7,
    status: "approved",
    reason: "Christmas holidays",
    appliedDate: new Date("2024-11-15"),
    approvedBy: "John Manager"
  },
  {
    id: "LR002",
    type: "Sick Leave",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-15"),
    days: 1,
    status: "pending",
    reason: "Medical appointment",
    appliedDate: new Date("2025-01-10")
  },
  {
    id: "LR003",
    type: "Personal Leave",
    startDate: new Date("2024-11-10"),
    endDate: new Date("2024-11-12"),
    days: 3,
    status: "approved",
    reason: "Family emergency",
    appliedDate: new Date("2024-11-05"),
    approvedBy: "John Manager"
  },
  {
    id: "LR004",
    type: "Annual Leave",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-10-05"),
    days: 5,
    status: "rejected",
    reason: "Vacation",
    appliedDate: new Date("2024-09-20")
  }
];

const statusConfig = {
  pending: { color: "bg-yellow-500", label: "Pending" },
  approved: { color: "bg-green-500", label: "Approved" },
  rejected: { color: "bg-red-500", label: "Rejected" },
  cancelled: { color: "bg-gray-500", label: "Cancelled" }
};

export function LeaveHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRequests = mockLeaveRequests.filter((request) => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Request History
        </CardTitle>
        <CardDescription>
          View and manage all your leave requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reason or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Annual Leave">Annual Leave</SelectItem>
              <SelectItem value="Sick Leave">Sick Leave</SelectItem>
              <SelectItem value="Personal Leave">Personal Leave</SelectItem>
              <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {mockLeaveRequests.length} requests
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.type}</TableCell>
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
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{format(request.appliedDate, "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No leave requests found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useLeaveRequests } from "@/hooks/useLeaveData";

// Mock employee ID - in real app, get from auth context
const MOCK_EMPLOYEE_ID = "123e4567-e89b-12d3-a456-426614174000";

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
  
  const { requests, loading, error, cancelRequest } = useLeaveRequests(MOCK_EMPLOYEE_ID);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading leave requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.leave_type?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.leave_type?.name === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        {config.label}
      </Badge>
    );
  };

  const handleCancelRequest = async (requestId: string) => {
    if (confirm("Are you sure you want to cancel this leave request?")) {
      await cancelRequest(requestId);
    }
  };

  const uniqueLeaveTypes = Array.from(
    new Set(requests.map(r => r.leave_type?.name).filter(Boolean))
  );

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
              {uniqueLeaveTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
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
                  <TableCell>{request.leave_type?.name || 'Unknown'}</TableCell>
                  <TableCell>{request.total_days} day{request.total_days > 1 ? 's' : ''}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(request.start_date), "MMM dd, yyyy")}</div>
                      {request.total_days > 1 && (
                        <div className="text-muted-foreground">
                          to {format(new Date(request.end_date), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{format(new Date(request.applied_date), "MMM dd, yyyy")}</TableCell>
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleCancelRequest(request.id)}
                          >
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
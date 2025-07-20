import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Eye, Edit, Check, X } from "lucide-react";

interface ProcurementRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "submitted" | "approved" | "rejected" | "converted";
  estimatedCost: number;
  requestDate: string;
  requiredDate: string;
  approver?: string;
}

export function ProcurementRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const requests: ProcurementRequest[] = [
    {
      id: "1",
      requestNumber: "PR-2024-001",
      title: "New Employee Laptops",
      description: "Purchase 10 laptops for new engineering hires",
      requestedBy: "John Doe",
      department: "IT",
      priority: "high",
      status: "submitted",
      estimatedCost: 25000,
      requestDate: "2024-07-15",
      requiredDate: "2024-07-25"
    },
    {
      id: "2",
      requestNumber: "PR-2024-002",
      title: "Office Stationery",
      description: "Monthly office supplies replenishment",
      requestedBy: "Sarah Wilson",
      department: "HR",
      priority: "medium",
      status: "approved",
      estimatedCost: 450,
      requestDate: "2024-07-18",
      requiredDate: "2024-07-22",
      approver: "Mike Johnson"
    },
    {
      id: "3",
      requestNumber: "PR-2024-003",
      title: "Safety Equipment",
      description: "Personal protective equipment for factory workers",
      requestedBy: "Mike Johnson",
      department: "Operations",
      priority: "urgent",
      status: "converted",
      estimatedCost: 15000,
      requestDate: "2024-07-10",
      requiredDate: "2024-07-20",
      approver: "Emma Davis"
    },
    {
      id: "4",
      requestNumber: "PR-2024-004",
      title: "Marketing Materials",
      description: "Promotional brochures and business cards",
      requestedBy: "Emma Davis",
      department: "Marketing",
      priority: "low",
      status: "draft",
      estimatedCost: 1200,
      requestDate: "2024-07-19",
      requiredDate: "2024-07-26"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft", className: "" },
      submitted: { variant: "outline" as const, label: "Submitted", className: "" },
      approved: { variant: "default" as const, label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive" as const, label: "Rejected", className: "" },
      converted: { variant: "default" as const, label: "Converted", className: "bg-blue-100 text-blue-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge 
        variant={config.variant} 
        className={config.className || ""}
      >
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: "secondary" as const, label: "Low", className: "" },
      medium: { variant: "outline" as const, label: "Medium", className: "" },
      high: { variant: "default" as const, label: "High", className: "bg-orange-100 text-orange-800" },
      urgent: { variant: "destructive" as const, label: "Urgent", className: "" }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge 
        variant={config.variant} 
        className={config.className || ""}
      >
        {config.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = () => {
    toast({
      title: "Request Created",
      description: "New procurement request has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleApprove = (requestId: string) => {
    toast({
      title: "Request Approved",
      description: "Procurement request has been approved.",
    });
  };

  const handleReject = (requestId: string) => {
    toast({
      title: "Request Rejected",
      description: "Procurement request has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Procurement Request</DialogTitle>
              <DialogDescription>
                Submit a new request for procurement approval
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title</Label>
                <Input id="title" placeholder="Enter request title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what needs to be procured..."
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated-cost">Estimated Cost</Label>
                  <Input id="estimated-cost" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="required-date">Required Date</Label>
                  <Input id="required-date" type="date" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Requests</CardTitle>
          <CardDescription>
            Manage procurement requests and approval workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Required Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.requestNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {request.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>${request.estimatedCost.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.requiredDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "submitted" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
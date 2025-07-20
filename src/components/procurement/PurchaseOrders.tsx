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
import { Search, Plus, Eye, Edit, Download, Filter } from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  items: string;
  amount: number;
  status: "draft" | "pending" | "approved" | "delivered" | "cancelled";
  requestedBy: string;
  department: string;
  requestDate: string;
  expectedDate: string;
}

export function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: "1",
      poNumber: "PO-2024-001",
      vendor: "TechCorp Solutions",
      items: "Laptops (10x), Monitors (10x)",
      amount: 25000,
      status: "approved",
      requestedBy: "John Doe",
      department: "IT",
      requestDate: "2024-07-15",
      expectedDate: "2024-07-25"
    },
    {
      id: "2",
      poNumber: "PO-2024-002",
      vendor: "Office Supplies Inc",
      items: "Printer Paper, Pens, Notebooks",
      amount: 450,
      status: "pending",
      requestedBy: "Sarah Wilson",
      department: "HR",
      requestDate: "2024-07-18",
      expectedDate: "2024-07-22"
    },
    {
      id: "3",
      poNumber: "PO-2024-003",
      vendor: "Industrial Equipment Ltd",
      items: "Safety Equipment, Tools",
      amount: 15000,
      status: "delivered",
      requestedBy: "Mike Johnson",
      department: "Operations",
      requestDate: "2024-07-10",
      expectedDate: "2024-07-20"
    },
    {
      id: "4",
      poNumber: "PO-2024-004",
      vendor: "Marketing Materials Co",
      items: "Brochures, Business Cards",
      amount: 1200,
      status: "draft",
      requestedBy: "Emma Davis",
      department: "Marketing",
      requestDate: "2024-07-19",
      expectedDate: "2024-07-26"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft", className: "" },
      pending: { variant: "outline" as const, label: "Pending", className: "" },
      approved: { variant: "default" as const, label: "Approved", className: "" },
      delivered: { variant: "default" as const, label: "Delivered", className: "bg-green-100 text-green-800" },
      cancelled: { variant: "destructive" as const, label: "Cancelled", className: "" }
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

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    toast({
      title: "Purchase Order Created",
      description: "New purchase order has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search purchase orders..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for vendor procurement
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="techcorp">TechCorp Solutions</SelectItem>
                        <SelectItem value="office">Office Supplies Inc</SelectItem>
                        <SelectItem value="industrial">Industrial Equipment Ltd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items">Items Description</Label>
                  <Textarea
                    id="items"
                    placeholder="Describe the items to be purchased..."
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Estimated Amount</Label>
                    <Input id="amount" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-date">Expected Delivery</Label>
                    <Input id="expected-date" type="date" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder}>Create Purchase Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Manage and track all purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.poNumber}</TableCell>
                  <TableCell>{order.vendor}</TableCell>
                  <TableCell className="max-w-xs truncate">{order.items}</TableCell>
                  <TableCell>${order.amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.requestedBy}</TableCell>
                  <TableCell>{order.department}</TableCell>
                  <TableCell>{new Date(order.expectedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
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
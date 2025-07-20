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
import { Search, Plus, Eye, Edit, Star, StarOff } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: "active" | "inactive" | "pending";
  totalOrders: number;
  totalSpend: number;
  preferredVendor: boolean;
}

export function VendorManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const vendors: Vendor[] = [
    {
      id: "1",
      name: "TechCorp Solutions",
      category: "Technology",
      contact: "John Smith",
      email: "john@techcorp.com",
      phone: "+1 (555) 123-4567",
      address: "123 Tech Street, Silicon Valley, CA 94000",
      rating: 4.8,
      status: "active",
      totalOrders: 45,
      totalSpend: 125000,
      preferredVendor: true
    },
    {
      id: "2",
      name: "Office Supplies Inc",
      category: "Office Supplies",
      contact: "Sarah Johnson",
      email: "sarah@officesupplies.com",
      phone: "+1 (555) 234-5678",
      address: "456 Office Blvd, Business City, NY 10001",
      rating: 4.2,
      status: "active",
      totalOrders: 32,
      totalSpend: 15000,
      preferredVendor: false
    },
    {
      id: "3",
      name: "Industrial Equipment Ltd",
      category: "Industrial",
      contact: "Mike Wilson",
      email: "mike@industrial.com",
      phone: "+1 (555) 345-6789",
      address: "789 Industrial Ave, Factory Town, TX 75000",
      rating: 4.5,
      status: "active",
      totalOrders: 28,
      totalSpend: 95000,
      preferredVendor: true
    },
    {
      id: "4",
      name: "Marketing Materials Co",
      category: "Marketing",
      contact: "Emma Davis",
      email: "emma@marketing.com",
      phone: "+1 (555) 456-7890",
      address: "321 Creative Lane, Design City, IL 60000",
      rating: 3.9,
      status: "pending",
      totalOrders: 12,
      totalSpend: 8500,
      preferredVendor: false
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { variant: "secondary" as const, label: "Inactive", className: "" },
      pending: { variant: "outline" as const, label: "Pending", className: "" }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || vendor.category.toLowerCase() === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateVendor = () => {
    toast({
      title: "Vendor Added",
      description: "New vendor has been added successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const togglePreferred = (vendorId: string) => {
    toast({
      title: "Vendor Updated",
      description: "Preferred vendor status has been updated.",
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
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="office supplies">Office Supplies</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Add a new vendor to your procurement system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor-name">Vendor Name</Label>
                  <Input id="vendor-name" placeholder="Enter vendor name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input id="contact" placeholder="Contact person name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="vendor@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Initial Rating</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter vendor address..."
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVendor}>Add Vendor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <CardDescription>
            Manage your vendor relationships and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground">{vendor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.contact}</div>
                      <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.floor(vendor.rating))}
                      <span className="ml-1 text-sm">{vendor.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.totalOrders}</TableCell>
                  <TableCell>${vendor.totalSpend.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePreferred(vendor.id)}
                    >
                      {vendor.preferredVendor ? (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
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
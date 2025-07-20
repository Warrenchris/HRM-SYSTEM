import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Plus, Edit, Trash2, Building, Users, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  name: string;
  code: string;
  type: "headquarters" | "branch" | "remote";
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  manager: string;
  employeeCount: number;
  status: "active" | "inactive";
}

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "B001",
      name: "Head Office",
      code: "HQ",
      type: "headquarters",
      address: "TechHub Building, Westlands",
      city: "Nairobi",
      state: "Nairobi County",
      country: "Kenya",
      postalCode: "00100",
      phone: "+254-700-123-456",
      email: "nairobi@techcorp.co.ke",
      manager: "Sarah Manager",
      employeeCount: 150,
      status: "active",
    },
    {
      id: "B002",
      name: "Mombasa Branch",
      code: "MBA",
      type: "branch",
      address: "Mombasa Business Centre",
      city: "Mombasa",
      state: "Mombasa County",
      country: "Kenya",
      postalCode: "80100",
      phone: "+254-741-654-321",
      email: "mombasa@techcorp.co.ke",
      manager: "John Regional",
      employeeCount: 45,
      status: "active",
    },
    {
      id: "B003",
      name: "Kampala Office",
      code: "KLA",
      type: "branch",
      address: "Innovation Hub, Nakasero",
      city: "Kampala",
      state: "Central Region",
      country: "Uganda",
      postalCode: "256",
      phone: "+256-700-987-654",
      email: "kampala@techcorp.co.ke",
      manager: "Mary Coordinator",
      employeeCount: 30,
      status: "active",
    },
    {
      id: "B004",
      name: "Remote Workers",
      code: "RMT",
      type: "remote",
      address: "Various Locations",
      city: "N/A",
      state: "N/A",
      country: "Multiple",
      postalCode: "N/A",
      phone: "N/A",
      email: "remote@techcorp.co.ke",
      manager: "Remote Coordinator",
      employeeCount: 20,
      status: "active",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "branch" as Branch["type"],
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    email: "",
    manager: "",
  });

  const { toast } = useToast();

  const branchTypes = [
    { value: "headquarters", label: "Headquarters" },
    { value: "branch", label: "Branch Office" },
    { value: "remote", label: "Remote Location" },
  ];

  const managers = [
    "Sarah Manager", "John Regional", "Mary Coordinator", 
    "David Branch", "Lisa Operations", "Mike District"
  ];

  const getTypeBadge = (type: Branch["type"]) => {
    switch (type) {
      case "headquarters":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Headquarters</Badge>;
      case "branch":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Branch</Badge>;
      case "remote":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Remote</Badge>;
    }
  };

  const getStatusBadge = (status: Branch["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
    }
  };

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code,
        type: branch.type,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        country: branch.country,
        postalCode: branch.postalCode,
        phone: branch.phone,
        email: branch.email,
        manager: branch.manager,
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        code: "",
        type: "branch",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        phone: "",
        email: "",
        manager: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingBranch) {
      setBranches(prev => prev.map(branch => 
        branch.id === editingBranch.id 
          ? { ...branch, ...formData }
          : branch
      ));
      toast({
        title: "Branch Updated",
        description: `${formData.name} has been updated successfully`,
      });
    } else {
      const newBranch: Branch = {
        id: `B${(branches.length + 1).toString().padStart(3, '0')}`,
        ...formData,
        employeeCount: 0,
        status: "active",
      };
      setBranches(prev => [...prev, newBranch]);
      toast({
        title: "Branch Created",
        description: `${formData.name} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (branchId: string, branchName: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== branchId));
    toast({
      title: "Branch Deleted",
      description: `${branchName} has been deleted`,
    });
  };

  const totalEmployees = branches.reduce((sum, branch) => sum + branch.employeeCount, 0);
  const activeBranches = branches.filter(branch => branch.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Locations</p>
                <p className="text-2xl font-bold">{activeBranches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold">{new Set(branches.map(b => b.country)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Branch Locations
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBranch ? "Edit Branch" : "Add New Branch"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch-name">Branch Name *</Label>
                      <Input
                        id="branch-name"
                        placeholder="Enter branch name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch-code">Branch Code *</Label>
                      <Input
                        id="branch-code"
                        placeholder="e.g., HQ, MBA"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Branch Type</Label>
                    <Select value={formData.type} onValueChange={(value: Branch["type"]) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branchTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/County</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Branch Manager</Label>
                    <Select value={formData.manager} onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager} value={manager}>
                            {manager}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingBranch ? "Update" : "Create"} Branch
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {branch.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(branch.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{branch.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {branch.country}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.employeeCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(branch.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {branch.type !== "headquarters" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(branch.id, branch.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
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
import { Folder, Plus, Edit, Trash2, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head: string;
  parentId?: string;
  employeeCount: number;
  budget?: number;
  location: string;
  status: "active" | "inactive";
  costCenter: string;
}

export function DepartmentSetup() {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: "D001",
      name: "Information Technology",
      code: "IT",
      description: "Technology infrastructure and software development",
      head: "Sarah Manager",
      employeeCount: 45,
      budget: 2500000,
      location: "Head Office",
      status: "active",
      costCenter: "CC-IT-001",
    },
    {
      id: "D002",
      name: "Software Development",
      code: "DEV",
      description: "Application development and programming",
      head: "John Lead Developer",
      parentId: "D001",
      employeeCount: 25,
      budget: 1800000,
      location: "Head Office",
      status: "active",
      costCenter: "CC-IT-002",
    },
    {
      id: "D003",
      name: "DevOps & Infrastructure",
      code: "OPS",
      description: "System operations and cloud infrastructure",
      head: "Mike Operations",
      parentId: "D001",
      employeeCount: 12,
      budget: 500000,
      location: "Head Office",
      status: "active",
      costCenter: "CC-IT-003",
    },
    {
      id: "D004",
      name: "Human Resources",
      code: "HR",
      description: "Employee management and organizational development",
      head: "Emily HR Manager",
      employeeCount: 15,
      budget: 800000,
      location: "Head Office",
      status: "active",
      costCenter: "CC-HR-001",
    },
    {
      id: "D005",
      name: "Finance & Accounting",
      code: "FIN",
      description: "Financial planning, accounting, and budget management",
      head: "David Finance Manager",
      employeeCount: 18,
      budget: 600000,
      location: "Head Office",
      status: "active",
      costCenter: "CC-FIN-001",
    },
    {
      id: "D006",
      name: "Sales & Marketing",
      code: "SM",
      description: "Customer acquisition and brand management",
      head: "Lisa Marketing Director",
      employeeCount: 22,
      budget: 1200000,
      location: "Multiple",
      status: "active",
      costCenter: "CC-SM-001",
    },
    {
      id: "D007",
      name: "Customer Support",
      code: "CS",
      description: "Customer service and technical support",
      head: "Alex Support Manager",
      employeeCount: 20,
      budget: 400000,
      location: "Multiple",
      status: "active",
      costCenter: "CC-CS-001",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    head: "",
    parentId: "",
    budget: "",
    location: "",
    costCenter: "",
  });

  const { toast } = useToast();

  const departmentHeads = [
    "Sarah Manager", "John Lead Developer", "Mike Operations", "Emily HR Manager",
    "David Finance Manager", "Lisa Marketing Director", "Alex Support Manager",
    "Ryan Team Lead", "Grace Supervisor", "Oliver Coordinator"
  ];

  const locations = ["Head Office", "Mombasa Branch", "Kampala Office", "Multiple", "Remote"];

  const getStatusBadge = (status: Department["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
    }
  };

  const getParentDepartments = () => {
    return departments.filter(dept => !dept.parentId);
  };

  const getSubDepartments = (parentId: string) => {
    return departments.filter(dept => dept.parentId === parentId);
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description,
        head: department.head,
        parentId: department.parentId || "",
        budget: department.budget?.toString() || "",
        location: department.location,
        costCenter: department.costCenter,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        head: "",
        parentId: "",
        budget: "",
        location: "",
        costCenter: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.head) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingDepartment) {
      setDepartments(prev => prev.map(dept => 
        dept.id === editingDepartment.id 
          ? { 
              ...dept, 
              ...formData, 
              budget: formData.budget ? parseFloat(formData.budget) : undefined 
            }
          : dept
      ));
      toast({
        title: "Department Updated",
        description: `${formData.name} has been updated successfully`,
      });
    } else {
      const newDepartment: Department = {
        id: `D${(departments.length + 1).toString().padStart(3, '0')}`,
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        parentId: formData.parentId === "none" ? undefined : formData.parentId || undefined,
        employeeCount: 0,
        status: "active",
      };
      setDepartments(prev => [...prev, newDepartment]);
      toast({
        title: "Department Created",
        description: `${formData.name} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (departmentId: string, departmentName: string) => {
    // Check if department has sub-departments
    const hasSubDepartments = departments.some(dept => dept.parentId === departmentId);
    if (hasSubDepartments) {
      toast({
        title: "Cannot Delete Department",
        description: "Please remove or reassign sub-departments first",
        variant: "destructive",
      });
      return;
    }

    setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
    toast({
      title: "Department Deleted",
      description: `${departmentName} has been deleted`,
    });
  };

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const parentDepartments = getParentDepartments();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
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
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Department Heads</p>
                <p className="text-2xl font-bold">{new Set(departments.map(d => d.head)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  KES {(totalBudget / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Department Structure
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? "Edit Department" : "Add New Department"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dept-name">Department Name *</Label>
                      <Input
                        id="dept-name"
                        placeholder="Enter department name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dept-code">Department Code *</Label>
                      <Input
                        id="dept-code"
                        placeholder="e.g., IT, HR, FIN"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Department description and responsibilities"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Department Head *</Label>
                      <Select value={formData.head} onValueChange={(value) => setFormData(prev => ({ ...prev, head: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department head" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentHeads.map((head) => (
                            <SelectItem key={head} value={head}>
                              {head}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parent Department (Optional)</Label>
                      <Select value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Top Level)</SelectItem>
                          {parentDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Annual Budget (KES)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="Enter budget amount"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cost-center">Cost Center</Label>
                    <Input
                      id="cost-center"
                      placeholder="e.g., CC-IT-001"
                      value={formData.costCenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingDepartment ? "Update" : "Create"} Department
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Parent Departments */}
            {parentDepartments.map((parentDept) => (
              <div key={parentDept.id} className="space-y-2">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{parentDept.name}</h3>
                          <Badge variant="outline">{parentDept.code}</Badge>
                          {getStatusBadge(parentDept.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {parentDept.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Head: {parentDept.head}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {parentDept.employeeCount} employees
                          </span>
                          <span>Location: {parentDept.location}</span>
                          {parentDept.budget && (
                            <span>Budget: KES {parentDept.budget.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(parentDept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(parentDept.id, parentDept.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-departments */}
                <div className="ml-8 space-y-2">
                  {getSubDepartments(parentDept.id).map((subDept) => (
                    <Card key={subDept.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{subDept.name}</h4>
                              <Badge variant="outline" className="text-xs">{subDept.code}</Badge>
                              {getStatusBadge(subDept.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {subDept.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {subDept.head}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {subDept.employeeCount}
                              </span>
                              {subDept.budget && (
                                <span>KES {subDept.budget.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(subDept)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(subDept.id, subDept.name)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* Standalone Departments */}
            {departments.filter(dept => !dept.parentId && !parentDepartments.find(p => p.id === dept.id)).map((dept) => (
              <Card key={dept.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{dept.name}</h3>
                        <Badge variant="outline">{dept.code}</Badge>
                        {getStatusBadge(dept.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {dept.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Head: {dept.head}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {dept.employeeCount} employees
                        </span>
                        <span>Location: {dept.location}</span>
                        {dept.budget && (
                          <span>Budget: KES {dept.budget.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(dept)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(dept.id, dept.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
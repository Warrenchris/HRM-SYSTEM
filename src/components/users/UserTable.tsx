import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Search, Filter, MoreHorizontal, Shield, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  permissions: string[];
  avatar?: string;
}

export function UserTable() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const { toast } = useToast();

  const users: User[] = [
    {
      id: "U001",
      name: "Sarah Manager",
      email: "sarah.manager@company.com",
      role: "Admin",
      department: "IT",
      status: "active",
      lastLogin: "2024-07-23 09:30",
      permissions: ["user_management", "system_settings", "reports"],
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah Manager",
    },
    {
      id: "U002",
      name: "John Developer",
      email: "john.dev@company.com",
      role: "Employee",
      department: "Engineering",
      status: "active",
      lastLogin: "2024-07-23 08:45",
      permissions: ["view_own_data", "submit_requests"],
    },
    {
      id: "U003",
      name: "Emily HR",
      email: "emily.hr@company.com",
      role: "HR Manager",
      department: "Human Resources",
      status: "active",
      lastLogin: "2024-07-22 16:20",
      permissions: ["employee_management", "payroll_access", "reports"],
    },
    {
      id: "U004",
      name: "Mike Finance",
      email: "mike.finance@company.com",
      role: "Finance Manager",
      department: "Finance",
      status: "active",
      lastLogin: "2024-07-23 07:15",
      permissions: ["payroll_management", "expense_approval", "financial_reports"],
    },
    {
      id: "U005",
      name: "Lisa Designer",
      email: "lisa.design@company.com",
      role: "Employee",
      department: "Design",
      status: "inactive",
      lastLogin: "2024-07-20 14:30",
      permissions: ["view_own_data", "submit_requests"],
    },
  ];

  const roles = ["Admin", "HR Manager", "Finance Manager", "Department Head", "Employee"];
  const departments = ["IT", "Engineering", "Human Resources", "Finance", "Design", "Marketing", "Sales"];

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      "Admin": "bg-purple-100 text-purple-800 hover:bg-purple-100",
      "HR Manager": "bg-blue-100 text-blue-800 hover:bg-blue-100",
      "Finance Manager": "bg-green-100 text-green-800 hover:bg-green-100",
      "Department Head": "bg-orange-100 text-orange-800 hover:bg-orange-100",
      "Employee": "bg-gray-100 text-gray-800 hover:bg-gray-100",
    };
    
    return <Badge className={roleColors[role] || "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{role}</Badge>;
  };

  const handleCreateUser = () => {
    if (!userName || !userEmail || !userRole || !userDepartment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "User Created",
      description: `User ${userName} has been created successfully`,
    });

    // Reset form
    setUserName("");
    setUserEmail("");
    setUserRole("");
    setUserDepartment("");
    setIsDialogOpen(false);
  };

  const handleToggleStatus = (userId: string, userName: string, currentStatus: User["status"]) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toast({
      title: "Status Updated",
      description: `${userName} has been ${newStatus === "active" ? "activated" : "deactivated"}`,
    });
  };

  const filteredUsers = users.filter(user => {
    const statusMatch = selectedFilter === "all" || user.status === selectedFilter;
    const searchMatch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-name">Full Name *</Label>
                      <Input
                        id="user-name"
                        placeholder="Enter full name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="user-email">Email *</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="user@company.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Role *</Label>
                      <Select value={userRole} onValueChange={setUserRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Department *</Label>
                      <Select value={userDepartment} onValueChange={setUserDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser}>
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.lastLogin).toLocaleDateString()} <br />
                      <span className="text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() => handleToggleStatus(user.id, user.name, user.status)}
                      />
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active: {users.filter(u => u.status === "active").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Inactive: {users.filter(u => u.status === "inactive").length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
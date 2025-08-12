import { useState, useEffect } from "react";
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
import { Users, Plus, Search, Filter, MoreHorizontal, Shield, Mail, Eye, EyeOff, Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  avatar?: string;
  employeeId?: string;
  position?: string;
  phone?: string;
  joinDate?: string;
  salary?: number;
  employeeCode?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  employee_id: string;
  phone?: string;
  join_date?: string;
  salary?: number;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export function UserTable() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmployeeSelectDialogOpen, setIsEmployeeSelectDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userPosition, setUserPosition] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userSalary, setUserSalary] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userDateOfBirth, setUserDateOfBirth] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userMaritalStatus, setUserMaritalStatus] = useState("");
  const [userEmergencyContact, setUserEmergencyContact] = useState("");
  const [userEmergencyPhone, setUserEmergencyPhone] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          employees(
            first_name, 
            last_name, 
            department, 
            email, 
            position, 
            phone, 
            join_date,
            salary,
            employee_id,
            address,
            date_of_birth,
            gender,
            marital_status,
            emergency_contact,
            emergency_phone
          )
        `);

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      const formattedUsers: User[] = profiles?.map(profile => ({
        id: profile.user_id,
        employeeId: profile.employee_id,
        name: profile.employees 
          ? `${profile.employees.first_name} ${profile.employees.last_name}`
          : 'Unknown User',
        email: profile.employees?.email || 'No email',
        role: profile.role === 'admin' ? 'Admin' : 
              profile.role === 'hr' ? 'HR Manager' :
              profile.role === 'manager' ? 'Department Head' : 'Employee',
        department: profile.employees?.department || 'Unknown',
        status: profile.is_active ? 'active' : 'inactive',
        lastLogin: new Date().toISOString(), // You can track this separately later
        position: profile.employees?.position || '',
        phone: profile.employees?.phone || '',
        joinDate: profile.employees?.join_date || '',
        salary: profile.employees?.salary || 0,
        employeeCode: profile.employees?.employee_id || '',
        address: profile.employees?.address || '',
        dateOfBirth: profile.employees?.date_of_birth || '',
        gender: profile.employees?.gender || '',
        maritalStatus: profile.employees?.marital_status || '',
        emergencyContact: profile.employees?.emergency_contact || '',
        emergencyPhone: profile.employees?.emergency_phone || '',
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Get all employees who already have user accounts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('employee_id')
        .not('employee_id', 'is', null);

      const existingIds = new Set((profiles || []).map((p: any) => p.employee_id));

      // Fetch active employees and filter out those already linked to a profile
      const { data: employeesData, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, department, position, employee_id')
        .eq('status', 'active')
        .order('first_name');

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      const available = (employeesData || []).filter((e: any) => !existingIds.has(e.id));
      setEmployees(available);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const roles = ["Admin", "HR Manager", "Department Head", "Employee"];
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

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setUserName(`${employee.first_name} ${employee.last_name}`);
    setUserEmail(employee.email);
    setUserDepartment(employee.department);
    setUserPosition(employee.position);
    setUserPhone(employee.phone || "");
    setUserSalary(employee.salary?.toString() || "");
    setUserAddress(employee.address || "");
    setUserDateOfBirth(employee.date_of_birth || "");
    setUserGender(employee.gender || "");
    setUserMaritalStatus(employee.marital_status || "");
    setUserEmergencyContact(employee.emergency_contact || "");
    setUserEmergencyPhone(employee.emergency_phone || "");
    setIsEmployeeSelectDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!selectedEmployee || !userRole || !userPassword) {
      toast({
        title: "Missing Information",
        description: "Please select an employee, role, and password",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Try normal signup first (works when GoTrue is configured for signups)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: selectedEmployee.email,
        password: userPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      let createdUserId: string | null = authData?.user?.id || null;

      // If signup fails locally (e.g., missing SMTP), fall back to RPC helper
      if (authError || !createdUserId) {
        const { data: rpcUserId, error: rpcError } = await supabase.rpc('dev_create_auth_user', {
          _email: selectedEmployee.email,
          _password: userPassword,
        });

        if (rpcError || !rpcUserId) {
          toast({
            title: "Error Creating User",
            description: rpcError?.message || authError?.message || 'Database error saving new user',
            variant: "destructive",
          });
          return;
        }

        createdUserId = rpcUserId as unknown as string;
      }

      // Update employee record with auth email
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          auth_email: selectedEmployee.email,
        })
        .eq('id', selectedEmployee.id);

      if (employeeError) {
        console.error('Error updating employee:', employeeError);
      }

      // Update profile with role and employee link
      const roleMapping = {
        'Admin': 'admin',
        'HR Manager': 'hr', 
        'Department Head': 'manager',
        'Employee': 'employee'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: roleMapping[userRole as keyof typeof roleMapping] || 'employee',
          employee_id: selectedEmployee.id
        })
        .eq('user_id', createdUserId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      toast({
        title: "User Created",
        description: `User account created for ${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
      });

      // Reset form and refresh data
      setSelectedEmployee(null);
      setUserName("");
      setUserEmail("");
      setUserRole("");
      setUserDepartment("");
      setUserPassword("");
      setUserPosition("");
      setUserPhone("");
      setUserSalary("");
      setUserAddress("");
      setUserDateOfBirth("");
      setUserGender("");
      setUserMaritalStatus("");
      setUserEmergencyContact("");
      setUserEmergencyPhone("");
      setIsDialogOpen(false);
      fetchUsers();
      fetchEmployees();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (userId: string, userName: string, currentStatus: User["status"]) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus === "active" })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Updated",
        description: `${userName} has been ${newStatus === "active" ? "activated" : "deactivated"}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserDepartment(user.department);
    setUserPosition(user.position || "");
    setUserPhone(user.phone || "");
    setUserSalary(user.salary?.toString() || "");
    setUserAddress(user.address || "");
    setUserDateOfBirth(user.dateOfBirth || "");
    setUserGender(user.gender || "");
    setUserMaritalStatus(user.maritalStatus || "");
    setUserEmergencyContact(user.emergencyContact || "");
    setUserEmergencyPhone(user.emergencyPhone || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !userName || !userEmail || !userRole || !userDepartment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // Update employee record if linked
      if (editingUser.employeeId) {
        const [firstName, ...lastNameParts] = userName.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const { error: employeeError } = await supabase
          .from('employees')
          .update({
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
            department: userDepartment,
            position: userPosition || userRole,
            phone: userPhone,
            salary: userSalary ? parseFloat(userSalary) : null,
            address: userAddress,
            date_of_birth: userDateOfBirth || null,
            gender: userGender,
            marital_status: userMaritalStatus,
            emergency_contact: userEmergencyContact,
            emergency_phone: userEmergencyPhone,
          })
          .eq('id', editingUser.employeeId);

        if (employeeError) {
          console.error('Error updating employee:', employeeError);
        }
      }

      // Update profile role
      const roleMapping = {
        'Admin': 'admin',
        'HR Manager': 'hr', 
        'Department Head': 'manager',
        'Employee': 'employee'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: roleMapping[userRole as keyof typeof roleMapping] || 'employee'
        })
        .eq('user_id', editingUser.id);

      if (profileError) {
        toast({
          title: "Error",
          description: "Failed to update user profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Updated",
        description: `${userName} has been updated successfully`,
      });

      // Reset form and refresh data
      setUserName("");
      setUserEmail("");
      setUserRole("");
      setUserDepartment("");
      setUserPosition("");
      setUserPhone("");
      setUserSalary("");
      setUserAddress("");
      setUserDateOfBirth("");
      setUserGender("");
      setUserMaritalStatus("");
      setUserEmergencyContact("");
      setUserEmergencyPhone("");
      setEditingUser(null);
      setIsEditDialogOpen(false);
      fetchUsers();

    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
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
            <div className="flex gap-2">
              <Dialog open={isEmployeeSelectDialogOpen} onOpenChange={setIsEmployeeSelectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create User from Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Select Employee to Create User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="rounded-md border max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees
                            .filter(emp => 
                              emp.first_name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                              emp.last_name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                              emp.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                              emp.employee_id?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                            )
                            .map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarFallback>
                                        {`${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{employee.employee_id}</TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSelectEmployee(employee)}
                                  >
                                    Select
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create User Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {selectedEmployee && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Selected Employee</h3>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {`${selectedEmployee.first_name[0]}${selectedEmployee.last_name[0]}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</div>
                          <div className="text-sm text-muted-foreground">{selectedEmployee.email}</div>
                          <div className="text-sm text-muted-foreground">{selectedEmployee.department} • {selectedEmployee.position}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Role *</Label>
                      <Select value={userRole} onValueChange={setUserRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.filter(role => role !== 'Admin').map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="user-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedEmployee(null);
                      setUserRole("");
                      setUserPassword("");
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={creating || !selectedEmployee}>
                      {creating ? "Creating..." : "Create User Account"}
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">{user.employeeCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.position}</div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <div className="text-sm">{user.phone || 'Not provided'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() => handleToggleStatus(user.id, user.name, user.status)}
                      />
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-name">Full Name *</Label>
                <Input
                  id="edit-user-name"
                  placeholder="Enter full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-email">Email *</Label>
                <Input
                  id="edit-user-email"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-position">Position</Label>
                <Input
                  id="edit-user-position"
                  placeholder="Enter position/title"
                  value={userPosition}
                  onChange={(e) => setUserPosition(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-phone">Phone</Label>
                <Input
                  id="edit-user-phone"
                  placeholder="Enter phone number"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-salary">Salary</Label>
                <Input
                  id="edit-user-salary"
                  type="number"
                  placeholder="Enter salary"
                  value={userSalary}
                  onChange={(e) => setUserSalary(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-dob">Date of Birth</Label>
                <Input
                  id="edit-user-dob"
                  type="date"
                  value={userDateOfBirth}
                  onChange={(e) => setUserDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select value={userGender} onValueChange={setUserGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select value={userMaritalStatus} onValueChange={setUserMaritalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-user-address">Address</Label>
              <Input
                id="edit-user-address"
                placeholder="Enter address"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-emergency-contact">Emergency Contact</Label>
                <Input
                  id="edit-user-emergency-contact"
                  placeholder="Emergency contact name"
                  value={userEmergencyContact}
                  onChange={(e) => setUserEmergencyContact(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-emergency-phone">Emergency Phone</Label>
                <Input
                  id="edit-user-emergency-phone"
                  placeholder="Emergency contact phone"
                  value={userEmergencyPhone}
                  onChange={(e) => setUserEmergencyPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={updating}>
                {updating ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
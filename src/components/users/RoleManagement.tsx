import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus, Users, Settings, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
  isSystemRole: boolean;
}

export function RoleManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  const roles: Role[] = [
    {
      id: "R001",
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: ["*"],
      userCount: 2,
      color: "bg-red-100 text-red-800 hover:bg-red-100",
      isSystemRole: true,
    },
    {
      id: "R002",
      name: "Admin",
      description: "Administrative access to most system features",
      permissions: ["user_management", "system_settings", "reports", "audit_logs"],
      userCount: 5,
      color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      isSystemRole: true,
    },
    {
      id: "R003",
      name: "HR Manager",
      description: "Human resources management and employee data access",
      permissions: ["employee_management", "payroll_access", "leave_management", "performance_reviews"],
      userCount: 8,
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      isSystemRole: false,
    },
    {
      id: "R004",
      name: "Finance Manager",
      description: "Financial operations and payroll management",
      permissions: ["payroll_management", "expense_approval", "financial_reports", "budget_management"],
      userCount: 4,
      color: "bg-green-100 text-green-800 hover:bg-green-100",
      isSystemRole: false,
    },
    {
      id: "R005",
      name: "Department Head",
      description: "Department-level management and team oversight",
      permissions: ["team_management", "approve_requests", "view_reports", "schedule_management"],
      userCount: 12,
      color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      isSystemRole: false,
    },
    {
      id: "R006",
      name: "Employee",
      description: "Standard employee access to personal data and basic features",
      permissions: ["view_own_data", "submit_requests", "clock_in_out", "view_schedule"],
      userCount: 125,
      color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      isSystemRole: true,
    },
  ];

  const availablePermissions = [
    { id: "user_management", name: "User Management", category: "Admin" },
    { id: "system_settings", name: "System Settings", category: "Admin" },
    { id: "audit_logs", name: "Audit Logs", category: "Admin" },
    { id: "employee_management", name: "Employee Management", category: "HR" },
    { id: "payroll_access", name: "Payroll Access", category: "HR" },
    { id: "leave_management", name: "Leave Management", category: "HR" },
    { id: "performance_reviews", name: "Performance Reviews", category: "HR" },
    { id: "payroll_management", name: "Payroll Management", category: "Finance" },
    { id: "expense_approval", name: "Expense Approval", category: "Finance" },
    { id: "financial_reports", name: "Financial Reports", category: "Finance" },
    { id: "budget_management", name: "Budget Management", category: "Finance" },
    { id: "team_management", name: "Team Management", category: "Management" },
    { id: "approve_requests", name: "Approve Requests", category: "Management" },
    { id: "view_reports", name: "View Reports", category: "General" },
    { id: "schedule_management", name: "Schedule Management", category: "General" },
    { id: "view_own_data", name: "View Own Data", category: "General" },
    { id: "submit_requests", name: "Submit Requests", category: "General" },
    { id: "clock_in_out", name: "Clock In/Out", category: "General" },
    { id: "view_schedule", name: "View Schedule", category: "General" },
  ];

  const handleCreateRole = () => {
    if (!roleName || !roleDescription || selectedPermissions.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one permission",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Role Created",
      description: `Role "${roleName}" has been created successfully`,
    });

    // Reset form
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setIsDialogOpen(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role-name">Role Name *</Label>
                      <Input
                        id="role-name"
                        placeholder="Enter role name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-description">Description *</Label>
                      <Textarea
                        id="role-description"
                        placeholder="Describe the role responsibilities"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Permissions *</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the permissions this role should have
                    </p>
                    
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <div key={category}>
                          <h4 className="font-medium mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2 ml-4">
                            {permissions.map((permission) => (
                              <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">{permission.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRole}>
                      Create Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={role.color}>{role.name}</Badge>
                        {role.isSystemRole && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {role.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{role.userCount} users</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes("*") ? (
                        <Badge variant="outline" className="text-xs">
                          All Permissions
                        </Badge>
                      ) : (
                        role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {availablePermissions.find(p => p.id === permission)?.name || permission}
                          </Badge>
                        ))
                      )}
                      {role.permissions.length > 3 && !role.permissions.includes("*") && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {!role.isSystemRole && (
                      <>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
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
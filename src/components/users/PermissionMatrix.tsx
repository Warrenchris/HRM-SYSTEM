import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

export function PermissionMatrix() {
  const permissions: Permission[] = [
    { id: "user_management", name: "User Management", category: "Admin", description: "Create, edit, and delete users" },
    { id: "system_settings", name: "System Settings", category: "Admin", description: "Modify system configuration" },
    { id: "audit_logs", name: "Audit Logs", category: "Admin", description: "View system audit trails" },
    { id: "employee_management", name: "Employee Management", category: "HR", description: "Manage employee records" },
    { id: "payroll_access", name: "Payroll Access", category: "HR", description: "View payroll information" },
    { id: "leave_management", name: "Leave Management", category: "HR", description: "Approve/deny leave requests" },
    { id: "performance_reviews", name: "Performance Reviews", category: "HR", description: "Conduct performance reviews" },
    { id: "payroll_management", name: "Payroll Management", category: "Finance", description: "Process payroll and payments" },
    { id: "expense_approval", name: "Expense Approval", category: "Finance", description: "Approve expense claims" },
    { id: "financial_reports", name: "Financial Reports", category: "Finance", description: "Generate financial reports" },
    { id: "team_management", name: "Team Management", category: "Management", description: "Manage team members" },
    { id: "approve_requests", name: "Approve Requests", category: "Management", description: "Approve various requests" },
    { id: "view_reports", name: "View Reports", category: "General", description: "Access to reports and analytics" },
    { id: "view_own_data", name: "View Own Data", category: "General", description: "Access personal information" },
    { id: "submit_requests", name: "Submit Requests", category: "General", description: "Submit leave, expense requests" },
    { id: "clock_in_out", name: "Clock In/Out", category: "General", description: "Record attendance" },
  ];

  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    const loadRoles = async () => {
      const { data, error } = await supabase.from('user_roles').select('id, name, color');
      if (!error) {
        setRoles((data || []).map((r) => ({
          id: r.id,
          name: r.name,
          color: r.color || 'bg-gray-100 text-gray-800',
        }))
        );
      }
    };
    loadRoles();
  }, []);

  // Permission matrix - which roles have which permissions
  const permissionMatrix: Record<string, string[]> = {
    admin: ["user_management", "system_settings", "audit_logs", "view_reports"],
    hr_manager: ["employee_management", "payroll_access", "leave_management", "performance_reviews", "view_reports"],
    finance_manager: ["payroll_management", "expense_approval", "financial_reports", "view_reports"],
    department_head: ["team_management", "approve_requests", "view_reports"],
    employee: ["view_own_data", "submit_requests", "clock_in_out"],
  };

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return permissionMatrix[roleId]?.includes(permissionId) || false;
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of permissions granted to each role across the system
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h3 className="text-lg font-medium mb-3">{category} Permissions</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Permission</TableHead>
              {roles.map((role) => (
                          <TableHead key={role.id} className="text-center">
                            <Badge className={role.color}>{role.name}</Badge>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryPermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {permission.description}
                              </div>
                            </div>
                          </TableCell>
                          {roles.map((role) => (
                            <TableCell key={role.id} className="text-center">
                              {hasPermission(role.id, permission.id) ? (
                                <div className="flex items-center justify-center">
                                  <div className="rounded-full bg-green-100 p-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <div className="rounded-full bg-red-100 p-1">
                                    <X className="h-4 w-4 text-red-600" />
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const rolePermissions = permissionMatrix[role.id] || [];
              const permissionCount = rolePermissions.length;
              
              return (
                <Card key={role.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={role.color}>{role.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {permissionCount} permissions
                      </span>
                    </div>
                    <div className="space-y-1">
                      {rolePermissions.slice(0, 3).map((permissionId) => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return (
                          <div key={permissionId} className="text-sm text-muted-foreground">
                            • {permission?.name}
                          </div>
                        );
                      })}
                      {permissionCount > 3 && (
                        <div className="text-sm text-muted-foreground">
                          ... and {permissionCount - 3} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
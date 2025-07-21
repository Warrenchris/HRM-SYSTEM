import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementStats } from "@/components/users/UserManagementStats";
import { UserTable } from "@/components/users/UserTable";
import { RoleManagement } from "@/components/users/RoleManagement";
import { PermissionMatrix } from "@/components/users/PermissionMatrix";
import { UserActivity } from "@/components/users/UserActivity";
import { UserSettings } from "@/components/users/UserSettings";

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, permissions, and access control
        </p>
      </div>

      <UserManagementStats />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserTable />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <PermissionMatrix />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivity />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <UserSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
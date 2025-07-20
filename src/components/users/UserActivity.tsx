import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Clock, Shield, User, Settings, Eye } from "lucide-react";

interface ActivityLog {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  severity: "low" | "medium" | "high";
  category: "auth" | "user_management" | "system" | "data_access" | "security";
}

export function UserActivity() {
  const activities: ActivityLog[] = [
    {
      id: "A001",
      user: {
        name: "Sarah Manager",
        email: "sarah.manager@company.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah Manager",
      },
      action: "Created new user account",
      target: "john.developer@company.com",
      timestamp: "2024-07-23 09:30:15",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      category: "user_management",
    },
    {
      id: "A002",
      user: {
        name: "John Developer",
        email: "john.dev@company.com",
      },
      action: "Successful login",
      timestamp: "2024-07-23 08:45:22",
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      severity: "low",
      category: "auth",
    },
    {
      id: "A003",
      user: {
        name: "Emily HR",
        email: "emily.hr@company.com",
      },
      action: "Updated user role",
      target: "mike.finance@company.com -> Finance Manager",
      timestamp: "2024-07-22 16:20:45",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "high",
      category: "user_management",
    },
    {
      id: "A004",
      user: {
        name: "System",
        email: "system@company.com",
      },
      action: "Password reset requested",
      target: "lisa.design@company.com",
      timestamp: "2024-07-22 14:15:30",
      ipAddress: "203.0.113.100",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      severity: "medium",
      category: "security",
    },
    {
      id: "A005",
      user: {
        name: "Mike Finance",
        email: "mike.finance@company.com",
      },
      action: "Accessed payroll data",
      target: "Payroll Report Q2 2024",
      timestamp: "2024-07-22 07:15:12",
      ipAddress: "10.0.0.75",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      category: "data_access",
    },
    {
      id: "A006",
      user: {
        name: "Sarah Manager",
        email: "sarah.manager@company.com",
      },
      action: "Modified system settings",
      target: "Security Policy Updates",
      timestamp: "2024-07-21 15:45:33",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "high",
      category: "system",
    },
  ];

  const getSeverityBadge = (severity: ActivityLog["severity"]) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
    }
  };

  const getCategoryIcon = (category: ActivityLog["category"]) => {
    switch (category) {
      case "auth":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "user_management":
        return <User className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-orange-500" />;
      case "data_access":
        return <Eye className="h-4 w-4 text-green-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                <p className="text-2xl font-bold">87</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Security Events</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="24h">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{activity.user.name}</div>
                          <div className="text-xs text-muted-foreground">{activity.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{activity.action}</div>
                        {activity.target && (
                          <div className="text-xs text-muted-foreground">{activity.target}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(activity.category)}
                        <span className="text-sm capitalize">{activity.category.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatTimeAgo(activity.timestamp)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{activity.ipAddress}</div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(activity.severity)}</TableCell>
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
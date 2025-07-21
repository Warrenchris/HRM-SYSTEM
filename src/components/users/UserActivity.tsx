import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Clock, Shield, User, Settings, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, selectedTimeframe]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Add time filter
      const now = new Date();
      let startDate = new Date();
      switch (selectedTimeframe) {
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }
      
      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      // Get user information for each activity
      const userIds = [...new Set(data?.map(activity => activity.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select(`
          user_id,
          employees(first_name, last_name, email)
        `)
        .in('user_id', userIds);

      const userMap = new Map();
      profilesData?.forEach(profile => {
        if (profile.employees) {
          userMap.set(profile.user_id, {
            name: `${profile.employees.first_name} ${profile.employees.last_name}`,
            email: profile.employees.email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${profile.employees.first_name} ${profile.employees.last_name}`,
          });
        }
      });

      const formattedActivities: ActivityLog[] = data?.map(activity => ({
        id: activity.id,
        user: userMap.get(activity.user_id) || {
          name: 'Unknown User',
          email: 'No email',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Unknown User',
        },
        action: activity.action,
        target: activity.target,
        timestamp: activity.created_at,
        ipAddress: activity.ip_address?.toString() || 'Unknown',
        userAgent: activity.user_agent || 'Unknown',
        severity: activity.severity as ActivityLog["severity"],
        category: activity.category as ActivityLog["category"],
      })) || [];

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading activities...
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
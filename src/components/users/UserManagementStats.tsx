import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Activity, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function UserManagementStats() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  const [last24hCount, setLast24hCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [totalRes, activeRes, rolesRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('user_roles').select('id', { count: 'exact' })
        ]);

        if (totalRes.error) throw totalRes.error;
        if (activeRes.error) throw activeRes.error;
        if (rolesRes.error) throw rolesRes.error;

        setTotalUsers(totalRes.count || 0);
        setActiveUsers(activeRes.count || 0);
        setRoleCount(rolesRes.count || (rolesRes.data?.length || 0));

        const since = new Date();
        since.setDate(since.getDate() - 1);
        const { count: recentCount, error: recentError } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', since.toISOString());
        if (recentError) throw recentError;
        setLast24hCount(recentCount || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[{
        title: 'Total Users',
        value: loading ? '...' : String(totalUsers),
        description: '',
        icon: Users,
      }, {
        title: 'Active Users',
        value: loading ? '...' : String(activeUsers),
        description: totalUsers > 0 ? `${Math.round((activeUsers / Math.max(1, totalUsers)) * 100)}% active rate` : '',
        icon: UserCheck,
      }, {
        title: 'Roles',
        value: loading ? '...' : String(roleCount),
        description: 'Custom roles defined',
        icon: Shield,
      }, {
        title: 'Recent Activity',
        value: loading ? '...' : String(last24hCount),
        description: 'events in last 24h',
        icon: Activity,
      }].map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
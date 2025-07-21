import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TicketStatsData {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}

export function TicketStats() {
  const [stats, setStats] = useState<TicketStatsData>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('status, priority');

      if (error) {
        console.error('Error fetching ticket stats:', error);
        return;
      }

      const statsData = tickets?.reduce((acc, ticket) => {
        acc.total += 1;
        if (ticket.status === 'open') acc.open += 1;
        if (ticket.status === 'in_progress') acc.inProgress += 1;
        if (ticket.status === 'resolved' || ticket.status === 'closed') acc.resolved += 1;
        if (ticket.priority === 'urgent') acc.urgent += 1;
        return acc;
      }, {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0
      }) || stats;

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Open Tickets",
      value: stats.open,
      icon: AlertCircle,
      color: "bg-red-100 text-red-800"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Urgent",
      value: stats.urgent,
      icon: XCircle,
      color: "bg-orange-100 text-orange-800"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge className={stat.color} variant="secondary">
                {stat.title.toLowerCase().replace(' ', '_')}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
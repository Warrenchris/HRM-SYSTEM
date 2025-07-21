import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  escalated_tasks: number;
  avg_completion_rate: number;
}

export function TaskStats() {
  const [stats, setStats] = useState<TaskStats>({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    escalated_tasks: 0,
    avg_completion_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status, progress_percentage, due_date');

      if (error) throw error;

      const now = new Date();
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const pendingTasks = tasks?.filter(task => task.status === 'pending').length || 0;
      const escalatedTasks = tasks?.filter(task => task.status === 'escalated').length || 0;
      const overdueTasks = tasks?.filter(task => 
        task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
      ).length || 0;
      
      const avgProgress = tasks?.reduce((sum, task) => sum + (task.progress_percentage || 0), 0) / totalTasks || 0;

      setStats({
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        overdue_tasks: overdueTasks,
        escalated_tasks: escalatedTasks,
        avg_completion_rate: Math.round(avgProgress),
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total_tasks,
      icon: CheckCircle,
      color: "text-primary",
    },
    {
      title: "Completed",
      value: stats.completed_tasks,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: stats.pending_tasks,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Overdue",
      value: stats.overdue_tasks,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Escalated",
      value: stats.escalated_tasks,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Total Tasks" && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Average Progress</span>
                    <span>{stats.avg_completion_rate}%</span>
                  </div>
                  <Progress value={stats.avg_completion_rate} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
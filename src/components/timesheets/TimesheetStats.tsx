import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useTimesheetStatsQuery } from "@/hooks/queries/useTimesheetQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function TimesheetStats() {
  const { employee } = useCurrentEmployee();
  const { data: stats, isLoading } = useTimesheetStatsQuery(employee?.id);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Hours This Week",
      value: stats.hoursThisWeek.toFixed(1),
      description: stats.weekChange >= 0 ? `+${stats.weekChange.toFixed(1)} from last week` : `${stats.weekChange.toFixed(1)} from last week`,
      icon: Clock,
    },
    {
      title: "Days Logged",
      value: stats.daysLogged.toString(),
      description: "Out of 5 working days",
      icon: Calendar,
    },
    {
      title: "Billable Hours",
      value: stats.billableHours.toFixed(1),
      description: `${stats.billableRate.toFixed(0)}% billable rate`,
      icon: TrendingUp,
    },
    {
      title: "Approved Sheets",
      value: stats.approvedSheets.toString(),
      description: "This month",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
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
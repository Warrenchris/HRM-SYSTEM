import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp, CheckCircle } from "lucide-react";

export function TimesheetStats() {
  const stats = [
    {
      title: "Hours This Week",
      value: "38.5",
      description: "+2.5 from last week",
      icon: Clock,
    },
    {
      title: "Days Logged",
      value: "5",
      description: "Out of 5 working days",
      icon: Calendar,
    },
    {
      title: "Billable Hours",
      value: "32.0",
      description: "83% billable rate",
      icon: TrendingUp,
    },
    {
      title: "Approved Sheets",
      value: "4",
      description: "This month",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
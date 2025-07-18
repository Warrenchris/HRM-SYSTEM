import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp, MapPin } from "lucide-react";

export function AttendanceStats() {
  const stats = [
    {
      title: "Hours Today",
      value: "7.5h",
      description: "2.5h remaining",
      icon: Clock,
      trend: "+0.5h from yesterday",
      color: "text-primary"
    },
    {
      title: "This Week",
      value: "37.5h",
      description: "5 days worked",
      icon: Calendar,
      trend: "On track for 40h",
      color: "text-success"
    },
    {
      title: "This Month",
      value: "158h",
      description: "22 days worked",
      icon: TrendingUp,
      trend: "+12h from last month",
      color: "text-primary"
    },
    {
      title: "Location",
      value: "Office",
      description: "Main Building",
      icon: MapPin,
      trend: "GPS verified",
      color: "text-success"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
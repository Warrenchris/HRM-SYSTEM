import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, Calendar } from "lucide-react";

export function PerformanceStats() {
  const stats = [
    {
      title: "Average Performance",
      value: "4.2/5.0",
      description: "+0.3 from last quarter",
      icon: TrendingUp,
      progress: 84,
    },
    {
      title: "Goals Achieved",
      value: "73%",
      description: "152 of 208 goals",
      icon: Target,
      progress: 73,
    },
    {
      title: "Reviews Completed",
      value: "89%",
      description: "167 of 188 due",
      icon: Calendar,
      progress: 89,
    },
    {
      title: "Top Performers",
      value: "23",
      description: "Employees rated 4.5+",
      icon: Users,
      progress: 100,
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
            <div className="text-2xl font-bold mb-2">{stat.value}</div>
            <Progress value={stat.progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
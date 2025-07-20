import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react";

export function RecruitmentStats() {
  const stats = [
    {
      title: "Active Positions",
      value: "12",
      description: "Currently recruiting",
      icon: Briefcase,
      progress: 100,
    },
    {
      title: "Total Candidates",
      value: "89",
      description: "+15 this week",
      icon: Users,
      progress: 78,
    },
    {
      title: "Interviews Scheduled",
      value: "24",
      description: "Next 7 days",
      icon: Calendar,
      progress: 85,
    },
    {
      title: "Time to Hire",
      value: "18 days",
      description: "Average hiring time",
      icon: TrendingUp,
      progress: 65,
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
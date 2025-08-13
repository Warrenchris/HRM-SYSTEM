import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, Calendar } from "lucide-react";
import { usePerformanceStatsQuery } from "@/hooks/queries/usePerformanceQueries";

export function PerformanceStats() {
  const { data, isLoading } = usePerformanceStatsQuery();

  const avgValue = data?.averagePerformance?.value ?? 0;
  const stats = [
    {
      title: "Average Performance",
      value: `${avgValue.toFixed(1)}/5.0`,
      description: data?.averagePerformance?.changeText || "",
      icon: TrendingUp,
      progress: Math.round((avgValue / 5) * 100),
    },
    {
      title: "Goals Achieved",
      value: `${data?.goalsAchieved?.percent ?? 0}%`,
      description: `${data?.goalsAchieved?.completed ?? 0} of ${data?.goalsAchieved?.total ?? 0} goals`,
      icon: Target,
      progress: data?.goalsAchieved?.percent ?? 0,
    },
    {
      title: "Reviews Completed",
      value: `${data?.reviewsCompleted?.percent ?? 0}%`,
      description: `${data?.reviewsCompleted?.completed ?? 0} of ${data?.reviewsCompleted?.total ?? 0} due`,
      icon: Calendar,
      progress: data?.reviewsCompleted?.percent ?? 0,
    },
    {
      title: "Top Performers",
      value: `${data?.topPerformers?.count ?? 0}`,
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
            <div className="text-2xl font-bold mb-2">{isLoading ? '...' : stat.value}</div>
            <Progress value={isLoading ? 0 : stat.progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
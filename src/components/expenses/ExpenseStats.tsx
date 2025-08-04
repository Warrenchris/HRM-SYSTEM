import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useExpenseStatsQuery } from "@/hooks/queries/useExpenseQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function ExpenseStats() {
  const { employee } = useCurrentEmployee();
  const { data: stats, isLoading } = useExpenseStatsQuery(employee?.id);

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
      title: "This Month",
      value: `$${stats.total.toFixed(2)}`,
      description: "Total expenses claimed",
      icon: DollarSign,
      trend: "Current month total",
      color: "text-green-600"
    },
    {
      title: "Pending Approval",
      value: stats.pending.toString(),
      description: "Claims awaiting review",
      icon: Clock,
      trend: "Requires action",
      color: "text-yellow-600"
    },
    {
      title: "Approved",
      value: stats.approved.toString(),
      description: "Claims this month",
      icon: CheckCircle,
      trend: "Successfully processed",
      color: "text-green-600"
    },
    {
      title: "Rejected",
      value: stats.rejected.toString(),
      description: "Claims returned",
      icon: XCircle,
      trend: "Need revision",
      color: "text-red-600"
    }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {stat.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
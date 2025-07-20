import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

const stats = [
  {
    title: "This Month",
    value: "$2,847.50",
    description: "Total expenses claimed",
    icon: DollarSign,
    trend: "+12% from last month",
    color: "text-green-600"
  },
  {
    title: "Pending Approval",
    value: "4",
    description: "Claims awaiting review",
    icon: Clock,
    trend: "2 submitted today",
    color: "text-yellow-600"
  },
  {
    title: "Approved",
    value: "18",
    description: "Claims this month",
    icon: CheckCircle,
    trend: "94% approval rate",
    color: "text-green-600"
  },
  {
    title: "Rejected",
    value: "2",
    description: "Claims returned",
    icon: XCircle,
    trend: "Down from last month",
    color: "text-red-600"
  }
];

export function ExpenseStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
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
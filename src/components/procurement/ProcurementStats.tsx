import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Users, FileText, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export function ProcurementStats() {
  const stats = [
    {
      title: "Total Purchase Orders",
      value: "324",
      change: "+18 this month",
      icon: ShoppingCart,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Active Vendors",
      value: "89",
      change: "+5 new vendors",
      icon: Users,
      trend: "+8%",
      color: "text-green-600"
    },
    {
      title: "Pending Requests",
      value: "42",
      change: "Awaiting approval",
      icon: FileText,
      trend: "-15%",
      color: "text-orange-600"
    },
    {
      title: "Monthly Spend",
      value: "$2.4M",
      change: "vs $2.1M last month",
      icon: DollarSign,
      trend: "+14%",
      color: "text-purple-600"
    },
    {
      title: "Cost Savings",
      value: "$125K",
      change: "This quarter",
      icon: TrendingUp,
      trend: "+22%",
      color: "text-green-600"
    },
    {
      title: "Overdue Orders",
      value: "8",
      change: "Needs attention",
      icon: AlertTriangle,
      trend: "-3%",
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
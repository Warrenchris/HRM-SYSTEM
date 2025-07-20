import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wrench,
  TrendingUp,
  DollarSign,
  Calendar
} from "lucide-react";

const assetStats = [
  {
    title: "Total Assets",
    value: "1,247",
    change: "+12%",
    changeType: "positive",
    icon: Package,
    description: "from last month"
  },
  {
    title: "Active Assets",
    value: "1,158",
    percentage: 93,
    icon: CheckCircle,
    description: "in operation",
    color: "text-green-600"
  },
  {
    title: "Under Maintenance",
    value: "63",
    percentage: 5,
    icon: Wrench,
    description: "scheduled/ongoing",
    color: "text-yellow-600"
  },
  {
    title: "Needs Attention",
    value: "26",
    percentage: 2,
    icon: AlertTriangle,
    description: "requires action",
    color: "text-red-600"
  }
];

const categoryBreakdown = [
  { name: "IT Equipment", count: 428, percentage: 34, color: "bg-blue-500" },
  { name: "Office Furniture", count: 312, percentage: 25, color: "bg-green-500" },
  { name: "Vehicles", count: 89, percentage: 7, color: "bg-purple-500" },
  { name: "Manufacturing", count: 234, percentage: 19, color: "bg-orange-500" },
  { name: "Other", count: 184, percentage: 15, color: "bg-gray-500" }
];

const maintenanceStats = [
  {
    title: "Total Value",
    value: "$2.4M",
    icon: DollarSign,
    description: "asset portfolio"
  },
  {
    title: "This Month",
    value: "$45K",
    icon: Wrench,
    description: "maintenance costs"
  },
  {
    title: "Upcoming",
    value: "18",
    icon: Calendar,
    description: "scheduled services"
  }
];

export function AssetStats() {
  return (
    <div className="space-y-6">
      {/* Main Asset Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {assetStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.change && (
                      <Badge 
                        variant={stat.changeType === "positive" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  
                  {stat.percentage && (
                    <Progress value={stat.percentage} className="h-2" />
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.count}</span>
                      <span className="text-muted-foreground">({category.percentage}%)</span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{stat.title}</div>
                        <div className="text-xs text-muted-foreground">{stat.description}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                );
              })}
              
              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <button className="w-full p-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  📊 View Depreciation Report
                </button>
                <button className="w-full p-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  🔧 Schedule Maintenance
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Employees",
    value: "247",
    change: "+5 this month",
    icon: Users,
    color: "text-primary"
  },
  {
    title: "Active Employees",
    value: "241",
    change: "+2 this week",
    icon: UserCheck,
    color: "text-emerald-600"
  },
  {
    title: "On Leave",
    value: "6",
    change: "3 returning tomorrow",
    icon: UserX,
    color: "text-orange-500"
  },
  {
    title: "New Hires",
    value: "12",
    change: "This quarter",
    icon: UserPlus,
    color: "text-blue-600"
  }
];

export function EmployeeStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Activity, UserCheck } from "lucide-react";

export function UserManagementStats() {
  const stats = [
    {
      title: "Total Users",
      value: "156",
      description: "+8 this month",
      icon: Users,
    },
    {
      title: "Active Users",
      value: "142",
      description: "91% active rate",
      icon: UserCheck,
    },
    {
      title: "Roles",
      value: "6",
      description: "Custom roles defined",
      icon: Shield,
    },
    {
      title: "Recent Activity",
      value: "24h",
      description: "Last login tracking",
      icon: Activity,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

const leaveTypes = [
  {
    name: "Annual Leave",
    total: 25,
    used: 12,
    pending: 3,
    icon: Calendar,
    color: "bg-blue-500"
  },
  {
    name: "Sick Leave",
    total: 10,
    used: 2,
    pending: 1,
    icon: AlertCircle,
    color: "bg-red-500"
  },
  {
    name: "Personal Leave",
    total: 5,
    used: 1,
    pending: 0,
    icon: Clock,
    color: "bg-green-500"
  },
  {
    name: "Emergency Leave",
    total: 3,
    used: 0,
    pending: 0,
    icon: CheckCircle,
    color: "bg-orange-500"
  }
];

export function LeaveStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {leaveTypes.map((leave) => {
        const available = leave.total - leave.used - leave.pending;
        const usagePercentage = ((leave.used + leave.pending) / leave.total) * 100;
        const Icon = leave.icon;

        return (
          <Card key={leave.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{leave.name}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{available}</span>
                  <Badge variant="outline" className="text-xs">
                    {leave.total} total
                  </Badge>
                </div>
                
                <Progress value={usagePercentage} className="h-2" />
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-green-600">{available}</div>
                    <div className="text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{leave.used}</div>
                    <div className="text-muted-foreground">Used</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{leave.pending}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
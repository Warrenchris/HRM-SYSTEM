import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useAttendanceRecords } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function AttendanceStats() {
  const { employee } = useCurrentEmployee();
  const { records, loading } = useAttendanceRecords(employee?.id);

  // Calculate statistics from real data
  const todayRecord = records.find(record => {
    const recordDate = new Date(record.clock_in_time).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  });

  const thisWeek = records.filter(record => {
    const recordDate = new Date(record.clock_in_time);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return recordDate >= weekStart;
  });

  const thisMonth = records.filter(record => {
    const recordDate = new Date(record.clock_in_time);
    const monthStart = new Date();
    monthStart.setDate(1);
    return recordDate >= monthStart;
  });

  const todayHours = todayRecord?.total_hours || 0;
  const weekHours = thisWeek.reduce((sum, record) => sum + (record.total_hours || 0), 0);
  const lateDays = thisMonth.filter(record => {
    const clockIn = new Date(record.clock_in_time);
    const expectedTime = new Date(clockIn);
    expectedTime.setHours(9, 0, 0, 0); // Assuming 9 AM start time
    return clockIn > expectedTime;
  }).length;
  const perfectDays = thisMonth.filter(record => record.total_hours && record.total_hours >= 8).length;

  const stats = [
    {
      title: "Today's Hours",
      value: loading ? "..." : todayHours.toFixed(1),
      change: "of 8 hours",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "This Week",
      value: loading ? "..." : weekHours.toFixed(1),
      change: "hours worked",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Late Days",
      value: loading ? "..." : lateDays.toString(),
      change: "this month",
      icon: AlertCircle,
      color: "text-orange-500"
    },
    {
      title: "Perfect Days",
      value: loading ? "..." : perfectDays.toString(),
      change: "this month",
      icon: CheckCircle,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
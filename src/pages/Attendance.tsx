import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { ClockInOut } from "@/components/attendance/ClockInOut";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { AttendanceReports } from "@/components/attendance/AttendanceReports";
import { AttendanceApprovals } from "@/components/attendance/AttendanceApprovals";
import { Clock, MapPin, Calendar, History, BarChart3, CheckCircle } from "lucide-react";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useTodayAttendance } from "@/hooks/useAttendanceData";

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { employee } = useCurrentEmployee();
  const { records } = useTodayAttendance(employee?.id);
  
  const todayRecord = records[0];
  const isCheckedIn = todayRecord && !todayRecord.clock_out_time;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track your work hours and manage attendance
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
          <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Current Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isCheckedIn ? "default" : "secondary"} className="text-sm">
              {isCheckedIn ? "Checked In" : "Checked Out"}
            </Badge>
            {todayRecord?.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{todayRecord.location}</span>
              </div>
            )}
            {todayRecord?.clock_in_time && (
              <div className="text-sm text-muted-foreground">
                Since {new Date(todayRecord.clock_in_time).toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <AttendanceStats />

      {/* Main Content */}
      <Tabs defaultValue="clock" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center min-w-fit">
            <TabsTrigger value="clock" className="flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clock In/Out</span>
              <span className="sm:hidden">Clock</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2">
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              Approvals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="clock">
          <ClockInOut />
        </TabsContent>

        <TabsContent value="history">
          <AttendanceHistory />
        </TabsContent>

        <TabsContent value="calendar">
          <AttendanceCalendar />
        </TabsContent>

        <TabsContent value="reports">
          <AttendanceReports />
        </TabsContent>

        <TabsContent value="approvals">
          <AttendanceApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useAttendanceRecords } from "@/hooks/useAttendanceData";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { employee } = useCurrentEmployee();
  const { records, loading } = useAttendanceRecords(employee?.id);

  // Convert records to calendar data
  const attendanceData: Record<string, {
    status: "present" | "absent" | "late" | "weekend" | "holiday" | "leave";
    clockIn?: string;
    clockOut?: string;
    totalHours?: string;
    location?: string;
  }> = {};

  records.forEach(record => {
    const dateKey = new Date(record.clock_in_time).toISOString().split('T')[0];
    const clockInTime = new Date(record.clock_in_time);
    const clockOutTime = record.clock_out_time ? new Date(record.clock_out_time) : null;
    
    // Determine status based on clock in time and other factors
    let status: "present" | "absent" | "late" | "weekend" | "holiday" | "leave" = "present";
    
    // Check if late (after 9:15 AM)
    const workStartTime = new Date(clockInTime);
    workStartTime.setHours(9, 15, 0, 0);
    if (clockInTime > workStartTime) {
      status = "late";
    }
    
    // Check if weekend
    const dayOfWeek = clockInTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = "weekend";
    }

    attendanceData[dateKey] = {
      status,
      clockIn: clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      clockOut: clockOutTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      totalHours: record.total_hours ? `${Math.floor(record.total_hours)}h ${Math.round((record.total_hours % 1) * 60)}m` : undefined,
      location: record.location || undefined
    };
  });

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: "bg-success text-success-foreground",
      late: "bg-warning text-warning-foreground",
      absent: "bg-destructive text-destructive-foreground",
      weekend: "bg-muted text-muted-foreground",
      holiday: "bg-primary text-primary-foreground",
      leave: "bg-secondary text-secondary-foreground"
    };
    return colors[status as keyof typeof colors] || "";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      present: "Present",
      late: "Late",
      absent: "Absent",
      weekend: "Weekend",
      holiday: "Holiday",
      leave: "Leave"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const selectedDateData = selectedDate ? attendanceData[getDateKey(selectedDate)] : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Attendance Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading calendar data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Calendar */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Attendance Calendar
          </CardTitle>
          <CardDescription>
            Click on any date to view attendance details ({records.length} records loaded)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              present: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "present";
              },
              late: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "late";
              },
              absent: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "absent";
              },
              weekend: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "weekend";
              },
              holiday: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "holiday";
              },
              leave: (date) => {
                const data = attendanceData[getDateKey(date)];
                return data?.status === "leave";
              },
            }}
            modifiersStyles={{
              present: { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" },
              late: { backgroundColor: "hsl(var(--warning))", color: "hsl(var(--warning-foreground))" },
              absent: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" },
              weekend: { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" },
              holiday: { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" },
              leave: { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" },
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Select a Date"}
            </CardTitle>
            <CardDescription>
              Attendance details for selected date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusColor(selectedDateData.status)}>
                    {getStatusLabel(selectedDateData.status)}
                  </Badge>
                </div>

                {selectedDateData.clockIn && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clock In</span>
                      <span className="text-sm">{selectedDateData.clockIn}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clock Out</span>
                      <span className="text-sm">{selectedDateData.clockOut}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Hours</span>
                      <Badge variant="outline">{selectedDateData.totalHours}</Badge>
                    </div>

                    {selectedDateData.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Location</span>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {selectedDateData.location}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedDateData.status === "weekend" && (
                  <p className="text-sm text-muted-foreground">
                    Weekend - No work scheduled
                  </p>
                )}

                {selectedDateData.status === "holiday" && (
                  <p className="text-sm text-muted-foreground">
                    Public Holiday - Office closed
                  </p>
                )}

                {selectedDateData.status === "leave" && (
                  <p className="text-sm text-muted-foreground">
                    On leave - Approved absence
                  </p>
                )}

                {selectedDateData.status === "absent" && (
                  <p className="text-sm text-destructive">
                    Absent - No attendance recorded
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attendance data available for this date.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success"></div>
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning"></div>
                <span className="text-sm">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive"></div>
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary"></div>
                <span className="text-sm">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-sm">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted"></div>
                <span className="text-sm">Weekend</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
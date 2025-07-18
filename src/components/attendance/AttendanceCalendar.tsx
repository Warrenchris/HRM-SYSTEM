import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock attendance data for calendar
  const attendanceData: Record<string, {
    status: "present" | "absent" | "late" | "weekend" | "holiday" | "leave";
    clockIn?: string;
    clockOut?: string;
    totalHours?: string;
    location?: string;
  }> = {
    "2024-01-15": { status: "present", clockIn: "09:00 AM", clockOut: "06:15 PM", totalHours: "9h 15m", location: "Main Office" },
    "2024-01-14": { status: "weekend" },
    "2024-01-13": { status: "weekend" },
    "2024-01-12": { status: "present", clockIn: "09:15 AM", clockOut: "06:00 PM", totalHours: "8h 45m", location: "Main Office" },
    "2024-01-11": { status: "late", clockIn: "09:30 AM", clockOut: "06:00 PM", totalHours: "8h 30m", location: "Remote" },
    "2024-01-10": { status: "leave" },
    "2024-01-09": { status: "present", clockIn: "08:45 AM", clockOut: "05:45 PM", totalHours: "9h", location: "Main Office" },
    "2024-01-08": { status: "present", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: "9h", location: "Main Office" },
    "2024-01-05": { status: "weekend" },
    "2024-01-06": { status: "weekend" },
    "2024-01-04": { status: "absent" },
    "2024-01-03": { status: "present", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: "9h", location: "Main Office" },
    "2024-01-02": { status: "present", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: "9h", location: "Main Office" },
    "2024-01-01": { status: "holiday" },
  };

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
            Click on any date to view attendance details
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
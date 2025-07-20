import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Users, Calendar as CalendarIcon } from "lucide-react";
import { format, isSameDay, isWithinInterval, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

interface LeaveEvent {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: "approved" | "pending";
  color: string;
}

const mockLeaveEvents: LeaveEvent[] = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeId: "EMP001",
    leaveType: "Annual Leave",
    startDate: new Date("2025-01-20"),
    endDate: new Date("2025-01-24"),
    status: "approved",
    color: "bg-blue-500"
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    employeeId: "EMP002",
    leaveType: "Sick Leave",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-15"),
    status: "approved",
    color: "bg-red-500"
  },
  {
    id: "3",
    employeeName: "Mike Johnson",
    employeeId: "EMP003",
    leaveType: "Personal Leave",
    startDate: new Date("2025-01-28"),
    endDate: new Date("2025-01-30"),
    status: "pending",
    color: "bg-green-500"
  },
  {
    id: "4",
    employeeName: "Sarah Wilson",
    employeeId: "EMP004",
    leaveType: "Annual Leave",
    startDate: new Date("2025-02-05"),
    endDate: new Date("2025-02-12"),
    status: "approved",
    color: "bg-purple-500"
  }
];

const leaveTypeColors = {
  "Annual Leave": "bg-blue-500",
  "Sick Leave": "bg-red-500",
  "Personal Leave": "bg-green-500",
  "Emergency Leave": "bg-orange-500",
  "Maternity Leave": "bg-pink-500",
  "Paternity Leave": "bg-indigo-500"
};

export function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewType, setViewType] = useState("team");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const getEventsForDate = (date: Date) => {
    return mockLeaveEvents.filter(event => 
      isWithinInterval(date, { start: event.startDate, end: event.endDate })
    );
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const modifiers = {
    hasLeave: (date: Date) => getEventsForDate(date).length > 0,
  };

  const modifiersStyles = {
    hasLeave: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      borderRadius: "6px",
    },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-2">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">Team View</SelectItem>
              <SelectItem value="my">My Leaves</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Leave Calendar
            </CardTitle>
            <CardDescription>
              View team leave schedules and plan accordingly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentDate}
              onMonthChange={setCurrentDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border w-full"
            />

            {/* Legend */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Leave Types</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(leaveTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded ${color}`} />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a Date"}
            </CardTitle>
            <CardDescription>
              {getEventsForSelectedDate().length} leave(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForSelectedDate().length > 0 ? (
                getEventsForSelectedDate().map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{event.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{event.employeeId}</div>
                        <Badge variant="outline" className="text-xs">
                          {event.leaveType}
                        </Badge>
                      </div>
                      <Badge 
                        variant={event.status === "approved" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                    </div>
                    {!isSameDay(event.startDate, event.endDate) && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {format(event.startDate, "MMM dd")} - {format(event.endDate, "MMM dd")}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No leaves scheduled for this date
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Leaves */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Team Leaves</CardTitle>
          <CardDescription>
            Leave requests scheduled for the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeaveEvents
              .filter(event => event.startDate >= new Date() && event.status === "approved")
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded ${event.color}`} />
                    <div>
                      <div className="font-medium text-sm">{event.employeeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.leaveType} • {format(event.startDate, "MMM dd")}
                        {!isSameDay(event.startDate, event.endDate) && 
                          ` - ${format(event.endDate, "MMM dd")}`
                        }
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{event.status}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
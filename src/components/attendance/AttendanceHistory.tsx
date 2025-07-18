import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, Download, Search, MapPin } from "lucide-react";

export function AttendanceHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("thisMonth");

  // Mock data
  const attendanceData = [
    {
      id: 1,
      date: "2024-01-15",
      dayOfWeek: "Monday",
      clockIn: "09:00 AM",
      clockOut: "06:15 PM",
      totalHours: "9h 15m",
      location: "Main Office",
      status: "Present",
      overtime: "1h 15m"
    },
    {
      id: 2,
      date: "2024-01-14",
      dayOfWeek: "Sunday",
      clockIn: "-",
      clockOut: "-",
      totalHours: "0h",
      location: "-",
      status: "Weekend",
      overtime: "-"
    },
    {
      id: 3,
      date: "2024-01-13",
      dayOfWeek: "Saturday",
      clockIn: "-",
      clockOut: "-",
      totalHours: "0h",
      location: "-",
      status: "Weekend",
      overtime: "-"
    },
    {
      id: 4,
      date: "2024-01-12",
      dayOfWeek: "Friday",
      clockIn: "09:15 AM",
      clockOut: "06:00 PM",
      totalHours: "8h 45m",
      location: "Main Office",
      status: "Present",
      overtime: "0h"
    },
    {
      id: 5,
      date: "2024-01-11",
      dayOfWeek: "Thursday",
      clockIn: "09:30 AM",
      clockOut: "06:00 PM",
      totalHours: "8h 30m",
      location: "Remote",
      status: "Late",
      overtime: "0h"
    },
    {
      id: 6,
      date: "2024-01-10",
      dayOfWeek: "Wednesday",
      clockIn: "-",
      clockOut: "-",
      totalHours: "0h",
      location: "-",
      status: "Sick Leave",
      overtime: "-"
    },
    {
      id: 7,
      date: "2024-01-09",
      dayOfWeek: "Tuesday",
      clockIn: "08:45 AM",
      clockOut: "05:45 PM",
      totalHours: "9h",
      location: "Main Office",
      status: "Present",
      overtime: "1h"
    },
    {
      id: 8,
      date: "2024-01-08",
      dayOfWeek: "Monday",
      clockIn: "09:00 AM",
      clockOut: "06:00 PM",
      totalHours: "9h",
      location: "Main Office",
      status: "Present",
      overtime: "1h"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Present": "default",
      "Late": "destructive",
      "Weekend": "secondary",
      "Sick Leave": "outline",
      "Vacation": "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const calculateTotalHours = () => {
    const workDays = attendanceData.filter(day => 
      day.status === "Present" || day.status === "Late"
    );
    
    let totalMinutes = 0;
    workDays.forEach(day => {
      const hours = parseFloat(day.totalHours.split('h')[0]);
      const minutes = parseFloat(day.totalHours.split('h ')[1]?.split('m')[0] || '0');
      totalMinutes += hours * 60 + minutes;
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalHours()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Out of 6 working days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 15m</div>
            <p className="text-xs text-muted-foreground">Extra hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            View your complete attendance record with clock in/out times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by date or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Attendance Table */}
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Overtime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>{record.dayOfWeek}</TableCell>
                    <TableCell>{record.clockIn}</TableCell>
                    <TableCell>{record.clockOut}</TableCell>
                    <TableCell>{record.totalHours}</TableCell>
                    <TableCell>
                      {record.location !== "-" && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {record.location}
                        </div>
                      )}
                      {record.location === "-" && "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.overtime !== "-" && record.overtime !== "0h" && (
                        <Badge variant="outline" className="text-primary">
                          {record.overtime}
                        </Badge>
                      )}
                      {(record.overtime === "-" || record.overtime === "0h") && "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
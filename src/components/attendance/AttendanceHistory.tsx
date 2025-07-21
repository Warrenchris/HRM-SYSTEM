import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Clock, Coffee, Calendar, Search, Filter, Download, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  total_hours: number | null;
  break_duration: number | null;
  status: string;
  location?: string;
  clock_out_location?: string;
  notes?: string;
  created_at: string;
}

export function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Get employee ID
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.employee_id) {
        setEmployeeId(profile.employee_id);
      }
    };
    
    fetchEmployeeId();
  }, [user]);

  // Fetch attendance records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!employeeId) return;

      setLoading(true);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('clock_in_time', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching attendance records:', error);
      } else {
        setRecords(data || []);
        setFilteredRecords(data || []);
      }
      
      setLoading(false);
    };

    if (employeeId) {
      fetchRecords();
    }
  }, [employeeId]);

  // Filter records based on search and status
  useEffect(() => {
    let filtered = records;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(record.clock_in_time).toLocaleDateString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return <Badge variant="default">Clocked In</Badge>;
      case 'on_break':
        return <Badge variant="secondary">On Break</Badge>;
      case 'clocked_out':
        return <Badge variant="outline">Clocked Out</Badge>;
      default:
        return <Badge variant="destructive">Unknown</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const calculateStats = () => {
    const completedRecords = records.filter(record => record.total_hours);
    const totalHours = completedRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
    const totalDays = completedRecords.length;
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0;

    return {
      totalHours: formatDuration(totalHours),
      totalDays,
      avgHours: formatDuration(avgHours),
      attendanceRate: totalDays > 0 ? Math.round((totalDays / records.length) * 100) : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading attendance records...
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDays}</div>
            <p className="text-xs text-muted-foreground">Days worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHours}</div>
            <p className="text-xs text-muted-foreground">Per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Clock out rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Attendance History
          </CardTitle>
          <CardDescription>
            View your recent attendance records and work hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clocked_in">Clocked In</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
                <SelectItem value="clocked_out">Clocked Out</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {records.length === 0 
                ? "No attendance records found. Start by clocking in!"
                : "No records match your search criteria."
              }
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock In Location</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Clock Out Location</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(record.clock_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          {formatTime(record.clock_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-mono">
                              {record.location.length > 20 
                                ? `${record.location.substring(0, 20)}...` 
                                : record.location
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clock_out_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            {formatTime(record.clock_out_time)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clock_out_location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-mono">
                              {record.clock_out_location.length > 20 
                                ? `${record.clock_out_location.substring(0, 20)}...` 
                                : record.clock_out_location
                              }
                            </span>
                          </div>
                        ) : record.clock_out_time ? (
                          <span className="text-muted-foreground">No location</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.break_start_time && record.break_end_time ? (
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-orange-500" />
                            {formatDuration(record.break_duration)}
                          </div>
                        ) : record.break_start_time ? (
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-orange-500" />
                            In progress
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatDuration(record.total_hours)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {record.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
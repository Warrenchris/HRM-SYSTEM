import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Search, Filter, User, MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number | null;
  status: string;
  location?: string;
  clock_out_location?: string;
  notes?: string;
  is_approved: boolean;
  clock_in_latitude?: number;
  clock_in_longitude?: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  created_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
  } | null;
}

export function AttendanceApprovals() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, statusFilter]);

  const fetchPendingRecords = async () => {
    try {
      setLoading(true);
      // 1) Fetch attendance records only (avoid PostgREST relationship requirement)
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .order('clock_in_time', { ascending: false })
        .limit(100);

      if (attendanceError) throw attendanceError;

      const attendanceList = (attendance as any[]) || [];

      // 2) Collect unique employee IDs
      const employeeIds = Array.from(
        new Set(attendanceList.map((r) => r.employee_id).filter(Boolean))
      );

      // 3) Fetch those employees in one query
      let employeesById: Record<string, any> = {};
      if (employeeIds.length > 0) {
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('id, first_name, last_name, employee_id, department')
          .in('id', employeeIds);

        if (employeesError) throw employeesError;
        for (const emp of employees || []) {
          employeesById[emp.id] = emp;
        }
      }

      // 4) Merge employees onto attendance records to match previous shape
      const merged: AttendanceRecord[] = attendanceList.map((r) => ({
        ...r,
        employees: employeesById[r.employee_id] || null,
      }));

      setRecords(merged);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // Filter by approval status
    if (statusFilter === "pending") {
      filtered = filtered.filter(record => !record.is_approved);
    } else if (statusFilter === "approved") {
      filtered = filtered.filter(record => record.is_approved);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.employees?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees?.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees?.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const handleApproval = async (recordId: string, approved: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          is_approved: approved,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: approved ? "Record Approved" : "Record Rejected",
        description: `Attendance record has been ${approved ? 'approved' : 'rejected'} successfully.`,
      });

      // Refresh records
      fetchPendingRecords();
      setSelectedRecord(null);
      setApprovalNotes("");
    } catch (error) {
      console.error('Error updating attendance record:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance record",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.is_approved) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    
    // Check for potential issues
    const clockIn = new Date(record.clock_in_time);
    const workStart = new Date(clockIn);
    workStart.setHours(9, 15, 0, 0);
    const isLate = clockIn > workStart;
    
    const hasGPS = record.clock_in_latitude && record.clock_in_longitude;
    
    if (isLate || !hasGPS) {
      return <Badge variant="destructive">Needs Review</Badge>;
    }
    
    return <Badge variant="secondary">Pending</Badge>;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Attendance Approvals
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Attendance Approvals
          </CardTitle>
          <CardDescription>
            Review and approve employee attendance records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, ID, or department..."
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
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {records.length === 0 
                ? "No attendance records found."
                : "No records match your search criteria."
              }
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>GPS Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {record.employees?.first_name} {record.employees?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {record.employees?.employee_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.employees?.department}</TableCell>
                      <TableCell>{formatDate(record.clock_in_time)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          {formatTime(record.clock_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.clock_out_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            {formatTime(record.clock_out_time)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Still clocked in</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatDuration(record.total_hours)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {record.clock_in_latitude && record.clock_in_longitude ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="text-xs">GPS Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs">No GPS</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record)}
                      </TableCell>
                      <TableCell>
                        {!record.is_approved && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRecord(record)}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Attendance Record</DialogTitle>
                                  <DialogDescription>
                                    Review and approve or reject this attendance record.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedRecord && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Employee</Label>
                                        <p className="text-sm">{selectedRecord.employees?.first_name} {selectedRecord.employees?.last_name}</p>
                                      </div>
                                      <div>
                                        <Label>Department</Label>
                                        <p className="text-sm">{selectedRecord.employees?.department}</p>
                                      </div>
                                      <div>
                                        <Label>Clock In</Label>
                                        <p className="text-sm">{formatTime(selectedRecord.clock_in_time)}</p>
                                      </div>
                                      <div>
                                        <Label>Clock Out</Label>
                                        <p className="text-sm">
                                          {selectedRecord.clock_out_time ? formatTime(selectedRecord.clock_out_time) : 'Still clocked in'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {selectedRecord.clock_in_latitude && (
                                      <div>
                                        <Label>GPS Coordinates</Label>
                                        <p className="text-sm font-mono">
                                          {selectedRecord.clock_in_latitude.toFixed(6)}, {selectedRecord.clock_in_longitude?.toFixed(6)}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <Label htmlFor="approval-notes">Notes (Optional)</Label>
                                      <Textarea
                                        id="approval-notes"
                                        placeholder="Add any comments about this approval..."
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleApproval(selectedRecord?.id || '', false, approvalNotes)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => handleApproval(selectedRecord?.id || '', true, approvalNotes)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
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
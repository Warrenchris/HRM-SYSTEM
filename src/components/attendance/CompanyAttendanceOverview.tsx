import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { History, Search } from "lucide-react";

interface EmployeeRow {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  position?: string;
  status: "clocked_in" | "on_break" | "clocked_out" | "absent";
  clock_in_time?: string;
  clock_out_time?: string | null;
  total_hours?: number | null;
  location?: string | null;
  clock_out_location?: string | null;
}

export function CompanyAttendanceOverview() {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Resolve company id from context or from employees table
  useEffect(() => {
    const resolveCompany = async () => {
      if (currentCompany?.id) {
        console.log('Using company from context:', currentCompany.id);
        setCompanyId(currentCompany.id);
        return;
      }

      // If no company context, try to get company from employees
      try {
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('company_id')
          .limit(1)
          .single();

        if (empError) {
          console.error('Error fetching company from employees:', empError);
          setCompanyId(null);
          return;
        }

        if (employeeData?.company_id) {
          console.log('Found company from employees:', employeeData.company_id);
          setCompanyId(employeeData.company_id);
        } else {
          console.log('No company found');
          setCompanyId(null);
        }
      } catch (error) {
        console.error('Error in company resolution:', error);
        setCompanyId(null);
      }
    };
    resolveCompany();
  }, [currentCompany?.id]);

  useEffect(() => {
    const load = async () => {
      if (!companyId) {
        setEmployees([]);
        setAttendanceMap({});
        setLoading(false);
        return;
      }
      setLoading(true);

      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      console.log('Fetching data for company:', companyId);
      
      console.log('Starting employee fetch for company:', companyId);
      
      // First verify we have the company
      if (!companyId) {
        console.log('No company ID available');
        setEmployees([]);
        return;
      }

      // Fetch all employees in the company
      let { data: empData, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department,
          position,
          status,
          company_id
        `)
        .eq('company_id', companyId);

      if (empError) {
        console.error('Failed to load employees:', empError);
        setEmployees([]);
      } else {
        console.log('Employees found:', empData?.length || 0, 'for company:', companyId);
        console.log('Sample employee:', empData?.[0]);
        setEmployees(empData || []);
      }

      // Fetch today's attendance for all company employees
      const { data: attData, error: attError } = await supabase
        .from('attendance_records')
        .select(`
          id,
          employee_id,
          clock_in_time,
          clock_out_time,
          break_start_time,
          break_end_time,
          total_hours,
          status,
          location,
          clock_out_location
        `)
        .eq('company_id', companyId)
        .gte('clock_in_time', start.toISOString())
        .lt('clock_in_time', end.toISOString())
        .order('clock_in_time', { ascending: false });

      console.log('Today\'s attendance records:', attData);

      if (attError) {
        console.error('Failed to load attendance:', attError);
        setAttendanceMap({});
      } else {
        // Keep only the latest record today per employee
        const map: Record<string, any> = {};
        (attData || []).forEach((r) => {
          const existing = map[r.employee_id];
          if (!existing || new Date(r.clock_in_time).getTime() > new Date(existing.clock_in_time).getTime()) {
            map[r.employee_id] = r;
          }
        });
        console.log('Processed attendance map:', map);
        setAttendanceMap(map);
      }

      setLoading(false);
    };

    load();

    const interval = setInterval(() => {
      load();
    }, 60_000);
    return () => clearInterval(interval);
  }, [companyId]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.department) set.add(e.department); });
    return Array.from(set).sort();
  }, [employees]);

  const rows: EmployeeRow[] = useMemo(() => {
    console.log('Creating rows from employees:', employees.length);
    console.log('Using attendance map:', Object.keys(attendanceMap).length);
    
    const mappedRows = employees.map(emp => {
      const rec = attendanceMap[emp.id];
      
      // Determine status based on attendance record
      let status: EmployeeRow["status"] = 'absent';
      if (rec) {
        if (rec.clock_in_time && !rec.clock_out_time) {
          status = rec.break_start_time && !rec.break_end_time ? 'on_break' : 'clocked_in';
        } else if (rec.clock_in_time && rec.clock_out_time) {
          status = 'clocked_out';
        }
      }

      return {
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        status,
        clock_in_time: rec?.clock_in_time,
        clock_out_time: rec?.clock_out_time,
        total_hours: rec?.total_hours,
        location: rec?.location,
        clock_out_location: rec?.clock_out_location,
      } as EmployeeRow;
    });

    console.log('Generated rows:', mappedRows.length);
    return mappedRows;
  }, [employees, attendanceMap]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (department !== 'all' && r.department !== department) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const hay = `${r.first_name || ''} ${r.last_name || ''} ${r.email || ''}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, department, statusFilter, search]);

  const statusBadge = (status: EmployeeRow["status"]) => {
    switch (status) {
      case 'clocked_in':
        return <Badge variant="default">Clocked In</Badge>;
      case 'on_break':
        return <Badge variant="secondary">On Break</Badge>;
      case 'clocked_out':
        return <Badge variant="outline">Clocked Out</Badge>;
      default:
        return <Badge variant="destructive">Absent</Badge>;
    }
  };

  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Company Attendance (Today)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clocked_in">Clocked In</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
                <SelectItem value="clocked_out">Clocked Out</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No records</TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">
                        {r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.email || 'No email'}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{r.department || 'Unassigned'}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.position || 'Not specified'}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.clock_in_time ? formatTime(r.clock_in_time) : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.clock_out_time ? formatTime(r.clock_out_time) : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.total_hours != null ? `${Number(r.total_hours).toFixed(2)}h` : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{statusBadge(r.status || 'absent')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}



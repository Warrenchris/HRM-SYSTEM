import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Download, 
  Filter, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AttendanceReports() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("summary");
  const { toast } = useToast();

  // Mock data for reports
  const summaryData = [
    { name: "Present", value: 82, color: "#10b981" },
    { name: "Late", value: 12, color: "#f59e0b" },
    { name: "Absent", value: 6, color: "#ef4444" }
  ];

  const weeklyTrendData = [
    { week: "Week 1", present: 45, late: 3, absent: 2 },
    { week: "Week 2", present: 48, late: 2, absent: 0 },
    { week: "Week 3", present: 46, late: 4, absent: 0 },
    { week: "Week 4", present: 47, late: 3, absent: 0 }
  ];

  const departmentData = [
    { department: "Engineering", present: 28, late: 2, absent: 0, rate: 93.3 },
    { department: "Sales", present: 22, late: 3, absent: 0, rate: 88.0 },
    { department: "Marketing", present: 18, late: 1, absent: 1, rate: 90.0 },
    { department: "HR", present: 8, late: 1, absent: 1, rate: 80.0 },
    { department: "Finance", present: 12, late: 0, absent: 0, rate: 100.0 }
  ];

  const employeeData = [
    { name: "John Doe", department: "Engineering", present: 22, late: 0, absent: 0, rate: 100, status: "excellent" },
    { name: "Jane Smith", department: "Sales", present: 20, late: 2, absent: 0, rate: 90.9, status: "good" },
    { name: "Mike Johnson", department: "Marketing", present: 18, late: 1, absent: 1, rate: 85.0, status: "fair" },
    { name: "Sarah Wilson", department: "HR", present: 21, late: 1, absent: 0, rate: 95.5, status: "excellent" },
    { name: "David Brown", department: "Finance", present: 19, late: 0, absent: 1, rate: 95.0, status: "excellent" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case "fair":
        return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
      case "poor":
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const generateCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const generateExcel = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join('\t'),
      ...data.map(row => headers.map(header => `${row[header]}`).join('\t'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xls`;
    link.click();
  };

  const generatePDF = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    let htmlContent = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Attendance Report - ${new Date().toLocaleDateString()}</h1>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.html`;
    link.click();
  };

  const getFilteredData = () => {
    let data = [...employeeData];
    
    if (selectedDepartment !== "all") {
      data = data.filter(emp => emp.department.toLowerCase() === selectedDepartment.toLowerCase());
    }
    
    if (selectedEmployee !== "all") {
      data = data.filter(emp => emp.name.toLowerCase().replace(/\s+/g, '-') === selectedEmployee);
    }
    
    return data;
  };

  const handleExport = (type: string) => {
    const filteredData = getFilteredData();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `attendance-report-${reportType}-${timestamp}`;
    
    console.log(`Exporting ${type.toLowerCase()} for department: ${selectedDepartment}`);
    
    switch (type.toLowerCase()) {
      case 'excel':
        generateExcel(filteredData, filename);
        break;
      case 'csv':
        generateCSV(filteredData, filename);
        break;
      case 'pdf':
        generatePDF(filteredData, filename);
        break;
      default:
        generateExcel(filteredData, filename);
    }
    
    toast({
      title: "Export Complete",
      description: `${type} report downloaded successfully with ${filteredData.length} records.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure your attendance report parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee Filter */}
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                  <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
                  <SelectItem value="david-brown">David Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                  <SelectItem value="department">Department Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={() => handleExport("Excel")} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport("CSV")} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("PDF")} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Detailed
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Department
          </TabsTrigger>
        </TabsList>

        {/* Summary Report */}
        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>Overall attendance distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summaryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {summaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {summaryData.map((item) => (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-2xl font-bold">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Important attendance statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Average Attendance Rate</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">92.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Average Hours/Day</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">7.8h</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Late Arrivals</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Total Employees</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">85</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Report */}
        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Employee Attendance Details</CardTitle>
              <CardDescription>Individual employee attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Present Days</TableHead>
                    <TableHead>Late Days</TableHead>
                    <TableHead>Absent Days</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeData.map((employee) => (
                    <TableRow key={employee.name}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.present}</TableCell>
                      <TableCell>{employee.late}</TableCell>
                      <TableCell>{employee.absent}</TableCell>
                      <TableCell>{employee.rate.toFixed(1)}%</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Report */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Weekly attendance patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Report */}
        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Department Attendance</CardTitle>
              <CardDescription>Attendance comparison across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#10b981" />
                    <Bar dataKey="late" fill="#f59e0b" />
                    <Bar dataKey="absent" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentData.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>{dept.present}</TableCell>
                      <TableCell>{dept.late}</TableCell>
                      <TableCell>{dept.absent}</TableCell>
                      <TableCell>{dept.rate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
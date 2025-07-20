import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimesheetEntry {
  id: string;
  week: string;
  period: string;
  totalHours: number;
  billableHours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedDate?: string;
  approvedBy?: string;
  projects: string[];
}

export function TimesheetTable() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const { toast } = useToast();

  const timesheets: TimesheetEntry[] = [
    {
      id: "TS001",
      week: "Week 29",
      period: "July 15-21, 2024",
      totalHours: 40.0,
      billableHours: 36.0,
      status: "approved",
      submittedDate: "2024-07-22",
      approvedBy: "Sarah Manager",
      projects: ["HR System", "E-commerce"],
    },
    {
      id: "TS002", 
      week: "Week 28",
      period: "July 8-14, 2024",
      totalHours: 38.5,
      billableHours: 32.0,
      status: "approved",
      submittedDate: "2024-07-15",
      approvedBy: "Sarah Manager",
      projects: ["Mobile App", "Documentation"],
    },
    {
      id: "TS003",
      week: "Week 27",
      period: "July 1-7, 2024", 
      totalHours: 42.0,
      billableHours: 38.5,
      status: "submitted",
      submittedDate: "2024-07-08",
      projects: ["HR System", "Analytics"],
    },
    {
      id: "TS004",
      week: "Current Week",
      period: "July 22-28, 2024",
      totalHours: 32.5,
      billableHours: 28.0,
      status: "draft",
      projects: ["E-commerce", "Client Website"],
    },
  ];

  const getStatusBadge = (status: TimesheetEntry["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><AlertCircle className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "draft":
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const handleSubmitTimesheet = (id: string) => {
    toast({
      title: "Timesheet Submitted",
      description: "Your timesheet has been submitted for approval",
    });
  };

  const handleExport = (id: string) => {
    toast({
      title: "Export Started",
      description: "Your timesheet is being exported to PDF",
    });
  };

  const getBillableRate = (billable: number, total: number) => {
    return total > 0 ? Math.round((billable / total) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Timesheets
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Billable Hours</TableHead>
                <TableHead>Billable %</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{timesheet.week}</div>
                      <div className="text-sm text-muted-foreground">{timesheet.period}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {timesheet.totalHours}h
                    </div>
                  </TableCell>
                  <TableCell>{timesheet.billableHours}h</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {getBillableRate(timesheet.billableHours, timesheet.totalHours)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {timesheet.projects.slice(0, 2).map((project) => (
                        <Badge key={project} variant="secondary" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                      {timesheet.projects.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{timesheet.projects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {timesheet.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitTimesheet(timesheet.id)}
                        >
                          Submit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(timesheet.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {timesheets.length} timesheets
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Approved: {timesheets.filter(t => t.status === "approved").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Submitted: {timesheets.filter(t => t.status === "submitted").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Draft: {timesheets.filter(t => t.status === "draft").length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
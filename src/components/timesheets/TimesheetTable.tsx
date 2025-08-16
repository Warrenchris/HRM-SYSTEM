import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTimesheetTableDataQuery, TimesheetTableEntry } from "@/hooks/queries/useTimesheetQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export function TimesheetTable() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const { toast } = useToast();
  const { employee } = useCurrentEmployee();
  const { data: timesheets = [], isLoading } = useTimesheetTableDataQuery(employee?.id);

  const getStatusBadge = (status: TimesheetTableEntry["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><AlertCircle className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-green-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
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

  const handleDownload = (id: string) => {
    toast({
      title: "Download Started",
      description: "Timesheet download has been initiated",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timesheets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No timesheets found</h3>
            <p className="text-sm text-muted-foreground">Start tracking your time to see your timesheets here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Timesheets</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="last">Last Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Billable Hours</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheets.map((timesheet) => (
              <TableRow key={timesheet.id}>
                <TableCell className="font-medium">{timesheet.week}</TableCell>
                <TableCell>{timesheet.period}</TableCell>
                <TableCell>{timesheet.totalHours.toFixed(1)}h</TableCell>
                <TableCell>{timesheet.billableHours.toFixed(1)}h</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {timesheet.projects.slice(0, 2).map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                    {timesheet.projects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{timesheet.projects.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
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
                      onClick={() => handleDownload(timesheet.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
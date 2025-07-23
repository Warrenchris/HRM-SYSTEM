import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Download, Search, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const payrollHistory = [
  {
    id: "PAY-2024-01",
    period: "January 2024",
    payDate: "2024-01-31",
    employees: 48,
    grossTotal: 2850000,
    netTotal: 2035750,
    totalDeductions: 814250,
    status: "completed"
  },
  {
    id: "PAY-2023-12",
    period: "December 2023",
    payDate: "2023-12-31",
    employees: 46,
    grossTotal: 2750000,
    netTotal: 1962500,
    totalDeductions: 787500,
    status: "completed"
  },
  {
    id: "PAY-2023-11",
    period: "November 2023",
    payDate: "2023-11-30",
    employees: 45,
    grossTotal: 2625000,
    netTotal: 1875000,
    totalDeductions: 750000,
    status: "completed"
  },
  {
    id: "PAY-2023-10",
    period: "October 2023",
    payDate: "2023-10-31",
    employees: 44,
    grossTotal: 2580000,
    netTotal: 1841400,
    totalDeductions: 738600,
    status: "completed"
  },
  {
    id: "PAY-2023-09",
    period: "September 2023",
    payDate: "2023-09-30",
    employees: 42,
    grossTotal: 2450000,
    netTotal: 1750500,
    totalDeductions: 699500,
    status: "completed"
  },
  {
    id: "PAY-2023-08",
    period: "August 2023",
    payDate: "2023-08-31",
    employees: 41,
    grossTotal: 2380000,
    netTotal: 1700600,
    totalDeductions: 679400,
    status: "completed"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    case "processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function PayrollHistory() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("2024");
  
  const filteredHistory = payrollHistory.filter(payroll => {
    const matchesSearch = payroll.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === "all" || payroll.period.includes(yearFilter);
    return matchesSearch && matchesYear;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll History</CardTitle>
        <CardDescription>
          View and manage historical payroll records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search payroll records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={() => toast({
              title: "Exporting Report",
              description: "Preparing comprehensive payroll report for download",
            })}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead className="text-center">Employees</TableHead>
                <TableHead className="text-right">Gross Total</TableHead>
                <TableHead className="text-right">Total Deductions</TableHead>
                <TableHead className="text-right">Net Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">{payroll.id}</TableCell>
                  <TableCell>{payroll.period}</TableCell>
                  <TableCell>{payroll.payDate}</TableCell>
                  <TableCell className="text-center">{payroll.employees}</TableCell>
                  <TableCell className="text-right font-medium">
                    KSh {payroll.grossTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    KSh {payroll.totalDeductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    KSh {payroll.netTotal.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "Viewing Payroll",
                          description: `Opening payroll details for ${payroll.period}`,
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "Downloading Report",
                          description: `Preparing report for ${payroll.period}`,
                        })}
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
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payroll records found matching your criteria.</p>
          </div>
        )}
        
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Year-to-Date Summary (2024)</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold">KSh 2.85M</p>
              <p className="text-sm text-muted-foreground">Total Gross Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">KSh 814K</p>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">KSh 2.04M</p>
              <p className="text-sm text-muted-foreground">Total Net Paid</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
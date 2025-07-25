import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SystemLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  details: any;
  ip_address: unknown;
  user_agent: string | null;
  severity: string;
  created_at: string;
}

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [selectedSeverity, selectedResourceType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (selectedSeverity !== "all") {
        query = query.eq("severity", selectedSeverity);
      }

      if (selectedResourceType !== "all") {
        query = query.eq("resource_type", selectedResourceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch system logs",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: SystemLog["severity"]) => {
    const variants = {
      info: "default",
      warning: "secondary",
      error: "destructive",
      critical: "destructive",
    } as const;

    return (
      <Badge variant={variants[severity]} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const downloadLogs = () => {
    try {
      const csvContent = [
        ["Timestamp", "Action", "Resource Type", "Resource ID", "Severity", "Details"].join(","),
        ...logs.map(log => [
          format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
          log.action,
          log.resource_type,
          log.resource_id || "",
          log.severity,
          JSON.stringify(log.details).replace(/,/g, ";")
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "System logs downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download logs",
      });
    }
  };

  const resourceTypes = [...new Set(logs.map(log => log.resource_type))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          System Logs
        </CardTitle>
        <CardDescription>
          View and download system activity logs for auditing and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {resourceTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs} disabled={logs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium capitalize">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.resource_id}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {log.details && typeof log.details === 'object' ? (
                          <span className="text-sm text-muted-foreground">
                            {Object.entries(log.details).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(", ")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {log.details || "No details"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {logs.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing latest {logs.length} log entries
          </div>
        )}
      </CardContent>
    </Card>
  );
}
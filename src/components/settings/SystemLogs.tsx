import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { getActivityDescription } from "@/utils/logging";

interface SystemLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  details: any;
  ip_address: unknown;
  user_agent: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

interface UserInfo {
  name: string;
  email: string;
}

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const { toast } = useToast();
  
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLogs();
  }, [selectedSeverity, selectedResourceType, selectedTimeRange, page, searchQuery]);

  useEffect(() => {
    // Only subscribe if the user has access to view logs
    if (!hasAccess) return;
    const subscription = supabase
      .channel('system_logs_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'system_logs' 
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [hasAccess]);

  // Check access once on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data, error } = await supabase.rpc('get_current_user_role');
        if (error) {
          console.error('Error checking user role:', error);
          setHasAccess(false);
          setLoading(false);
          return;
        }
        const isAdmin = (data as unknown as string) === 'admin';
        setHasAccess(isAdmin);
        if (!isAdmin) {
          setLoading(false);
        } else {
          fetchLogs();
        }
      } catch (e) {
        console.error('Unexpected error checking access:', e);
        setHasAccess(false);
        setLoading(false);
      }
    };
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    if (!hasAccess) return;
    setLoading(true);
    try {
      // Calculate time range
      const now = new Date();
      let startDate = new Date();
      switch (selectedTimeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = subDays(now, 1);
          break;
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        default:
          startDate = subDays(now, 1); // Default to 24h
      }

      // Count total records for pagination
      const countQuery = supabase
        .from("system_logs")
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      if (selectedSeverity !== "all") {
        countQuery.eq("severity", selectedSeverity);
      }

      if (selectedResourceType !== "all") {
        countQuery.eq("resource_type", selectedResourceType);
      }

      if (searchQuery) {
        const term = searchQuery.replace(/[,]/g, "");
        countQuery.or(`action.ilike.%${term}%,resource_type.ilike.%${term}%,details::text.ilike.%${term}%`);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Fetch paginated logs
      // First get the logs
      let query = supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .gte('created_at', startDate.toISOString())
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (selectedSeverity !== "all") {
        query = query.eq("severity", selectedSeverity);
      }

      if (selectedResourceType !== "all") {
        query = query.eq("resource_type", selectedResourceType);
      }

      if (searchQuery) {
        const term = searchQuery.replace(/[,]/g, "");
        query = query.or(`action.ilike.%${term}%,resource_type.ilike.%${term}%,details::text.ilike.%${term}%`);
      }

      const { data: logs, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;

      // Then get user info for these logs if there are user_ids
      const userIds = Array.from(new Set(logs.map(log => log.user_id).filter(Boolean)));
      
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('user_id, employees(first_name, last_name, email)')
          .in('user_id', userIds);

        if (userError) {
          console.error('Error fetching user profiles:', userError);
        } else if (users) {
          const userMap = users.reduce((acc: Record<string, any>, user) => {
            if (user.employees) {
              acc[user.user_id] = {
                name: `${user.employees.first_name} ${user.employees.last_name}`,
                email: user.employees.email
              };
            }
            return acc;
          }, {});
          setUserMap(userMap);
        }
      }

      setLogs(logs || []);
    } catch (error: any) {
      console.error("Error fetching system logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch system logs${error?.message ? `: ${error.message}` : ''}`,
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

          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="search"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />

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
                      <div className="max-w-xs space-y-1">
                        {userMap[log.user_id || ''] && (
                          <div className="text-sm font-medium">
                            {userMap[log.user_id || ''].name}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {getActivityDescription(log.action, log.resource_type, log.details)}
                        </div>
                        {log.details && typeof log.details === 'object' && (
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            {Object.entries(log.details)
                              .filter(([key]) => key !== 'message')
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </div>
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
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wrench,
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Users
} from "lucide-react";
import { format, isSameDay, isWithinInterval, startOfMonth, endOfMonth, addMonths, subMonths, addDays } from "date-fns";

interface MaintenanceEvent {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  type: "routine" | "repair" | "inspection" | "replacement";
  date: Date;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "critical";
  estimatedDuration: number; // in hours
  assignedTo?: string;
  description: string;
  cost?: number;
}

const mockMaintenanceEvents: MaintenanceEvent[] = [
  {
    id: "M001",
    assetId: "AST001",
    assetName: "MacBook Pro 16\"",
    assetTag: "IT-2024-001",
    type: "routine",
    date: new Date("2025-05-01"),
    status: "scheduled",
    priority: "low",
    estimatedDuration: 2,
    assignedTo: "IT Support",
    description: "Routine cleaning and software updates",
  },
  {
    id: "M002",
    assetId: "AST004",
    assetName: "Toyota Camry 2023",
    assetTag: "VEH-2023-001",
    type: "routine",
    date: new Date("2025-02-01"),
    status: "scheduled",
    priority: "medium",
    estimatedDuration: 4,
    assignedTo: "Fleet Services",
    description: "Oil change and general inspection",
    cost: 450
  },
  {
    id: "M003",
    assetId: "AST003",
    assetName: "Dell Monitor 27\"",
    assetTag: "IT-2024-045",
    type: "repair",
    date: new Date("2025-01-25"),
    status: "in_progress",
    priority: "high",
    estimatedDuration: 3,
    assignedTo: "External Technician",
    description: "Follow-up repair for screen flickering",
    cost: 120
  },
  {
    id: "M004",
    assetId: "AST002",
    assetName: "Herman Miller Desk Chair",
    assetTag: "FUR-2024-025",
    type: "inspection",
    date: new Date("2025-01-30"),
    status: "scheduled",
    priority: "low",
    estimatedDuration: 1,
    description: "Annual safety inspection",
  },
  {
    id: "M005",
    assetId: "AST005",
    assetName: "Epson Printer L3150",
    assetTag: "IT-2024-078",
    type: "routine",
    date: new Date("2025-02-15"),
    status: "scheduled",
    priority: "low",
    estimatedDuration: 1,
    assignedTo: "IT Support",
    description: "Printer head cleaning and calibration",
  },
  {
    id: "M006",
    assetId: "AST006",
    assetName: "Conference Room Projector",
    assetTag: "IT-2024-089",
    type: "repair",
    date: new Date("2025-01-20"),
    status: "overdue",
    priority: "critical",
    estimatedDuration: 6,
    assignedTo: "AV Technician",
    description: "Lamp replacement - urgent",
    cost: 200
  }
];

const statusConfig = {
  scheduled: { color: "bg-blue-500", label: "Scheduled" },
  in_progress: { color: "bg-yellow-500", label: "In Progress" },
  completed: { color: "bg-green-500", label: "Completed" },
  overdue: { color: "bg-red-500", label: "Overdue" }
};

const priorityConfig = {
  low: { color: "text-green-600", label: "Low" },
  medium: { color: "text-yellow-600", label: "Medium" },
  high: { color: "text-orange-600", label: "High" },
  critical: { color: "text-red-600", label: "Critical" }
};

const typeConfig = {
  routine: { icon: Wrench, label: "Routine" },
  repair: { icon: AlertTriangle, label: "Repair" },
  inspection: { icon: CheckCircle, label: "Inspection" },
  replacement: { icon: Package, label: "Replacement" }
};

export function AssetCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const getEventsForDate = (date: Date) => {
    return mockMaintenanceEvents.filter(event => {
      const matchesDate = isSameDay(event.date, date);
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || event.priority === priorityFilter;
      return matchesDate && matchesStatus && matchesPriority;
    });
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const getUpcomingEvents = () => {
    return mockMaintenanceEvents
      .filter(event => event.date >= new Date() && (statusFilter === "all" || event.status === statusFilter))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const modifiers = {
    hasEvents: (date: Date) => getEventsForDate(date).length > 0,
    hasOverdue: (date: Date) => getEventsForDate(date).some(e => e.status === "overdue"),
    hasCritical: (date: Date) => getEventsForDate(date).some(e => e.priority === "critical"),
  };

  const modifiersStyles = {
    hasEvents: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      borderRadius: "6px",
    },
    hasOverdue: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      borderRadius: "6px",
    },
    hasCritical: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      borderRadius: "6px",
    },
  };

  const getStatusBadge = (status: MaintenanceEvent["status"]) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: MaintenanceEvent["priority"]) => {
    const config = priorityConfig[priority];
    return (
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>
              View and manage asset maintenance calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentDate}
              onMonthChange={setCurrentDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border w-full"
            />

            {/* Legend */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Legend</h4>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Has Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive" />
                  <span>Overdue/Critical</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a Date"}
            </CardTitle>
            <CardDescription>
              {getEventsForSelectedDate().length} maintenance event(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForSelectedDate().length > 0 ? (
                getEventsForSelectedDate().map((event) => {
                  const TypeIcon = typeConfig[event.type].icon;
                  return (
                    <div key={event.id} className="p-3 rounded-lg border bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{event.assetName}</div>
                            <div className="text-xs text-muted-foreground">{event.assetTag}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(event.status)}
                            {getPriorityBadge(event.priority)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <TypeIcon className="h-3 w-3" />
                          <span>{typeConfig[event.type].label}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{event.estimatedDuration}h</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        
                        {event.assignedTo && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Assigned to: </span>
                            <span className="font-medium">{event.assignedTo}</span>
                          </div>
                        )}
                        
                        {event.cost && (
                          <div className="text-xs font-medium text-green-600">
                            Est. Cost: {formatCurrency(event.cost)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No maintenance events for this date
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
          <CardDescription>
            Next 5 scheduled maintenance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getUpcomingEvents().map((event) => {
              const TypeIcon = typeConfig[event.type].icon;
              return (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{event.assetName}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.description} • {format(event.date, "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(event.priority)}
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
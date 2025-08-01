import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Timeline component removed - using simple list instead
import { Search, Filter, History, MapPin, User, Wrench, Package, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface AssetHistoryEvent {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  eventType: "purchase" | "assignment" | "movement" | "maintenance" | "repair" | "disposal" | "update";
  date: Date;
  description: string;
  performedBy: string;
  previousValue?: string;
  newValue?: string;
  cost?: number;
  location?: string;
  notes?: string;
}

const mockHistoryEvents: AssetHistoryEvent[] = [
  {
    id: "H001",
    assetId: "AST001",
    assetName: "MacBook Pro 16\"",
    assetTag: "IT-2024-001",
    eventType: "maintenance",
    date: new Date("2024-11-01"),
    description: "Routine maintenance and software update",
    performedBy: "IT Support Team",
    cost: 0,
    notes: "Updated to macOS Sequoia, cleaned internals, battery health: 98%"
  },
  {
    id: "H002",
    assetId: "AST001",
    assetName: "MacBook Pro 16\"",
    assetTag: "IT-2024-001",
    eventType: "assignment",
    date: new Date("2024-01-20"),
    description: "Assigned to employee",
    performedBy: "HR Department",
    previousValue: "Unassigned",
    newValue: "John Doe",
    location: "Office Floor 2"
  },
  {
    id: "H003",
    assetId: "AST001",
    assetName: "MacBook Pro 16\"",
    assetTag: "IT-2024-001",
    eventType: "purchase",
    date: new Date("2024-01-15"),
    description: "Asset purchased and added to inventory",
    performedBy: "Procurement Team",
    cost: 2499,
    location: "IT Storage",
    notes: "Purchased from Apple Store for new hire onboarding"
  },
  {
    id: "H004",
    assetId: "AST003",
    assetName: "Dell Monitor 27\"",
    assetTag: "IT-2024-045",
    eventType: "repair",
    date: new Date("2025-01-10"),
    description: "Screen flickering issue repair",
    performedBy: "External Technician",
    cost: 85,
    location: "IT Storage",
    notes: "Replaced backlight inverter, 6 month warranty on repair"
  },
  {
    id: "H005",
    assetId: "AST004",
    assetName: "Toyota Camry 2023",
    assetTag: "VEH-2023-001",
    eventType: "maintenance",
    date: new Date("2024-12-01"),
    description: "Regular service maintenance",
    performedBy: "Fleet Services",
    cost: 450,
    notes: "Oil change, tire rotation, brake inspection - next service due Feb 2025"
  },
  {
    id: "H006",
    assetId: "AST002",
    assetName: "Herman Miller Desk Chair",
    assetTag: "FUR-2024-025",
    eventType: "movement",
    date: new Date("2024-06-15"),
    description: "Asset relocated",
    performedBy: "Facilities Team",
    previousValue: "Office Floor 2",
    newValue: "Office Floor 1",
    notes: "Moved due to office reorganization"
  }
];

const eventTypeConfig = {
  purchase: { color: "bg-green-500", label: "Purchase", icon: Package },
  assignment: { color: "bg-blue-500", label: "Assignment", icon: User },
  movement: { color: "bg-purple-500", label: "Movement", icon: MapPin },
  maintenance: { color: "bg-yellow-500", label: "Maintenance", icon: Wrench },
  repair: { color: "bg-orange-500", label: "Repair", icon: Wrench },
  disposal: { color: "bg-red-500", label: "Disposal", icon: Package },
  update: { color: "bg-gray-500", label: "Update", icon: Package }
};

export function AssetHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  const filteredEvents = mockHistoryEvents.filter((event) => {
    const matchesSearch = event.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === "all" || event.eventType === eventTypeFilter;
    const matchesAsset = assetFilter === "all" || event.assetId === assetFilter;
    
    // Date range filter
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24));
    const matchesDateRange = dateRange === "all" || daysDiff <= parseInt(dateRange);
    
    return matchesSearch && matchesEventType && matchesAsset && matchesDateRange;
  });

  const getEventBadge = (eventType: AssetHistoryEvent["eventType"]) => {
    const config = eventTypeConfig[eventType];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Events list is now rendered directly

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Asset History & Audit Trail
        </CardTitle>
        <CardDescription>
          Complete log of all asset activities, maintenance, and changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by asset name, tag, description, or performer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="movement">Movement</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="disposal">Disposal</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-lg font-bold">{filteredEvents.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-lg font-bold">
                {filteredEvents.filter(e => e.eventType === "maintenance").length}
              </div>
              <div className="text-xs text-muted-foreground">Maintenance Events</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-lg font-bold">
                {formatCurrency(filteredEvents.reduce((sum, e) => sum + (e.cost || 0), 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Costs</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-lg font-bold">
                {new Set(filteredEvents.map(e => e.assetId)).size}
              </div>
              <div className="text-xs text-muted-foreground">Assets Involved</div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredEvents.length} events
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border-l-2 border-muted pl-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  {getEventBadge(event.eventType)}
                  <span className="text-sm font-medium">{event.assetName}</span>
                  <span className="text-xs text-muted-foreground">({event.assetTag})</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(event.date), "PPP 'at' p")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No events found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Edit, Trash2, MapPin, Wrench, QrCode } from "lucide-react";
import { format } from "date-fns";

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  status: "active" | "maintenance" | "retired" | "needs_attention";
  location: string;
  assignedTo?: string;
  purchaseDate: Date;
  purchaseValue: number;
  currentValue: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  condition: "excellent" | "good" | "fair" | "poor";
  warranty?: Date;
}

interface AssetTableProps {
  filterType?: "all" | "maintenance" | "alerts";
}

const mockAssets: Asset[] = [
  {
    id: "AST001",
    name: "MacBook Pro 16\"",
    assetTag: "IT-2024-001",
    category: "IT Equipment",
    status: "active",
    location: "Office Floor 2",
    assignedTo: "John Doe",
    purchaseDate: new Date("2024-01-15"),
    purchaseValue: 2499,
    currentValue: 2000,
    lastMaintenance: new Date("2024-11-01"),
    nextMaintenance: new Date("2025-05-01"),
    condition: "excellent",
    warranty: new Date("2027-01-15")
  },
  {
    id: "AST002",
    name: "Herman Miller Desk Chair",
    assetTag: "FUR-2024-025",
    category: "Office Furniture",
    status: "active",
    location: "Office Floor 1",
    assignedTo: "Jane Smith",
    purchaseDate: new Date("2024-03-10"),
    purchaseValue: 850,
    currentValue: 680,
    condition: "good"
  },
  {
    id: "AST003",
    name: "Dell Monitor 27\"",
    assetTag: "IT-2024-045",
    category: "IT Equipment",
    status: "maintenance",
    location: "IT Storage",
    purchaseDate: new Date("2023-08-22"),
    purchaseValue: 450,
    currentValue: 300,
    lastMaintenance: new Date("2025-01-10"),
    condition: "fair"
  },
  {
    id: "AST004",
    name: "Toyota Camry 2023",
    assetTag: "VEH-2023-001",
    category: "Vehicles",
    status: "needs_attention",
    location: "Parking Lot A",
    assignedTo: "Fleet Manager",
    purchaseDate: new Date("2023-06-15"),
    purchaseValue: 28500,
    currentValue: 24000,
    lastMaintenance: new Date("2024-12-01"),
    nextMaintenance: new Date("2025-02-01"),
    condition: "good"
  },
  {
    id: "AST005",
    name: "Epson Printer L3150",
    assetTag: "IT-2024-078",
    category: "IT Equipment",
    status: "active",
    location: "Office Floor 3",
    purchaseDate: new Date("2024-05-20"),
    purchaseValue: 200,
    currentValue: 150,
    condition: "excellent"
  }
];

const statusConfig = {
  active: { color: "bg-green-500", label: "Active" },
  maintenance: { color: "bg-yellow-500", label: "Maintenance" },
  retired: { color: "bg-gray-500", label: "Retired" },
  needs_attention: { color: "bg-red-500", label: "Needs Attention" }
};

const conditionConfig = {
  excellent: { color: "text-green-600", label: "Excellent" },
  good: { color: "text-blue-600", label: "Good" },
  fair: { color: "text-yellow-600", label: "Fair" },
  poor: { color: "text-red-600", label: "Poor" }
};

export function AssetTable({ filterType = "all" }: AssetTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const filteredAssets = mockAssets.filter((asset) => {
    // Apply filterType prop
    if (filterType === "maintenance" && asset.status !== "maintenance") return false;
    if (filterType === "alerts" && asset.status !== "needs_attention") return false;

    // Apply search and other filters
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesLocation = locationFilter === "all" || asset.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const getStatusBadge = (status: Asset["status"]) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        {config.label}
      </Badge>
    );
  };

  const getConditionBadge = (condition: Asset["condition"]) => {
    const config = conditionConfig[condition];
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Asset Inventory
          {filterType === "maintenance" && " - Maintenance Queue"}
          {filterType === "alerts" && " - Requiring Attention"}
        </CardTitle>
        <CardDescription>
          {filterType === "all" && "Manage and track all company assets"}
          {filterType === "maintenance" && "Assets currently under maintenance or scheduled for service"}
          {filterType === "alerts" && "Assets that require immediate attention or action"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by asset name, tag, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filterType === "all" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="IT Equipment">IT Equipment</SelectItem>
              <SelectItem value="Office Furniture">Office Furniture</SelectItem>
              <SelectItem value="Vehicles">Vehicles</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Office Floor 1">Office Floor 1</SelectItem>
              <SelectItem value="Office Floor 2">Office Floor 2</SelectItem>
              <SelectItem value="Office Floor 3">Office Floor 3</SelectItem>
              <SelectItem value="IT Storage">IT Storage</SelectItem>
              <SelectItem value="Parking Lot A">Parking Lot A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAssets.length} of {mockAssets.length} assets
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location & Assignment</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.assetTag} • {asset.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {asset.location}
                      </div>
                      {asset.assignedTo && (
                        <div className="text-xs text-muted-foreground">
                          Assigned to: {asset.assignedTo}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatCurrency(asset.currentValue)}</div>
                      <div className="text-muted-foreground">
                        Purchase: {formatCurrency(asset.purchaseValue)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {asset.lastMaintenance && (
                        <div>Last: {format(asset.lastMaintenance, "MMM dd, yyyy")}</div>
                      )}
                      {asset.nextMaintenance && (
                        <div className="text-muted-foreground">
                          Next: {format(asset.nextMaintenance, "MMM dd, yyyy")}
                        </div>
                      )}
                      {!asset.lastMaintenance && !asset.nextMaintenance && (
                        <span className="text-muted-foreground">No schedule</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {asset.status === "active" && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Wrench className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No assets found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
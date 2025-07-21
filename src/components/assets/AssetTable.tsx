import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Edit, Trash2, MapPin, Wrench, QrCode, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransferAssetDialog } from "./TransferAssetDialog";

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  status: string;
  location: string;
  current_employee_id?: string;
  purchase_date: string;
  purchase_value: number;
  current_value?: number;
  condition: string;
  warranty_date?: string;
  vendor?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  serial_number?: string;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

interface AssetTableProps {
  filterType?: "all" | "maintenance" | "alerts";
}

const statusConfig = {
  available: { color: "bg-green-500", label: "Available" },
  assigned: { color: "bg-blue-500", label: "Assigned" },
  maintenance: { color: "bg-yellow-500", label: "Maintenance" },
  repair: { color: "bg-orange-500", label: "Repair" },
  return_to_store: { color: "bg-purple-500", label: "Return to Store" },
  write_off: { color: "bg-red-500", label: "Write Off" }
};

const conditionConfig = {
  excellent: { color: "text-green-600", label: "Excellent" },
  good: { color: "text-blue-600", label: "Good" },
  fair: { color: "text-yellow-600", label: "Fair" },
  poor: { color: "text-red-600", label: "Poor" }
};

export function AssetTable({ filterType = "all" }: AssetTableProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          employees:current_employee_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      toast({
        title: "Error fetching assets",
        description: "Could not load assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    // Apply filterType prop
    if (filterType === "maintenance" && !["maintenance", "repair"].includes(asset.status)) return false;
    if (filterType === "alerts" && asset.status !== "repair") return false;

    // Apply search and other filters
    const employeeName = asset.employees ? `${asset.employees.first_name} ${asset.employees.last_name}` : "";
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesLocation = locationFilter === "all" || asset.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      return (
        <Badge variant="outline" className="bg-gray-500 text-white border-transparent">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className={`${config.color} text-white border-transparent`}>
        {config.label}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const config = conditionConfig[condition as keyof typeof conditionConfig];
    if (!config) {
      return (
        <span className="text-xs font-medium text-gray-600">
          {condition}
        </span>
      );
    }
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

  const handleTransferAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setTransferDialogOpen(true);
  };

  const handleTransferComplete = () => {
    fetchAssets(); // Refresh the assets list
    setTransferDialogOpen(false);
    setSelectedAsset(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading assets...</div>;
  }

  return (
    <>
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="return_to_store">Return to Store</SelectItem>
                  <SelectItem value="write_off">Write Off</SelectItem>
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
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Parking Lot A">Parking Lot A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} assets
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
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const employeeName = asset.employees 
                    ? `${asset.employees.first_name} ${asset.employees.last_name}`
                    : null;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.asset_tag} • {asset.category}
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
                          {employeeName && (
                            <div className="text-xs text-muted-foreground">
                              Assigned to: {employeeName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCurrency(asset.current_value || asset.purchase_value)}
                          </div>
                          <div className="text-muted-foreground">
                            Purchase: {formatCurrency(asset.purchase_value)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(asset.purchase_date), "MMM dd, yyyy")}
                          {asset.warranty_date && (
                            <div className="text-muted-foreground">
                              Warranty: {format(new Date(asset.warranty_date), "MMM dd, yyyy")}
                            </div>
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleTransferAsset(asset)}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          {asset.status === "assigned" && (
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
                  );
                })}
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

      {selectedAsset && (
        <TransferAssetDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          asset={selectedAsset}
          onTransferComplete={handleTransferComplete}
        />
      )}
    </>
  );
}